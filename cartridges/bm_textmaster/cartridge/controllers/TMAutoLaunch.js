'use strict';

/**
 * Controller that provides functions for auto launch document
 * @module controllers/TMImport
 */

/* API Includes */
var ISML = require('dw/template/ISML');

/* Script Modules */
var logUtils = require('~/cartridge/scripts/utils/LogUtils');

/**
* Calls start method
*/
function document(){
	var input, output, projectid, documentid, autoLaunchDocument;
	var log = logUtils.getLogger("AutoLaunchController");
	
	projectid = request.httpParameterMap.get("projectid").value;
	documentid = request.httpParameterMap.get("documentid").value;
	input = {
		ProjectID: projectid,
		DocumentID: documentid
	};

	log.debug('Finalization callback received for ' + JSON.stringify(input));
	
	autoLaunchDocument = require('~/cartridge/scripts/translation/AutoLaunchDocument');
	output = autoLaunchDocument.output(input);

	response.getWriter().println(JSON.stringify(output));
}

/*
* Web exposed methods
*/
/** Calls export functionalities
  @see {@link module:controllers/TMImport~Data} */
document.public = true;
exports.Document = document;
