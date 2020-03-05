'use strict';

/**
 * Import data from TextMaster projects - Job
 */
function start() {
    var CustomObjectMgr = require('dw/object/CustomObjectMgr');
    var utils = require('*/cartridge/scripts/utils/tmUtils');
    var autoLaunch = require('~/cartridge/scripts/translation/autoLaunch');
    var autoLaunchObjects = CustomObjectMgr.getAllCustomObjects(utils.config.autolaunch.coName);

    while (autoLaunchObjects.hasNext()) {
        var obj = autoLaunchObjects.next();
        autoLaunch.output(obj);
    }

    autoLaunchObjects.close();
}

module.exports = {
    execute: start
};
