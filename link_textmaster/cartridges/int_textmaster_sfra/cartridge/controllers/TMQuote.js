/**
 * Controller that provides method to send a quotation
 *
 * @module  controllers/TMQuote
 */

'use strict';

var server = require('server');

var StringUtils = require('dw/util/StringUtils');

/**
 * Triggers job for sending quotation
 */
server.post('Send', function (req, res, next) {
    var projectid = StringUtils.trim(req.querystring.projectid);
    var quote = require('*/cartridge/scripts/translation/tmQuote');
    var input = {
        ProjectID: projectid
    };
    var output = quote.output(input);

    var result = {
        Status: output.statusCode
    };

    res.render('translation/tmquote', result);

    next();
});

module.exports = server.exports();
