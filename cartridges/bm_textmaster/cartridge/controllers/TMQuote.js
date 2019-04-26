'use strict';

/**
 * Controller that provides method to send a quotation
 * @module controllers/TMQuote
 */

/* API Includes */

var ISML = require('dw/template/ISML');

//Lib Includes
var LogUtils = require('~/cartridge/scripts/utils/LogUtils');

// Global variables
var log = LogUtils.getLogger("TMQuote");

/**
* Triggers job for sending quotation
*/
function send()
{		
	var projectid, quote, input, output;
	
	projectid = dw.util.StringUtils.trim(request.httpParameterMap.projectid.stringValue);
	quote = require('~/cartridge/scripts/translation/TMQuote');
	input = {
		ProjectID: projectid
	};
	output = quote.output(input);
	
	var result = {
		Status: output.statusCode
	};

	ISML.renderTemplate('translation/tmquote', result);
}

/*
* Web exposed methods
*/
/** Calls export functionalities
 * @see {@link module:controllers/TMQuote~Send} */
send.public = true;
exports.Send = send;