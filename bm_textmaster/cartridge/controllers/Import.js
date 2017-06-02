'use strict';

/**
 * Controller that provides functions for importing translated data from TextMaster
 * @module controllers/Import
 */

/* API Includes */
var Pipelet  = require('dw/system/Pipelet'),
	Site  = require('dw/system/Site'),
 	Resource = require('dw/web/Resource'),
 	Transaction  = require('dw/system/Transaction'),
 	SGContCartridge = Site.current.getCustomPreferenceValue("TMSGController") || "";

/* Script Modules */
var app = require(SGContCartridge + '/cartridge/scripts/app'),
	guard = require(SGContCartridge + '/cartridge/scripts/guard'),
	logUtils = require('~/cartridge/scripts/utils/LogUtils'),
	utils = require('~/cartridge/scripts/utils/Utils');

/* Global variables */
var log;

/**
* Calls start method
*/
function data(){
	var jobName, jobResponse, ocapiJobUrl, projectid, documentid, result = false, jobRunning;
	
	log = logUtils.getLogger("ImportController");
	projectid = request.httpParameterMap.get("projectid").value;
	documentid = request.httpParameterMap.get("documentid").value;
	
	if(projectid && documentid){
		jobRunning = setQuery(projectid, documentid);
		
		if(jobRunning == false){
			jobName = Resource.msg("import.job.name","textmaster",null) + dw.system.Site.current.ID;
			ocapiJobUrl = Resource.msgf("ocapi.jobs.post","textmaster",null,jobName);
			jobResponse = utils.OCAPIClient("post", ocapiJobUrl,null);
			
			result = jobResponse && (jobResponse.execution_status.toLowerCase() == "running" || jobResponse.execution_status.toLowerCase() == "pending");
			
			if(!result){
				log.error("Job '"+ jobName +"' is not found or not enabled");
			}
		}
		else{
			result = true;
		}
	}
	else{
		log.error("Parameters projectid and documentid are required in URL");
	}
	
	app.getView({
		success: result
	}).render('translation/import.isml');
}

/*
 * 	Save project id into custom object
 * */
function setQuery(projectid, documentid){
	var dataHolder = utils.getJobDataHolder(),
		result, queue, queueObj;
	
	if(dataHolder){
		queue = dataHolder.custom.QueuedDocuments || "[]";
		queueObj = JSON.parse(queue);
		queueObj.push({
			projectid: projectid,
			documentid: documentid
		});
	
		Transaction.begin();
		dataHolder.custom.QueuedDocuments = JSON.stringify(queueObj);
		Transaction.commit();
		
		result = dataHolder.custom.RunningDocument ? true : false;
	}
	
	return result;
}

/*
* Web exposed methods
*/
/** Calls export functionalities
  @see {@link module:controllers/Import~Data} */
exports.Data = guard.ensure(['post'], data);
