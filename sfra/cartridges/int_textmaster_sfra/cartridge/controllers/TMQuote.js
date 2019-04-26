/**
* Controller that provides method to send a quotation
*
* @module  controllers/TMQuote
*/

'use strict';
var server = require('server');

//Lib Includes
var LogUtils = require('*/cartridge/scripts/utils/LogUtils');

// Global variables
var log = LogUtils.getLogger("TMQuote");

/**
* Triggers job for sending quotation
*/
server.post('Send', function (req, res, next) {	
	var projectid, quote, input, output;
	
	projectid = dw.util.StringUtils.trim(req.querystring.projectid);
	quote = require('*/cartridge/scripts/translation/TMQuote');
	input = {
		ProjectID: projectid
	};
	output = quote.output(input);
	
	var result = {
		Status: output.statusCode
	};

	res.render('translation/tmquote', {result:result});
	
	next();
});

module.exports = server.exports();