'use strict';

/* API Includes */
var Site = require('dw/system/Site');

/* Script Includes */
var logUtils = require('~/cartridge/scripts/utils/tmLogUtils');
var utils = require('~/cartridge/scripts/utils/tmUtils');

var log = logUtils.getLogger('ImportDataScript');

/**
 * Trigger TextMasterImportData job
 * @param {Object} input - input object
 * @returns {Object} response object
 */
function getOutput(input) {
    var result = false;
    var projectid = input.ProjectID;
    var documentid = input.DocumentID;
    var isfirstimport = input.isFirstImport;
    var responseMessage;

    if (projectid && documentid && isfirstimport) {
        var jobRunning = utils.setImportJobQuery(projectid, documentid, isfirstimport);

        if (jobRunning === false) {
            var jobName = utils.config.importData.jobName + Site.current.ID;
            var ocapiJobUrl = utils.config.ocapi.jobs.post;
            ocapiJobUrl = ocapiJobUrl.replace('{0}', jobName);
            var jobResponse = utils.ocapiClient('post', ocapiJobUrl, null);

            result = jobResponse && (jobResponse.execution_status.toLowerCase() === 'running' || jobResponse.execution_status.toLowerCase() === 'pending' || jobResponse.execution_status.toLowerCase() === 'finished' || jobResponse.execution_status.toLowerCase() === 'jobalreadyrunningexception');

            if (!result) {
                log.error('Job "' + jobName + '" is not found or not enabled');
            }
        } else {
            result = true;
        }
    } else {
        responseMessage = utils.config.importData.parameterError;
        log.error(responseMessage);
    }

    // eslint-disable-next-line
    responseMessage = responseMessage || (result ? utils.config.importData.successMessage : utils.config.importData.errorMessage);

    var responseObj = {
        success: result,
        message: responseMessage
    };

    return responseObj;
}

module.exports = {
    output: getOutput
};
