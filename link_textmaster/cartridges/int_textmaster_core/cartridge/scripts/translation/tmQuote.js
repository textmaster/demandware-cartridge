'use strict';

/* API Includes */
var Site = require('dw/system/Site');
var Transaction = require('dw/system/Transaction');
var CustomObjectMgr = require('dw/object/CustomObjectMgr');

/* Script Includes */
var logUtils = require('~/cartridge/scripts/utils/tmLogUtils');
var utils = require('~/cartridge/scripts/utils/tmUtils');

// Global variables
var log = logUtils.getLogger('TMQuote Script');

/**
 * Run TextMasterAskForQuote job
 * @param {Object} input - input object
 * @returns {Object} status code
 */
function getOutput(input) {
    var statusCode;
    var projectid = input.ProjectID;

    try {
        if (projectid) {
            var co = CustomObjectMgr.getCustomObject('TextMasterProject', projectid);

            if (co == null) {
                Transaction.begin();
                co = CustomObjectMgr.createCustomObject('TextMasterProject', projectid);
                Transaction.commit();
            }

            var jobName = utils.config.quote.jobname + Site.current.ID;
            var ocapiJobUrl = utils.config.ocapi.jobs.post;
            ocapiJobUrl = ocapiJobUrl.replace('{0}', jobName);
            var jobResponse = utils.ocapiClient('post', ocapiJobUrl, null);

            statusCode = jobResponse && (jobResponse.execution_status.toLowerCase() === 'running' || jobResponse.execution_status.toLowerCase() === 'pending') ? 201 : 404;
        } else {
            statusCode = 400;
        }
    } catch (ex) {
        log.error('Exception in TMQuote Script: ' + ex.message);
        statusCode = 500;
    }

    return {
        statusCode: statusCode
    };
}

module.exports = {
    output: getOutput
};
