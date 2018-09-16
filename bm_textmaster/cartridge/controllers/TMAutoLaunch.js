'use strict';

/**
 * Controller that provides functions for auto launch document
 * @module controllers/TMImport
 */

/* API Includes */
var Site  = require('dw/system/Site'),
 	Resource = require('dw/web/Resource'),
 	Transaction  = require('dw/system/Transaction'),
 	SGContCartridge = Site.current.getCustomPreferenceValue("TMSGController") || "";

/* Script Modules */
var app = require(SGContCartridge + '/cartridge/scripts/app'),
	guard = require(SGContCartridge + '/cartridge/scripts/guard'),
	logUtils = require('~/cartridge/scripts/utils/LogUtils');

/* Global variables */
var log = logUtils.getLogger("AutoLaunchController");

/**
* Calls start method
*/
function document(){
	var input, output, projectid, documentid, autoLaunchDocument;
	
	projectid = request.httpParameterMap.get("projectid").value;
	documentid = request.httpParameterMap.get("documentid").value;
	input = {
		ProjectID: projectid,
		DocumentID: documentid
	};
	
	autoLaunchDocument = require('~/cartridge/scripts/translation/AutoLaunchDocument');
	output = autoLaunchDocument.output(input);
	
	response.getWriter().println(JSON.stringify(output));
}

/*
* Web exposed methods
*/
/** Calls export functionalities
  @see {@link module:controllers/TMImport~Data} */
exports.Document = guard.ensure(['post'], document);
