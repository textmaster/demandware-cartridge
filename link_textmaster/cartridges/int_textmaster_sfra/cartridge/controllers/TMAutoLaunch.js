'use strict';

/**
 * Controller that provides functions for auto launch document
 * @module controllers/TMAutoLaunch
 */

/* Script Modules */
var server = require('server');
var logUtils = require('*/cartridge/scripts/utils/tmLogUtils');

/* Global variables */
var log = logUtils.getLogger('AutoLaunchController');

/**
 * Calls start method
 */

server.post('Document', function (req, res, next) {
    var projectid = req.querystring.projectid;
    var documentid = req.querystring.documentid;
    var input = {
        ProjectID: projectid,
        DocumentID: documentid
    };

    log.debug('Finalization callback received for ' + JSON.stringify(input));

    var autoLaunchDocument = require('*/cartridge/scripts/translation/autoLaunchDocument');
    var output = autoLaunchDocument.output(input);

    res.json(output);

    next();
});

module.exports = server.exports();
