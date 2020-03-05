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
var log = logUtils.getLogger('ImportController');

/**
 * Calls start method
 */
function data() {
    var importData = require('*/cartridge/scripts/translation/importData');
    var projectid = request.httpParameterMap.get('projectid').value;
    var documentid = request.httpParameterMap.get('documentid').value;
    var input = {
        ProjectID: projectid,
        DocumentID: documentid
    };

    var output = importData.output(input);

    log.debug('Import callback received for Project: ' + projectid + ' Document: ' + documentid);

    r.renderJSON(output);
}

/*
 * Web exposed methods
 */
/** Calls export functionalities
  @see {@link module:controllers/TMImport~Data} */
exports.Data = guard.ensure(['post'], data);
