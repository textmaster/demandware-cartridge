'use strict';

/*
 *	Utility functions for the page designer
 */

/* Script Includes */
var customCache = require('*/cartridge/scripts/utils/customCacheWebdav');

// Global Variables
var Utils = {};

/**
 * Gets Page's custom attributes from custom cache
 * @param {string} pageID - pageID
 * @returns {Object} file if exists in cache otherwise null
 */
Utils.getPageCustom = function (pageID) {
    var pageCustomUrl = '/pages/' + pageID + '/custom';
    var custom = customCache.getCache(pageCustomUrl);

    return custom || {};
};

/**
 * Gets Page Component's custom attributes from custom cache
 * @param {string} componentID - componentID
 * @returns {Object} file if exists in cache otherwise null
 */
Utils.getComponentCustom = function (componentID) {
    var componentCustomUrl = '/components/' + componentID + '/custom';
    var custom = customCache.getCache(componentCustomUrl);

    return custom || {};
};

/**
 * Sets Page's custom attributes from custom cache
 * @param {string} pageID - pageID
 * @param {Object} custom - cached content
 */
Utils.setPageCustom = function (pageID, custom) {
    var pageCustomUrl = '/pages/' + pageID + '/custom';
    customCache.setCache(pageCustomUrl, custom);
};

/**
 * Compares the item's last export date with the selected date
 * @param {Date} pageExportDate - Last exported date of the page
 * @param {Date} checkExportDate - exported date to check with
 * @returns {boolean} - true or false
 */
Utils.isRecentlyExported = function (pageExportDate, checkExportDate) {
    if (pageExportDate && checkExportDate) {
        var exportDate = new Date(pageExportDate);
        var lastExportedDate = exportDate ? exportDate.toISOString().substr(0, 10) : '';

        return (lastExportedDate && (lastExportedDate > checkExportDate || lastExportedDate === checkExportDate));
    }

    return false;
};

module.exports = Utils;
