/**
*	Creates translation documents
*
*	@input ProjectID: String
*	@input LocaleFrom: String
*	@input LocaleTo: String
*	@input ItemType: String
*	@input CatalogID: String
*	@input Attributes: String
*	@input Items: String
*	@input AutoLaunch: String
*
*/
importPackage( dw.system );
importPackage( dw.catalog );
importPackage( dw.util );

importClass( dw.web.Resource );
importClass( dw.content.ContentMgr );
importClass( dw.object.CustomObjectMgr );

// Lib Includes
var LogUtils = require('~/cartridge/scripts/utils/LogUtils'),
	Utils = require('~/cartridge/scripts/utils/Utils');

// Global variables
var log = LogUtils.getLogger("CreateTranslation");

function execute( pdict : PipelineDictionary ) : Number
{
	var input, output;
	
	input = {
		ProjectID: pdict.ProjectID,
		LocaleFrom: pdict.LocaleFrom,
		LocaleTo: pdict.LocaleTo,
		ItemType: pdict.ItemType,
		CatalogID: pdict.CatalogID,
		Attributes: pdict.Attributes,
		Items: pdict.Items,
		AutoLaunch: pdict.AutoLaunch
	};
	output = getOutput(input);
	response.getWriter().println(output);
	
   	return PIPELET_NEXT;
}

function getOutput(input){
	var projectID = input.ProjectID,
		localeFrom = input.LocaleFrom,
		localeTo = JSON.parse(input.LocaleTo),
		itemType = input.ItemType,
		catalogID = input.CatalogID,
		attributes = JSON.parse(input.Attributes),
		items = JSON.parse(input.Items),
		autoLaunch = input.AutoLaunch,
		categoryCode = Site.getCurrent().getCustomPreferenceValue('TMCategoryCode') || "",
		calendarDate = Calendar(),
		bulkLimit = Resource.msg("api.bulk.doc.limit","textmaster",null) || 20,
		bulkLimitCount = 0,
		itemCount = 0,
		projectPostData, projectEndPoint, project, projectResult,
		documents, document, item, customData, itemData, markupFlag, contentValue, i, attr, itemAttrs, itemAttr,
		attrData, updateRequest, avoidItems = [];
	
	bulkLimit = isNaN(bulkLimit) ? 25 : parseInt(bulkLimit, 10);
	
	if(localeTo){
		if(empty(projectID)){
			projectPostData = {};
			project = {};
			
			project.name = Utils.firstLetterCapital(itemType) +" - "+ localeTo.template.name + " - " + StringUtils.formatCalendar(Calendar(calendarDate), 'yyyy-MM-dd') ;
			project.ctype = Resource.msg("constant.translation","textmaster",null);
			project.language_from = localeFrom;
			project.language_to = localeTo.id;
			project.category = categoryCode;
			project.project_briefing = Resource.msg("constant.briefing","textmaster",null);
			project.options = {language_level: Resource.msg("constant.enterprise","textmaster",null)};
			project.api_template_id = localeTo.template.id;
			project.custom_data = {
				itemType: itemType,
				catalogID: catalogID
			};
			
			projectPostData.project = project;
			projectEndPoint = Resource.msg("api.get.project","textmaster",null);
			log.debug("Request: POST " + projectEndPoint + " " + JSON.stringify(projectPostData));
			projectResult = Utils.TextMasterClient("POST",projectEndPoint, JSON.stringify(projectPostData));
			log.debug("response: " + JSON.stringify(projectResult));
			
			if(projectResult && projectResult.id != undefined){
				projectID = projectResult.id;
			}
		}
		
		if(projectID){
			documents = [];
			var dwLocaleID = Utils.formatLocaleDemandware(localeFrom);
			request.setLocale(dwLocaleID);
			
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
									contentValue = (attr.id == "shortDescription" || attr.id == "longDescription") ? (item[attr.id] ? (item[attr.id].source ? item[attr.id].source : item[attr.id]) : "") : item.attributeModel.getDisplayValue(itemAttr);
									
									if(contentValue){
										contentValue = contentValue.source ? contentValue.source : contentValue;
										itemData[attr.id] = contentValue;
									}
								}
							}
							break;
						case "content":
						case "category":
							contentValue = attr.type == "system" ? (item[attr.id] || "") : (item.custom[attr.id] ? (item.custom[attr.id].source ? item.custom[attr.id].source : item.custom[attr.id]) : "");
							
							if(contentValue){
								contentValue = contentValue.source ? contentValue.source : contentValue;
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
				
				if(customData.length){
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
					bulkLimitCount++;
				}
				else{
					// No content to be exported
					avoidItems.push(item.ID);
				}
				
				itemCount++;
				
				if(bulkLimitCount == bulkLimit || itemCount == items.length){
					postBulkDocuments(documents, projectID, autoLaunch);
					
					if(autoLaunch.toLowerCase() == "true"){
						setAutoLaunchCustomObject(projectID, documents.length);
					}
					
					bulkLimitCount = 0;
					documents = [];
				}
			}
			
			if(avoidItems.length){
				log.debug("Failed ("+ avoidItems.length +") "+ Utils.firstLetterCapital(itemType) +" items to export [No contents]: " + JSON.stringify(avoidItems));
			}
		}
	}
	
	// Returns project ID if only one project is created. On result page template this project ID is used to go to TextMaster specific project page. Else to go to project list page. 
	return projectID;
}

/*
 * Send documents to API to create bulk documents
 * */
function postBulkDocuments(documents, projectID, autoLaunch){
	var documentPostData = {},
		tmSFpassword = Site.getCurrent().getCustomPreferenceValue('TMSFpassword') || "",
		sfProtectionURLpart = (Site.current.status === Site.SITE_STATUS_PROTECTED) ? (Resource.msg("storefront.username","textmaster",null) + ":" + tmSFpassword + "@") : "",
		documentEndPoint, documentResult, documentID, wordCount, key, callBackURL, autoLaunchCallBackURL;
	
	documentPostData.documents = documents;
	documentEndPoint = Resource.msg("api.get.project","textmaster",null) + "/" + projectID + "/" + Resource.msg("api.post.documents","textmaster",null);
	log.debug("Request: POST " + documentEndPoint + " " + JSON.stringify(documentPostData));
	documentResult = Utils.TextMasterClient("POST",documentEndPoint, JSON.stringify(documentPostData));
	log.debug("Response: " + JSON.stringify(documentResult));
	
	if(documentResult){
		for each(document in documentResult){
			documentID = document.id;
			// document edit
			documentEndPoint = Resource.msg("api.get.project","textmaster",null) + "/" + projectID + "/" + Resource.msg("api.get.document","textmaster",null) + "/" + documentID;
			
			wordCount = 0;
			for(key in document.original_content){
				wordCount += Utils.getWordCount(document.original_content[key].original_phrase);
			}
			
			callBackURL = "https://"+ sfProtectionURLpart + System.instanceHostname +"/on/demandware.store/Sites-"+ Site.current.ID +"-Site/default/TMImport-Data?projectid="+ projectID +"&documentid="+ documentID;
			autoLaunchCallBackURL = autoLaunch.toLowerCase() == "true" ? "https://"+ sfProtectionURLpart + System.instanceHostname +"/on/demandware.store/Sites-"+ Site.current.ID +"-Site/default/TMAutoLaunch-Document?projectid="+ projectID +"&documentid="+ documentID : "";
			
			documentPostData = {
				document: {
					callback: {
						in_review: {
							url: callBackURL
						},
						completed: {
							url: callBackURL
						}
					},
					word_count: wordCount
				}
			};
			
			if(autoLaunchCallBackURL){
				documentPostData.document.callback.word_count_finished = {url: autoLaunchCallBackURL};
			}
			log.debug("Request: PUT " + documentEndPoint + " " + JSON.stringify(documentPostData));
			documentResult = Utils.TextMasterClient("PUT",documentEndPoint, JSON.stringify(documentPostData));
			log.debug("Response: " + JSON.stringify(documentResult));
		}
	}
}

/* Prepare Custom Object for Auto Launch feature
 * Keeping total number of documents in a project, in custom object.
 * */
function setAutoLaunchCustomObject(projectID, count){
	var customObjectName = Resource.msg("autolaunch.customobject.name","textmaster",null),
		customObjectInstanceID = projectID;
	try{
		var dataHolder = CustomObjectMgr.getCustomObject(customObjectName, customObjectInstanceID);
		
		if(dataHolder == null){
			Transaction.begin();
			dataHolder = CustomObjectMgr.createCustomObject(customObjectName, customObjectInstanceID);
			dataHolder.custom.documentCount = count;
			dataHolder.custom.documents = "[]";
			Transaction.commit();
		}
		else{
			Transaction.begin();
			dataHolder.custom.documentCount += count;
			Transaction.commit();
		}
	}
	catch(ex){
		log.error(ex.message + " - No custom object found.");
	}
}

module.exports = {
	output: function(input){
		return getOutput(input);
	}
}
