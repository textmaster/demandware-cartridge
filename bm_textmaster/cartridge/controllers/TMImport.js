'use strict';

/**
 * Controller that provides functions for importing translated data from TextMaster
 * @module controllers/TMImport
 */

/* API Includes */
var ISML = require('dw/template/ISML');

/* Script Modules */
var logUtils = require('~/cartridge/scripts/utils/LogUtils');

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
data.public = true;
exports.Data = data;
