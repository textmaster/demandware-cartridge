'use strict';

/**
 * Controller that provides functions for importing translated data from TextMaster
 * @module controllers/Import
 */

/* API Includes */
var Pipelet  = require('dw/system/Pipelet'),
 	Resource = require('dw/web/Resource'),
 	Transaction  = require('dw/system/Transaction');

/* Script Modules */
var app = require('~/cartridge/scripts/app'),
	guard = require('~/cartridge/scripts/guard'),
	logUtils = require('~/cartridge/scripts/utils/LogUtils'),
	utils = require('~/cartridge/scripts/utils/Utils');

/* Global variables */
var log;

/**
* Calls start method
*/
function data(){
	var RunJobNow, projectid, result = false, jobRunning;
	
	log = logUtils.getLogger("ImportController");
	projectid = request.httpParameterMap.get("projectid").value;
	jobRunning = setProjectID(projectid);
	dw.system.Logger.getLogger("TextMaster").error("Error");
	if(jobRunning == false){
		RunJobNow = new Pipelet('RunJobNow').execute({
			JobName: Resource.msg("import.job.name","textmaster",null)
		});
		
		result = RunJobNow.result == 1;
		
		if(RunJobNow.result == 2){
			log.error("Job '"+ Resource.msg("import.job.name","textmaster",null) +"' is not found or not enabled");
		}
	}
	else{
		result = true;
	}
	
	app.getView({
		success: result
	}).render('translation/import.isml');
}

/*
 * 	Save project id into custom object
 * */
function setProjectID(projectid){
	var dataHolder = utils.getJobDataHolder(),
		result, queue, queueObj;
	
	if(dataHolder){
		queue = dataHolder.custom.QueuedProjects || "[]";
		queueObj = JSON.parse(queue);
		queueObj.push(projectid);
	
		Transaction.begin();
		dataHolder.custom.QueuedProjects = JSON.stringify(queueObj);
		Transaction.commit();
		
		result = dataHolder.custom.RunningProject ? true : false;
	}
	
	return result;
}

/*
* Web exposed methods
*/
/** Calls export functionalities
  @see {@link module:controllers/Import~Data} */
exports.Data = guard.ensure(['get'], data);
