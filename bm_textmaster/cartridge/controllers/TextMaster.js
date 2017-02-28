'use strict';

/**
 * Controller that provides functions to call a job in BusinessManager
 * @module controllers/TextMaster
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
function start()
{		
    try {
    	var projectid = request.httpParameterMap.pid.toString();
    	var co = CustomObjMgr.getCustomObject('TextMasterProject', projectid);
    	if (co == null) {
    		Transaction.begin();
    		co = CustomObjMgr.createCustomObject('TextMasterProject', projectid);
    		Transaction.commit();
    	}
    	
    	RunJobNow = new Pipelet('RunJobNow').execute({
            JobName: "AskForQuote"
        });
    	
    	status = RunJobNow.result == 1 ? 201 : 404;	
    	sendResult(status);
    	
	} catch(ex) {
		sendResult(500);
	}
}

/**
* Send the result as response of HTTP request
*/
function sendResult(status, message, responseType, data, exportFile){
	var result = {
		status: status
	};

	response.getWriter().println(JSON.stringify(result));
}

/*
* Web exposed methods
*/
/** Calls export functionalities
 * @see {@link module:controllers/TextMaster~Start} */
exports.Start = guard.ensure(['get'], start);