'use strict';

/*
 *    Utility functions for the page designer
 */

/* Script Includes */
var customCache = require('*/cartridge/scripts/utils/customCacheWebdav');

// Global Variables
var Utils = {};
var Site = require('dw/system/Site');

/**
 * Gets Page's custom attributes from custom cache
 * @param {string} pageID - pageID
 * @returns {Object} file if exists in cache otherwise null
 */
Utils.getPageCustom = function (pageID) {
    var siteID = Site.current.ID;
    var pageCustomUrl = '/' + siteID + '/pages/' + pageID + '/custom';
    var custom = customCache.getCache(pageCustomUrl);

    return custom || {};
};

/**
 * Sets Page's custom attributes from custom cache
 * @param {string} pageID - pageID
 * @param {Object} custom - cached content
 */
Utils.setPageCustom = function (pageID, custom) {
    var siteID = Site.current.ID;
    var pageCustomUrl = '/' + siteID + '/pages/' + pageID + '/custom';
    customCache.setCache(pageCustomUrl, custom);
};

/**
 * Gets Page Component's custom attributes from custom cache
 * @param {string} componentID - componentID
 * @returns {Object} file if exists in cache otherwise null
 */
Utils.getComponentCustom = function (componentID) {
    var siteID = Site.current.ID;
    var componentCustomUrl = '/' + siteID + '/components/' + componentID + '/custom';
    var custom = customCache.getCache(componentCustomUrl);

    return custom || {};
};

/**
 * Sets Page Component's custom attributes on custom cache
 * @param {string} componentID - componentID
 * @param {Object} custom - custom object
 */
Utils.setComponentCustom = function (componentID, custom) {
    var siteID = Site.current.ID;
    var componentCustomUrl = '/' + siteID + '/components/' + componentID + '/custom';
    customCache.setCache(componentCustomUrl, custom);
};

/**
 * Sets input object for jobs
 * @param {string} jobName - job's name
 * @param {Object} input - input object
 */
Utils.setInputForJob = function (jobName, input) {
    var siteID = Site.current.ID;
    var cacheUrl = '/' + siteID + '/pages/jobinput/' + jobName;
    customCache.setCache(cacheUrl, input);
};

/**
 * Gets input object for jobs
 * @param {string} jobName - job's name
 * @returns {Object} input - job's input object
 */
Utils.getInputForJob = function (jobName) {
    var siteID = Site.current.ID;
    var cacheUrl = '/' + siteID + '/pages/jobinput/' + jobName;
    var input = customCache.getCache(cacheUrl);

    return input;
};

/**
 * Sets Page Designer Objects list into custom cache (by a job)
 * @param {Object} items - array of page designer objects
 */
Utils.setPageItems = function (items) {
    var siteID = Site.current.ID;
    var pageItemsUrl = '/' + siteID + '/pages/page-items';
    customCache.setCache(pageItemsUrl, items);
};

/**
 * Gets Page Designer Objects list from custom cache (this data is supposed be populated by a job)
 * @param {string} exportDate - export date in search form
 * @returns {Object} array of page designer objects
 */
Utils.getPageItems = function (exportDate) {
    var siteID = Site.current.ID;
    var pageItemsUrl = '/' + siteID + '/pages/page-items';
    var pages = customCache.getCache(pageItemsUrl);
    var customAttributes;
    var items = [];

    if (pages) {
        for (var i = 0; i < pages.length; i++) {
            customAttributes = Utils.getPageCustom(pages[i].ID);
            pages[i].custom = customAttributes;

            if (exportDate) {
                if (!Utils.isRecentlyExported(customAttributes.exportDate, exportDate)) {
                    items.push(pages[i]);
                }
            } else {
                items.push(pages[i]);
            }
        }
    }

    return items || [];
};

/**
 * Sets Page components list into custom cache (this data is supposed be populated by a job)
 * @param {string} pageID - pageID
 * @param {Object} items - array of page component objects
 */
Utils.setPageComponents = function (pageID, items) {
    var siteID = Site.current.ID;
    var componentItemsUrl = '/' + siteID + '/pages/' + pageID + '/components';
    customCache.setCache(componentItemsUrl, items);
};

/**
 * Gets Page components list from custom cache
 * @param {string} pageID - pageID
 * @param {string} exportDate - export Date
 * @returns {Object} array of page designer objects
 */
Utils.getPageComponents = function (pageID, exportDate) {
    var siteID = Site.current.ID;
    var componentItemsUrl = '/' + siteID + '/pages/' + pageID + '/components';
    var components = customCache.getCache(componentItemsUrl);
    var customAttributes;
    var items = [];

    if (components) {
        for (var i = 0; i < components.length; i++) {
            customAttributes = Utils.getComponentCustom(components[i].id);
            components[i].custom = customAttributes;

            if (exportDate) {
                if (!Utils.isRecentlyExported(customAttributes.exportDate, exportDate)) {
                    items.push(components[i]);
                }
            } else {
                items.push(components[i]);
            }
        }
    }

    return items || [];
};

/**
 * Clears Page components list from custom cache
 * @param {string} pageID - pageID
 */
Utils.clearPageComponents = function (pageID) {
    var siteID = Site.current.ID;
    var componentItemsUrl = '/' + siteID + '/pages/' + pageID + '/components.txt';
    customCache.clearCache(componentItemsUrl);
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
