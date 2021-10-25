'use strict';

/* API Includes */
var CustomObjectMgr = require('dw/object/CustomObjectMgr');

/* Script Modules */
var LogUtils = require('*/cartridge/scripts/utils/tmLogUtils');

var log = LogUtils.getLogger('getProjects');

/**
 * Returns custom objects TMQuoteDataHolder with status createJob
 * @returns {asList} project lists
 */
function execute() {
    try {
        var projects = CustomObjectMgr.getAllCustomObjects('TMQuoteDataHolder');
        var tmProjects = projects.asList();
        projects.close();
        return tmProjects;
    } catch (e) {
        log.error('Error in Script GetProjects', e);
        return null;
    }
}

module.exports = {
    execute: execute
};
