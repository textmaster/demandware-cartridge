/**
*	Creates translation documents
*
*	@input LocaleFrom: String
*	@input LocaleTo: String
*	@input ItemType: String
*	@input CatalogID: String
*	@input Attributes: String
*	@input Items: String
*
*/
importPackage( dw.system );
importPackage( dw.catalog );
importPackage( dw.util );

importClass( dw.web.Resource );
importClass( dw.content.ContentMgr );

// Lib Includes
var LogUtils = require('~/cartridge/scripts/utils/LogUtils'),
	Utils = require('~/cartridge/scripts/utils/Utils');

// Global variables
var log;

function execute( pdict : PipelineDictionary ) : Number
{
	var input, output;
	
	input = {
		LocaleFrom: pdict.LocaleFrom,
		LocaleTo: pdict.LocaleTo,
		ItemType: pdict.ItemType,
		CatalogID: pdict.CatalogID,
		Attributes: pdict.Attributes,
		Items: pdict.Items
	};
	output = getOutput(input);
	response.getWriter().println(output);
	
   	return PIPELET_NEXT;
}

function getOutput(input){
	var localeFrom = JSON.parse(JSON.parse(input.LocaleFrom)),
		localeTo = JSON.parse(JSON.parse(input.LocaleTo)),
		itemType = input.ItemType,
		catalogID = input.CatalogID,
		attributes = JSON.parse(JSON.parse(input.Attributes)),
		items = JSON.parse(JSON.parse(input.Items)),
		categoryCode = Site.getCurrent().getCustomPreferenceValue('TMCategoryCode') || "",
		calendarDate = Calendar(),
		projectPostData, projectEndPoint, project, langTo, projectResult, projectID = "",
		documentID = "", documents, document, documentPostData, documentResult, documentEndPoint, wordCount,
		item, customData, itemData, markupFlag, contentValue, i, attr, itemAttrs, itemAttr, attrData, updateRequest, projectIDs = [];
	
	log = LogUtils.getLogger("CreateTranslation");
	
	for each(langTo in localeTo){
		projectPostData = {};
		project = {};
		
		project.name = Utils.firstLetterCapital(itemType) +" - "+ langTo.template.name + " - " + StringUtils.formatCalendar(Calendar(calendarDate), 'yyyy-MM-dd') ;
		project.ctype = Resource.msg("constant.translation","textmaster",null);
		project.language_from = localeFrom.id;
		project.language_to = langTo.id;
		project.category = categoryCode;
		project.project_briefing = Resource.msg("constant.briefing","textmaster",null);
		project.options = {language_level: Resource.msg("constant.enterprise","textmaster",null)};
		project.api_template_id = langTo.template.id;
		project.custom_data = {
			itemType: itemType,
			catalogID: catalogID
		};
		
		projectPostData.project = project;
		projectEndPoint = Resource.msg("api.get.projects","textmaster",null);
		
		projectResult = Utils.TextMasterClient("POST",projectEndPoint, JSON.stringify(projectPostData));
		
		if(projectResult && projectResult.id != undefined){
			projectID = projectResult.id;
			projectIDs.push(projectID);
			
			documentPostData = {};
			documents = [];
			
			for each(i in items){
				customData = [];
				itemData = {};
				document = {};
				markupFlag = false;
				
				switch(itemType){
					case "product":
						item = ProductMgr.getProduct(i);
						itemAttrs = dw.object.SystemObjectMgr.describe("Product").getAttributeDefinitions().toArray();
						break;
					case "content":
						item = ContentMgr.getContent(i);
						break;
					case "category":
						item = CatalogMgr.getCategory(i);
						break;
				}
				
				for each(attr in attributes){
					attrData = {};
					contentValue = "";
					
					switch(itemType){
						case "product":
							for each(itemAttr in itemAttrs){
								if(attr.id == itemAttr.ID){
									contentValue = (attr.id == "shortDescription" || attr.id == "longDescription") ? item[attr.id].markup : item.attributeModel.getDisplayValue(itemAttr);
									
									if(contentValue){
										itemData[attr.id] = contentValue;
									}
								}
							}
							break;
						case "content":
						case "category":
							contentValue = attr.type == "system" ? (item[attr.id] || "") : (item.custom[attr.id] ? item.custom[attr.id].toString() : "");
							
							if(contentValue){
								itemData[attr.id] = contentValue;
							}
							break;
					}
					
					if(contentValue){
						attrData.id = attr.id;
						attrData.type = attr.type;
						markupFlag = /<[a-z][\s\S]*>/i.test(contentValue) ? true : markupFlag;
						customData.push(attrData);
					}
				}
				
				document.title = itemType +"-"+ i;
				document.original_content = itemData;
				document.type = Resource.msg("constant.key.value","textmaster",null);
				document.perform_word_count = true;
				document.markup_in_content = markupFlag;
				document.custom_data = {
					item:{
						id: item.ID,
						name: (itemType == "category" ? item.displayName : item.name)
					},
					attribute:customData
				};
				
				documents.push(document);
			}
			
			documentPostData.documents = documents;
			documentEndPoint = Resource.msg("api.get.projects","textmaster",null) + "/" + projectID + "/" + Resource.msg("api.post.documents","textmaster",null);
			documentResult = Utils.TextMasterClient("POST",documentEndPoint, JSON.stringify(documentPostData));
			
			if(documentResult){
				for each(document in documentResult){
					documentID = document.id;
					// document edit
					documentEndPoint = Resource.msg("api.get.projects","textmaster",null) + "/" + projectID + "/" + Resource.msg("api.get.documents","textmaster",null) + "/" + documentID;
					
					wordCount = 0;
					for(var key in document.original_content){
						wordCount += Utils.getWordCount(document.original_content[key].original_phrase);
					}
					
					documentPostData = {
						document: {
							callback: {
								in_review: {
									url: "https://"+ System.instanceHostname +"/on/demandware.store/Sites-"+ Site.current.ID +"-Site/default/Import-Data?projectid="+ projectID +"&documentid="+ documentID
								},
								completed: {
									url: "https://"+ System.instanceHostname +"/on/demandware.store/Sites-"+ Site.current.ID +"-Site/default/Import-Data?projectid="+ projectID +"&documentid="+ documentID
								}
							},
							word_count: wordCount
						}
					};
					documentResult = Utils.TextMasterClient("PUT",documentEndPoint, JSON.stringify(documentPostData));
				}
			}
			
			if(langTo.autoLaunch){
				// finalize project
				projectEndPoint = Resource.msg("api.get.projects","textmaster",null) + "/" + projectID + "/" + Resource.msg("api.projects.finalize","textmaster",null);
				projectResult = Utils.TextMasterClient("PUT", projectEndPoint, JSON.stringify({}));
			}
			else{
				Utils.TriggerURL("POST", "https://"+ System.instanceHostname +"/on/demandware.store/Sites-"+ Site.current.ID +"-Site/default/Quote-Send?projectid="+ projectID);
			}
		}
	}
	
	// Returns project ID if only one project is created. On result page template this project ID is used to go to TextMaster specific project page. Else to go to project list page. 
	return (projectIDs.length == 1 ? projectIDs[0] : "");
}

module.exports = {
	output: function(input){
		return getOutput(input);
	}
}
