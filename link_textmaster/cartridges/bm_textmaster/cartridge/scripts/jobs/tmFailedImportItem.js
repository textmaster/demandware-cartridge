'use strict';

/**
 * Import data which is failed
 */
function start() {
    var utils = require('*/cartridge/scripts/utils/tmUtils');
    var logUtils = require('*/cartridge/scripts/utils/tmLogUtils');
    var log = logUtils.getLogger('tmImportItem');

    var jobDataHolder = utils.getFailedJobDataHolder();
    if (jobDataHolder) {
        var query = jobDataHolder.custom.QueuedDocuments || '[]';
        var queryObj = JSON.parse(query);


        for (var i = 0; i < queryObj.length; i++) {
            var projectID = queryObj[i].projectID;
            var documentID = queryObj[i].documentID;
            try {
                if (projectID !== '' && documentID !== '') {
                    var endPoint = '/TMImport-Data?projectid=' + projectID + '&documentid=' + documentID + '&isFirstImport=' + false;
                    utils.storefrontCall('POST', endPoint, {}, 'default');
                }
            } catch (ex) {
                log.error('Error while failed importing data:' + ex);
            }
        }
    }
}

module.exports = {
    execute: start
};
