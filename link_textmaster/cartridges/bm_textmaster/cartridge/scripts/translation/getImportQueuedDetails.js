'use strict';

/* API Includes */
var Transaction = require('dw/system/Transaction');
/* Script Modules */
var utils = require('*/cartridge/scripts/utils/tmUtils');

/**
 * Get queued project id
 * @returns {Object} object of project id and document id
 */
function execute() {
    var output;
    var jobDataHolder = utils.getJobDataHolder();

    if (jobDataHolder) {
        var query = jobDataHolder.custom.QueuedDocuments || '[]';
        var queryObj = JSON.parse(query);
        var ids = queryObj.shift();

        if (ids && ids.projectid && ids.documentid) {
            output = {
                projectID: ids.projectid,
                documentID: ids.documentid
            };
        }

        Transaction.begin();
        jobDataHolder.custom.QueuedDocuments = JSON.stringify(queryObj);
        Transaction.commit();
    }

    return output;
}

module.exports = {
    execute: execute
};
