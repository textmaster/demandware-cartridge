/**
 * Controller that provides functions for importing translated data from TextMaster
 *
 * @module  controllers/TMImport
 */

'use strict';

/* Script Modules */
var server = require('server');

var logUtils = require('*/cartridge/scripts/utils/tmLogUtils');
var log = logUtils.getLogger('ImportCallback');

/**
 * Calls start method
 */
server.post('Data', function (req, res, next) {
    var projectid = req.querystring.projectid;
    var documentid = req.querystring.documentid;
    var isFirstImport = req.querystring.isFirstImport ? req.querystring.isFirstImport : true;

    var input = {
        ProjectID: projectid,
        DocumentID: documentid,
        isFirstImport: isFirstImport
    };
    log.debug('Import callback received for Project: ' + projectid + ' | Document: ' + documentid);

    var importData = require('*/cartridge/scripts/translation/importData');
    var output = importData.output(input);

    res.json(output);

    next();
});

module.exports = server.exports();
