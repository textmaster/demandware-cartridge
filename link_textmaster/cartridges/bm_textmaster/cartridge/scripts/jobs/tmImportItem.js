'use strict';

/**
 * Import data from TextMaster projects - Job
 */
function start() {
    var logUtils = require('*/cartridge/scripts/utils/tmLogUtils');
    var log = logUtils.getLogger('tmImportItem');
    var loop = true;

    while (loop) {
        var getImportQueuedDetails = require('~/cartridge/scripts/translation/getImportQueuedDetails');
        var importQueuedDetails = getImportQueuedDetails.execute();

        if (importQueuedDetails) {
            var projectId = importQueuedDetails.projectID;
            var documentId = importQueuedDetails.documentID;
            try {
                if (projectId !== '' && documentId !== '') {
                    var importData = require('~/cartridge/scripts/translation/import');
                    importData.execute(projectId, documentId);
                }
            } catch (ex) {
                log.error('Error while importing data:' + ex);
            }
        } else {
            loop = false;
        }
    }
}

module.exports = {
    execute: start
};
