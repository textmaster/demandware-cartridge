'use strict';

/**
 * Controller that provides functions to call a job in BusinessManager
 * @module controllers/Quote
 */

/* API Includes */

var Pipelet	 = require('dw/system/Pipelet'),
	Resource = require('dw/web/Resource'),
	Transaction	 = require('dw/system/Transaction'),
	CustomObjMgr = require('dw/object/CustomObjectMgr');

/* Script Modules */
var app = require('~/cartridge/scripts/app');
var guard = require('~/cartridge/scripts/guard');

/**
* Calls appropriate jobs 
*/
function send()
{		
    try {
    	var projectid = dw.util.StringUtils.trim(request.httpParameterMap.projectid.toString());
    	
    	if(projectid){
	    	var co = CustomObjMgr.getCustomObject('TextMasterProject', projectid);
	    	if (co == null) {
	    		Transaction.begin();
	    		co = CustomObjMgr.createCustomObject('TextMasterProject', projectid);
	    		Transaction.commit();
	    	}
	    	
	    	RunJobNow = new Pipelet('RunJobNow').execute({
	            JobName: Resource.msg("quote.jobname", "textmaster",null)
	        });
	    	
	    	status = RunJobNow.result == 1 ? 201 : 404;	
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