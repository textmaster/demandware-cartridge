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

function getOutput(input){
   	var projects, project, projectResult, documentResult, documentEndPoint,
		projectsEndPoint, documents = [], document, doc, actions, urlAction, urlparam, itemURL, itemPipeline, itemIDLabel, languageID,
		projectPageNumber, docPageNumber, projectPageSize = 50, projectRequestFlag, docRequestFlag,
		docCountCurrProj, resultLimit, projectCount, projectCountInPage, projectLoopCount, docLoopCount;
   	
   	resultLimit = Site.current.getCustomPreferenceValue("TMDashboardPageSize") || 100;
   	resultLimit = isNaN(resultLimit) ? 100 : parseInt(resultLimit, 10);
   	projectRequestFlag = true;
   	projectPageNumber = input.projectPageNumber ? (input.projectPageNumber - 1) : 0;
   	projectCountInPage = input.projectCountInPage || 0;
   	projectCount = projectPageNumber * projectPageSize + projectCountInPage;
   	
   	while(projectRequestFlag){
   		projectPageNumber++;
	   	projectsEndPoint = Resource.msg("api.get.projects","textmaster",null) +"?page="+ projectPageNumber +"&per_page="+ projectPageSize +"&order=-created_at";
	   	projectResult = Utils.TextMasterClient("GET", projectsEndPoint );
	   	projects = (projectResult && projectResult.projects) ? projectResult.projects : [];
	   	projectLoopCount = 0;
	   	
	   	for each(project in projects){
	   		docRequestFlag = true;
	   		projectLoopCount++;
	   		
	   		if(projectLoopCount < projectCountInPage){
	   			continue;
	   		}
	   		
	   		projectCount++;
	   		
	   		if(projectLoopCount == projectCountInPage){
	   			docPageNumber = input.docPageNumber ? (input.docPageNumber - 1) : 0;
	   		   	docCountInPage = input.docCountInPage || 0;
		   		docCountCurrProj = docPageNumber * resultLimit + docCountInPage;
	   		}
	   		else{
	   			docPageNumber = 0;
	   			docCountInPage = 0;
		   		docCountCurrProj = 0;
	   		}
	   		
	   		while(docRequestFlag){
	   			docPageNumber++;
		   		documentEndPoint = Resource.msg("api.get.project","textmaster",null) + "/" + project.id +"/"+ Resource.msg("api.get.documents","textmaster",null)
		   										+"?page="+ docPageNumber +"&per_page="+ resultLimit +"&order=-created_at";
		   		documentResult = Utils.TextMasterClient("GET", documentEndPoint);
		   		docLoopCount = 0;
		   		
		   		if(documentResult && documentResult.documents){
		   			for each(document in documentResult.documents){
		   				docLoopCount++;
		   				
		   				if(projectLoopCount == projectCountInPage && docPageNumber == input.docPageNumber && docLoopCount <= docCountInPage){
		   		   			continue;
		   		   		}
		   				
		   				docCountCurrProj++;
		   				
		   				doc = getDocumentResult(document, project);
		   				documents.push(doc);
		   				
		   				if(documents.length >= resultLimit){
		   					docRequestFlag = false;
		   					break;
		   				}
		   			}
		   			
		   			docCountInPage = docLoopCount;
		   		}
		   		
		   		if(documents.length >= resultLimit || docCountCurrProj >= documentResult.count){
		   			docRequestFlag = false;
		   		}
	   		}
	   		
	   		if(documents.length >= resultLimit){
	   			projectRequestFlag = false;
	   			break;
	   		}
	   	}
	   	
	   	projectCountInPage = projectLoopCount;
	   	
	   	if(documents.length >= resultLimit || projectCount >= projectResult.count){
	   		projectRequestFlag = false;
	   	}
   	}
   	
	//dw.system.Logger.getLogger("debug").error("totalDocs: "+ totalDocs);
   	return {
   		Documents: documents,
   		ProjectPageNumber: projectPageNumber,
   		DocPageNumber: docPageNumber,
   		ProjectCountInPage: projectCountInPage,
   		DocCountInPage: docCountInPage,
   		ShowMore: (projectCount < projectResult.count || (projectCount == projectResult.count && docCountCurrProj < documentResult.count))
   	};
}

/*
 * Prepare single document result object for dashboard
 * */
function getDocumentResult(doc, project){
	doc.project_name = project.name;
	doc.project_launch_date = project.launched_at ? (project.launched_at.year || "") +"-"+ (project.launched_at.month || "") +"-"+ (project.launched_at.day || "") : "";
	doc.item_type = project.custom_data.itemType;
	doc.locale = Utils.getLocaleName(project.language_to_code);
	actions = [];
			   				
	switch(doc.status.toLowerCase()){
		case "in_creation":
			actions.push({
				text: Resource.msg("follow.action.view.project","textmaster",null),
				link: Resource.msgf("link.view.project." + Utils.config.apiEnv,"textmaster",null,project.id)
			});
			break;
		case "in_progress":
		case "waiting_assignment":
		case "quality_control":
			actions.push({
				text: Resource.msg("follow.action.view.document","textmaster",null),
				link: Resource.msgf("link.view.document." + Utils.config.apiEnv,"textmaster",null,project.id,doc.id)
			});
			break;
		case "in_review":
			if(doc.item_type){
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
				itemURL = dw.web.URLUtils.abs(urlAction,urlparam).toString();
			
				actions.push({
					text: Resource.msg("follow.action.revision","textmaster",null),
					link: itemURL
				});
				actions.push({
					text: Resource.msg("follow.action.view.document","textmaster",null),
					link: Resource.msgf("link.view.document." + Utils.config.apiEnv,"textmaster",null,project.id,doc.id)
				});
			}
			else{
				log.error("'project.custom_data.itemType' is not found for project id: " + project.id);
			}
			break;
		case "incomplete":
			actions.push({
				text: Resource.msg("follow.action.communicate.translator","textmaster",null),
				link: Resource.msgf("link.view.document." + Utils.config.apiEnv,"textmaster",null,project.id,doc.id)
			});
			break;
	}
	
	doc.actions = actions;
	
	return doc;
}

module.exports = {
	output: function(input){
		return getOutput(input);
	}
}
