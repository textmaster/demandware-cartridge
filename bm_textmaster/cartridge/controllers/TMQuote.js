'use strict';

/**
 * Controller that provides method to send a quotation
 * @module controllers/TMQuote
 */

/* API Includes */

var Site  = require('dw/system/Site'),
	SGContCartridge = Site.current.getCustomPreferenceValue("TMSGController") || "";

/* Script Modules */
var app = require(SGContCartridge + '/cartridge/scripts/app'),
	guard = require(SGContCartridge + '/cartridge/scripts/guard');

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

	app.getView(result).render('translation/tmquote');
}

/*
* Web exposed methods
*/
/** Calls export functionalities
 * @see {@link module:controllers/TMQuote~Send} */
exports.Send = guard.ensure(['post'], send);