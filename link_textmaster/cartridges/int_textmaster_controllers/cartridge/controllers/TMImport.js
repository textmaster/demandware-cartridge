'use strict';

/**
 * Controller that provides functions for importing translated data from TextMaster
 * @module controllers/TMImport
 */

/* global request */

/* Script Modules */
var logUtils = require('*/cartridge/scripts/utils/tmLogUtils');
var r = require('*/cartridge/scripts/utils/response');
var guard = require('*/cartridge/scripts/guard');

/* Global variables */
var log = logUtils.getLogger('ImportCallback');

/**
 * Calls start method
 */
function data() {
    log.debug('Import callback received');
    var importData = require('*/cartridge/scripts/translation/importData');
    var projectid = request.httpParameterMap.get('projectid').value;
    var documentid = request.httpParameterMap.get('documentid').value;
    var isFirstImport = request.httpParameterMap.get('isFirstImport').isSubmitted() ? request.httpParameterMap.get('isFirstImport').value : true;

    if (!projectid || !documentid) {
        var document = {};

        if (request && request.httpParameterMap && request.httpParameterMap.getRequestBodyAsString()) {
            try {
                document = JSON.parse(request.httpParameterMap.getRequestBodyAsString());
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

        var output = importData.output(input);

        log.debug('Project: ' + projectid + ' | Document: ' + documentid);

        r.renderJSON(output);
    } else {
        log.debug('Invalid import callback');
        r.setStatusCode(422);
        r.renderJSON({ status: 'ERROR', success: false, error: true });
    }
}

/*
 * Web exposed methods
 */
/** Calls export functionalities
  @see {@link module:controllers/TMImport~Data} */
exports.Data = guard.ensure(['post'], data);
