'use strict';

/* API Includes */
var Site = require('dw/system/Site');
var Transaction = require('dw/system/Transaction');
var CustomObjectMgr = require('dw/object/CustomObjectMgr');

/* Script Includes */
var logUtils = require('~/cartridge/scripts/utils/tmLogUtils');
var utils = require('~/cartridge/scripts/utils/tmUtils');

var log = logUtils.getLogger('AutoLaunchController');

/**
 * Set document in custom object for auto launch
 * @param {string} projectid - project id
 * @param {string} documentid - document id
 * @returns {boolean} true or false
 */
function setAutoLaunchJobQuery(projectid, documentid) {
    var customObjectName = utils.config.autolaunch.coName;
    var tryAgain = true;
    var documentsString;
    var documents;
    var result = false;

    try {
        var dataHolder = CustomObjectMgr.getCustomObject(customObjectName, projectid);

        if (dataHolder) {
            while (tryAgain) {
                try {
                    documentsString = dataHolder.custom.documents || '[]';
                    documents = JSON.parse(documentsString);

                    if (documents.indexOf(documentid) < 0) {
                        documents.push(documentid);
                    }

                    Transaction.begin();
                    dataHolder.custom.documents = JSON.stringify(documents);
                    Transaction.commit();

                    tryAgain = false;
                } catch (ex) {
                    log.error('Exception occurs in autoLaunchDocument script : ' + ex.message);
                }
            }

            documentsString = dataHolder.custom.documents || '[]';
            documents = JSON.parse(documentsString);

            result = dataHolder.custom.documentCount === documents.length;
        }
    } catch (ex) {
        log.error(ex.message + ' - No custom object found.');
    }

    return result;
}

/**
 * Trigger TextMasterAutoLaunch Job
 * @param {Object} input - input object
 * @returns {Object} response object
 */
function getOutput(input) {
    var result = false;
    var projectid = input.ProjectID;
    var documentid = input.DocumentID;
    var responseMessage;

    if (projectid && documentid) {
        var triggerJob = setAutoLaunchJobQuery(projectid, documentid);

        if (triggerJob) {
            var jobName = utils.config.autolaunch.jobName + Site.current.ID;
            var ocapiJobUrl = utils.config.ocapi.jobs.post;
            ocapiJobUrl = ocapiJobUrl.replace('{0}', jobName);
            var jobResponse = utils.ocapiClient('post', ocapiJobUrl, null);

            result = jobResponse && (jobResponse.execution_status.toLowerCase() === 'running' || jobResponse.execution_status.toLowerCase() === 'pending' || jobResponse.execution_status.toLowerCase() === 'finished' || jobResponse.execution_status.toLowerCase() === 'jobalreadyrunningexception');

            if (!result) {
                if (jobResponse) {
                    log.error('jobResponse.execution_status : ' + jobResponse.execution_status.toLowerCase());
                }

                log.error('Job "' + jobName + '" is not found or not enabled');
            }
        } else {
            responseMessage = utils.config.autolaunch.waitingMessage;
        }
    } else {
        responseMessage = utils.config.autolaunch.parameterError;
        log.error(responseMessage);
    }

    // eslint-disable-next-line
    responseMessage = responseMessage || (result ? utils.config.autolaunch.successMessage : utils.config.autolaunch.errorMessage);

    var responseObj = {
        success: result,
        message: responseMessage
    };

    return responseObj;
}

module.exports = {
    output: getOutput
};
