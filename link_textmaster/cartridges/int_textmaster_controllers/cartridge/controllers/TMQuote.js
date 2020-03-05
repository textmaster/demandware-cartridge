'use strict';

/**
 * Controller that provides method to send a quotation
 * @module controllers/TMQuote
 */

/* API Includes */
var StringUtils = require('dw/util/StringUtils');
var ISML = require('dw/template/ISML');

/* Script modules */
var guard = require('*/cartridge/scripts/guard');

/**
 * Triggers job for sending quotation
 */
function send() {
    var quote = require('*/cartridge/scripts/translation/tmQuote');
    var projectid = StringUtils.trim(request.httpParameterMap.projectid.stringValue); // eslint-disable-line no-undef
    var input = {
        ProjectID: projectid
    };
    var output = quote.output(input);

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
exports.Send = guard.ensure(['post'], send);
