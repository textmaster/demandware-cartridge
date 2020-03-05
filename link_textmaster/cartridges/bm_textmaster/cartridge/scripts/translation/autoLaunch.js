'use strict';

/* API Includes*/
var CustomObjectMgr = require('dw/object/CustomObjectMgr');
var Resource = require('dw/web/Resource');
var Transaction = require('dw/system/Transaction');

/* Script Modules */
var logUtils = require('*/cartridge/scripts/utils/tmLogUtils');
var utils = require('*/cartridge/scripts/utils/tmUtils');

var log = logUtils.getLogger('autoLaunch');

/**
 * Imports translation data from textMaster projects
 * @param {Object} autoLaunchObject - TMAutoLaunchDataHolder custom object
 */
function getOutput(autoLaunchObject) {
    var documentsString = autoLaunchObject.custom.documents || '[]';
    var documents = JSON.parse(documentsString);
    var projectID = autoLaunchObject.custom.ID;
    var tryAgain = true;
    var waitingTime = Resource.msg('autolaunch.waiting.timestamp', 'textmaster', null);
    var currentTimestamp = new Date().getTime();
    var objectUpdatedTimeStamp = autoLaunchObject.lastModified.getTime();

    waitingTime = waitingTime && !isNaN(waitingTime) ? waitingTime : '3600000';
    var waitingTimeStamp = parseInt(waitingTime, 10);

    // If all documents' call backs received by SFCC || if the Custom Object's last updated time is passed the waiting time
    if (autoLaunchObject.custom.documentCount === documents.length || currentTimestamp - objectUpdatedTimeStamp > waitingTimeStamp) {
        log.debug('Auto launched Project ID: ' + projectID);
        var projectEndPoint = utils.config.api.get.project + '/' + projectID + '/' + Resource.msg('api.projects.finalize', 'textmaster', null);
        utils.textMasterClient('PUT', projectEndPoint, JSON.stringify({}));

        while (tryAgain) {
            try {
                Transaction.begin();
                CustomObjectMgr.remove(autoLaunchObject);
                Transaction.commit();

                tryAgain = false;
            } catch (ex) {
                log.error('Error during auto launch:' + ex);
            }
        }
    }
}

module.exports = {
    output: getOutput
};
