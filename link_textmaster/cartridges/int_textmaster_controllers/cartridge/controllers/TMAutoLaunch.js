'use strict';

/**
 * Controller that provides functions for automatically launch project
 * @module controllers/TMAutoLaunch
 */

/* global request */

/* Script Modules */
var logUtils = require('*/cartridge/scripts/utils/tmLogUtils');
var r = require('*/cartridge/scripts/utils/response');
var guard = require('*/cartridge/scripts/guard');

/**
 * Calls document method
 */
function document() {
    var autoLaunchDocument = require('*/cartridge/scripts/translation/autoLaunchDocument');
    var log = logUtils.getLogger('TMAutoLaunchController');

    var projectid = request.httpParameterMap.get('projectid').value;
    var documentid = request.httpParameterMap.get('documentid').value;
    var input = {
        ProjectID: projectid,
        DocumentID: documentid
    };

    log.debug('Finalization callback received for ' + JSON.stringify(input));

    var output = autoLaunchDocument.output(input);

    r.renderJSON(output);
}

/*
 * Web exposed methods
 */
/** Calls export functionalities
  @see {@link module:controllers/TMAutoLaunch~Document} */
exports.Document = guard.ensure(['post'], document);
