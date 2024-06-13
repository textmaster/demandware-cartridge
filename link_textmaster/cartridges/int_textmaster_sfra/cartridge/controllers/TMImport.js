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
 * Import callback controller method
 */
server.post('Data', function (req, res, next) {
    log.debug('Import callback received');
    var projectid = req.querystring.projectid;
    var documentid = req.querystring.documentid;
    var isFirstImport = req.querystring.isFirstImport ? req.querystring.isFirstImport : true;

    if (!projectid || !documentid) {
        var document = {};

        if (req && req.body) {
            try {
                document = JSON.parse(req.body);
            } catch (e) {
                log.error('Malformed Request body');
            }
        } else {
            log.error('Request body is not found');
        }

        projectid = document.project_id ? document.project_id : null;
        documentid = document.id ? document.id : null;
    }

    if (projectid && documentid) {
        var input = {
            ProjectID: projectid,
            DocumentID: documentid,
            isFirstImport: isFirstImport
        };
        log.debug('Project: ' + projectid + ' | Document: ' + documentid);

        var importData = require('*/cartridge/scripts/translation/importData');
        var output = importData.output(input);

        res.json(output);

        next();
    } else {
        log.debug('Invalid import callback');
        res.setStatusCode(422);
        res.json({ status: 'ERROR', success: false, error: true });

        next();
    }
});

module.exports = server.exports();
