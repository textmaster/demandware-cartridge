'use strict';
/**
* 	Return Projects data to Follow up:    
*   
*	@output Documents : Array
*
*/

importPackage(dw.system);
importPackage(dw.web);

// Lib Includes
var LogUtils = require('~/cartridge/scripts/utils/LogUtils'),
	Utils = require('~/cartridge/scripts/utils/Utils');

// Global variables
var log = LogUtils.getLogger("getFollowUpList");

function execute( pdict : PipelineDictionary ) : Number
{
	var output = getOutput();
	
	pdict.Documents = output.Documents;
   	
   	return PIPELET_NEXT;
}

function getOutput(){
   	var projects, project, projectResult, documentResult, documentEndPoint,
		projectsEndPoint, documents = [], document, doc, actions, urlAction, urlparam, itemURL, itemPipeline, itemIDLabel, languageID,
		projectPageCount, docPageCount, pageSize = 100, projectRequestFlag, docRequestFlag;
   
   	projectRequestFlag = true;
   	projectPageCount = 0;
   	
   	while(projectRequestFlag){
   		projectPageCount++;
	   	projectsEndPoint = Resource.msg("api.get.projects","textmaster",null) +"?page="+ projectPageCount +"&per_page="+ pageSize;
	   	projectResult = Utils.TextMasterClient("GET", projectsEndPoint );
	   	projects = (projectResult && projectResult.projects) ? projectResult.projects : [];
	   	
	   	for each(project in projects){
	   		docRequestFlag = true;
	   		docPageCount = 0;
	   		
	   		while(docRequestFlag){
	   			docPageCount++;
		   		documentEndPoint = Resource.msg("api.get.projects","textmaster",null) + "/" + project.id +"/"+ Resource.msg("api.get.documents","textmaster",null) +"?page="+ docPageCount +"&per_page="+ pageSize;
		   		documentResult = Utils.TextMasterClient("GET", documentEndPoint);
		   		
		   		if(documentResult && documentResult.documents){
		   			for each(document in documentResult.documents){
		   				doc = document;
		   				doc.project_name = project.name;
		   				doc.project_launch_date = project.launched_at ? (project.launched_at.year || "") +"-"+ (project.launched_at.month || "") +"-"+ (project.launched_at.day || "") : "";
		   				doc.item_type = project.custom_data.itemType;
		   				doc.locale = Utils.getLocaleName(project.language_to_code);
		   				actions = [];
		   				
		   				switch(doc.status.toLowerCase()){
		   					case "in_creation":
		   						actions.push({
		   							text: Resource.msg("follow.action.view.project","textmaster",null),
		   							link: Resource.msgf("link.view.project","textmaster",null,project.id)
		   						});
		   						break;
		   					case "in_progress":
		   					case "waiting_assignment":
		   					case "quality_control":
		   						actions.push({
		   							text: Resource.msg("follow.action.view.document","textmaster",null),
		   							link: Resource.msgf("link.view.document","textmaster",null,project.id,doc.id)
		   						});
		   						break;
		   					case "in_review":
		   						switch(doc.item_type.toLowerCase()){
		   							case "product":
		   								itemPipeline = "Product-Show";
		   								itemIDLabel = 'pid';
		   								break;
		   							case "category":
		   								itemPipeline = "Search-Show";
		   								itemIDLabel = 'cgid';
		   								break;
		   							case "content":
		   								itemPipeline = "Page-Show";
		   								itemIDLabel = 'cid';
		   								break;
		   						}
		   						languageID = Utils.toDemandwareLocaleID(project.language_to_code);
		   						languageID = languageID.replace("-", "_");
		   						urlAction = new URLAction(itemPipeline, Site.current.ID, languageID);
		   						urlparam = new URLParameter(itemIDLabel,doc.custom_data.item.id);
								itemURL = dw.web.URLUtils.abs(urlAction,urlparam);
								
		   						actions.push({
		   							text: Resource.msg("follow.action.revision","textmaster",null),
		   							link: itemURL
		   						});
		   						actions.push({
		   							text: Resource.msg("follow.action.view.document","textmaster",null),
		   							link: Resource.msgf("link.view.document","textmaster",null,project.id,doc.id)
		   						});
		   						break;
		   					case "incomplete":
		   						actions.push({
		   							text: Resource.msg("follow.action.communicate.translator","textmaster",null),
		   							link: Resource.msgf("link.view.document","textmaster",null,project.id,doc.id)
		   						});
		   						break;
		   				}
		   				
		   				doc.actions = actions;
		   				documents.push(doc);
		   			}
		   		}
		   		
		   		if(docPageCount >= documentResult.total_pages){
		   			docRequestFlag = false;
		   		}
	   		}
	   	}
	   	
	   	if(projectPageCount >= projectResult.total_pages){
	   		projectRequestFlag = false;
	   	}
   	}
	
   	return {
   		Documents: documents
   	};
}

module.exports = {
	output: getOutput()
}
