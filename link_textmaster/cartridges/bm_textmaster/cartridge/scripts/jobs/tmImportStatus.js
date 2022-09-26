'use strict';

/* API Includes */
var Transaction = require('dw/system/Transaction');

var logUtils = require('*/cartridge/scripts/utils/tmLogUtils');
var log = logUtils.getLogger('TMImportStatus');

/**
 * Get queued details from custom object to check last updated time
 * @returns {Object} queued details object
 */
function getQueuedDetails() {
    var utils = require('*/cartridge/scripts/utils/tmUtils');
    var output;
    var dataHolder = utils.getItemLastUpdatedData();
    if (dataHolder) {
        var query = dataHolder.custom.QueuedDocuments || '[]';
        var queryObj = JSON.parse(query);
        var obj = queryObj.shift();
        if (obj && obj.projectID && obj.documentID) {
            output = obj;
        }

        Transaction.begin();
        dataHolder.custom.QueuedDocuments = JSON.stringify(queryObj);
        Transaction.commit();
    }

    return output;
}

/**
 * Import data from TextMaster projects - Job
 */
function start() {
    var utils = require('*/cartridge/scripts/utils/tmUtils');
    var loop = true;
    var detailsArr = [];

    while (loop) {
        var queuedDetails = getQueuedDetails();
        if (queuedDetails) {
            var itemType = queuedDetails.itemType;
            var itemID = queuedDetails.itemID;
            var projectID = queuedDetails.projectID;
            var documentID = queuedDetails.documentID;
            var isFirstImport = queuedDetails.isFirstImport;
            var lastModifiedBeforeImport = new Date(queuedDetails.lastModified);
            var lastModifiedAfterImport = utils.getItemLastModifiedDate(itemType, itemID);
            if ((lastModifiedAfterImport - lastModifiedBeforeImport) === 0) {
                if (isFirstImport === true) {
                    var obj = {
                        projectID: projectID,
                        documentID: documentID
                    };
                    utils.setFailedImportJobQuery(obj);
                }
                log.error('Import is failed for Project: ' + projectID + ' | Document: ' + documentID + '. Scheduled for import again.');
            } else if (isFirstImport === 'false') {
                var failedJobHolder = utils.getFailedJobDataHolder();
                var queuedDoc = failedJobHolder.custom.QueuedDocuments || '[]';
                var queryObj = JSON.parse(queuedDoc);
                for (var i = 0; i < queryObj.length; i++) {
                    if (queryObj[i].projectID === projectID && queryObj[i].documentID === documentID) {
                        detailsArr.push(queuedDetails);
                    }
                }
                for (var j = 0; j < detailsArr.length; j++) {
                    var found = false;
                    var k = 0;
                    for (k = 0; k < queryObj.length; k++) {
                        if (queryObj[k].documentID === detailsArr[j].documentID) {
                            found = true;
                            break;
                        }
                    }
                    if (found) {
                        queryObj.splice(k, 1);
                    }
                }

                try {
                    Transaction.begin();
                    failedJobHolder.custom.QueuedDocuments = JSON.stringify(queryObj);
                    Transaction.commit();
                } catch (ex) {
                    log.error(ex.message);
                }
            }
        } else {
            loop = false;
        }
    }
}

module.exports = {
    execute: start
};
