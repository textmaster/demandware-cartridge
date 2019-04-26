'use strict';
/**
* 	Return Projects data to Follow up:    
*   
*	@input ProjectPageNumber : Number
*	@input DocPageNumber : Number
*	@input ProjectCountInPage : Number
*	@input DocCountInPage : Number
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
	var input = {
		projectPageNumber: pdict.ProjectPageNumber,
		docPageNumber: pdict.DocPageNumber,
		projectCountInPage: pdict.ProjectCountInPage,
		docCountInPage: pdict.DocCountInPage
	},
	output = getOutput(input);
	
	response.getWriter().print(JSON.stringify(output));
	
	return PIPELET_NEXT;
}

function getOutput(input){
   	var projects, project, projectResult, documentResult, documentEndPoint,
		projectsEndPoint, documents = [], document, doc, actions, urlAction, urlparam, itemURL, itemPipeline, itemIDLabel, languageID,
		projectPageNumber, docPageNumber, projectPageSize = 50, projectRequestFlag, docRequestFlag,
		docCountCurrProj, resultLimit, projectCount, projectCountInPage, projectLoopCount, docLoopCount, platformID;
   	
   	platformID = Resource.msg('general.sfcc.partner.id.' + Utils.config.apiEnv, 'textmaster', null);
   	resultLimit = Site.current.getCustomPreferenceValue("TMDashboardPageSize") || 100;
   	resultLimit = isNaN(resultLimit) ? 100 : parseInt(resultLimit, 10);
   	projectRequestFlag = true;
   	projectPageNumber = input.projectPageNumber ? (input.projectPageNumber - 1) : 0;//input.projectPageNumber is the project API page number in last dashboard load
   	projectCountInPage = input.projectCountInPage || 0;//input.projectCountInPage is the project count in project API page in last dashboard load 
   	projectCount = projectPageNumber * projectPageSize + projectCountInPage;//projectCount is the total number of project loaded so far
   	
   	while(projectRequestFlag){
   		projectPageNumber++;
	   	projectsEndPoint = Resource.msg("api.get.projects","textmaster",null) +"?page="+ projectPageNumber +"&per_page="+ projectPageSize +"&order=-created_at&platform_id=" + platformID;
	   	projectResult = Utils.TextMasterClient("GET", projectsEndPoint );
	   	projects = (projectResult && projectResult.projects) ? projectResult.projects : [];
	   	projectLoopCount = 0;
	   	
	   	for each(project in projects){
	   		docRequestFlag = true;
	   		projectLoopCount++;
	   		
	   		if(projectLoopCount < projectCountInPage){//skip all the projects already shown in this API page of last dashboard load
	   			continue;
	   		}
	   		
	   		projectCount++;
	   		
	   		if(projectLoopCount == projectCountInPage){//if loop reached the same project as last project shown in last dashboard load
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
		   				//skip all the documents already shown in this API page of last dashboard load
		   		   			continue;
		   		   		}
		   				
		   				docCountCurrProj++;
		   				
		   				doc = getDocumentResult(document, project);
		   				documents.push(doc);
		   				
		   				if(documents.length >= resultLimit){
		   				//stop the document loop
		   					docRequestFlag = false;
		   					break;
		   				}
		   			}
		   			
		   			docCountInPage = docLoopCount;
		   		}
		   		
		   		if(documents.length >= resultLimit || docCountCurrProj >= documentResult.count){
		   		//stop the document loop
		   			docRequestFlag = false;
		   		}
	   		}
	   		
	   		if(documents.length >= resultLimit){
	   		//stop the project loop
	   			projectRequestFlag = false;
	   			break;
	   		}
	   	}
	   	
	   	projectCountInPage = projectLoopCount;
	   	
	   	if(documents.length >= resultLimit || projectCount >= projectResult.count){
	   	//stop the project loop
	   		projectRequestFlag = false;
	   	}
   	}
   	
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
				link: Resource.msg('link.base.' + Utils.config.apiEnv,'textmaster',null) + Resource.msg('link.clients','textmaster',null) + Resource.msgf("link.view.project","textmaster",null,project.id)
			});
			break;
		case "in_progress":
		case "waiting_assignment":
		case "quality_control":
			actions.push({
				text: Resource.msg("follow.action.view.document","textmaster",null),
				link: Resource.msg('link.base.' + Utils.config.apiEnv,'textmaster',null) + Resource.msg('link.clients','textmaster',null) + Resource.msgf("link.view.document","textmaster",null,project.id,doc.id)
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
					link: Resource.msg('link.base.' + Utils.config.apiEnv,'textmaster',null) + Resource.msg('link.clients','textmaster',null) + Resource.msgf("link.view.document","textmaster",null,project.id,doc.id)
				});
			}
			else{
				log.error("'project.custom_data.itemType' is not found for project id: " + project.id);
			}
			break;
		case "incomplete":
			actions.push({
				text: Resource.msg("follow.action.communicate.translator","textmaster",null),
				link: Resource.msg('link.base.' + Utils.config.apiEnv,'textmaster',null) + Resource.msg('link.clients','textmaster',null) + Resource.msgf("link.view.document","textmaster",null,project.id,doc.id)
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
