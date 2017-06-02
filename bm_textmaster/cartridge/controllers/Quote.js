'use strict';

/**
 * Controller that provides functions to call a job in BusinessManager
 * @module controllers/Quote
 */

/* API Includes */

var Pipelet	 = require('dw/system/Pipelet'),
	Site  = require('dw/system/Site'),
	Resource = require('dw/web/Resource'),
	Transaction	 = require('dw/system/Transaction'),
	CustomObjMgr = require('dw/object/CustomObjectMgr'),
	SGContCartridge = Site.current.getCustomPreferenceValue("TMSGController") || "";

/* Script Modules */
var app = require(SGContCartridge + '/cartridge/scripts/app'),
	guard = require(SGContCartridge + '/cartridge/scripts/guard'),
	utils = require('~/cartridge/scripts/utils/Utils');

/**
* Calls appropriate jobs 
*/
function send()
{		
    try {
    	var projectid = dw.util.StringUtils.trim(request.httpParameterMap.projectid.toString()),
    		jobName, jobResponse, ocapiJobUrl;
    	
    	if(projectid){
	    	var co = CustomObjMgr.getCustomObject('TextMasterProject', projectid);
	    	if (co == null) {
	    		Transaction.begin();
	    		co = CustomObjMgr.createCustomObject('TextMasterProject', projectid);
	    		Transaction.commit();
	    	}
	    	
	    	jobName = Resource.msg("quote.jobname", "textmaster",null) + dw.system.Site.current.ID;
	    	ocapiJobUrl = Resource.msgf("ocapi.jobs.post","textmaster",null,jobName);
	    	jobResponse = utils.OCAPIClient("post", ocapiJobUrl,null);
	    	
	    	status = jobResponse && (jobResponse.execution_status.toLowerCase() == "running" || jobResponse.execution_status.toLowerCase() == "pending") ? 201 : 404;
	    	sendResult(status);
    	}
    	else{
    		sendResult(400);
    	}
    	
	} catch(ex) {
		sendResult(500);
	}
}

/**
* Send the result as response of HTTP request
*/
function sendResult(status){
	var result = {
		status: status
	};

	app.getView(result).render('translation/quote');
}

/*
* Web exposed methods
*/
/** Calls export functionalities
 * @see {@link module:controllers/Quote~Send} */
exports.Send = guard.ensure(['post'], send);