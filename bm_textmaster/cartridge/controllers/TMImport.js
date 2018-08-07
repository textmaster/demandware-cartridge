'use strict';

/**
 * Controller that provides functions for importing translated data from TextMaster
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
	logUtils = require('~/cartridge/scripts/utils/LogUtils'),
	utils = require('~/cartridge/scripts/utils/Utils');

/* Global variables */
var log = logUtils.getLogger("ImportController");

/**
* Calls start method
*/
function data(){
	var input, output, projectid, documentid, importData;
	
	projectid = request.httpParameterMap.get("projectid").value;
	documentid = request.httpParameterMap.get("documentid").value;
	input = {
		ProjectID: projectid,
		DocumentID: documentid
	};
	
	importData = require('~/cartridge/scripts/translation/ImportData');
	output = importData.output(input);
	
	response.getWriter().println(JSON.stringify(output));
}

/*
* Web exposed methods
*/
/** Calls export functionalities
  @see {@link module:controllers/TMImport~Data} */
exports.Data = guard.ensure(['post'], data);
