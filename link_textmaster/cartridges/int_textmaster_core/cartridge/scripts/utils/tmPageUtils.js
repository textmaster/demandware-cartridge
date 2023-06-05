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
 * Gets Page Designer's custom attributes from custom cache
 * @param {string} pageID - pageID
 * @returns {Date} last modified date
 */
Utils.getPageLastModified = function (pageID) {
    var siteID = Site.current.ID;
    var pageItemsUrl = '/' + siteID + '/pages/' + pageID + '/lastmodified';
    var getLastModified = customCache.getCache(pageItemsUrl);
    var pageLastModified = getLastModified.lastModified;
    var lastModified = new Date(pageLastModified);
    lastModified = new Date(lastModified);

    return lastModified;
};

/**
 * Sets Page Designer's last modified date to custom cache
 * @param {string} pageID - pageID
 * @param {Date} lastModified - last modified date
 */
Utils.setPageLastModified = function (pageID, lastModified) {
    var siteID = Site.current.ID;
    var pageItemsUrl = '/' + siteID + '/pages/' + pageID + '/lastmodified';
    customCache.setCache(pageItemsUrl, lastModified);
};

/**
 * Gets Page component's custom attributes from custom cache
 * @param {string} componentID - componentID
 * @returns {Date} last modified date
 */
Utils.getPageComponentLastModified = function (componentID) {
    var siteID = Site.current.ID;
    var componentUrl = '/' + siteID + '/components/' + componentID + '/lastmodified';
    var getLastModified = customCache.getCache(componentUrl);
    var componentLastModified = getLastModified.lastModified;
    var lastModified = new Date(componentLastModified);

    return lastModified;
};

/**
 * Sets Page component's last modified date to custom cache
 * @param {string} componentID - componentID
 * @param {Date} lastModified - last modified date
 */
Utils.setPageComponentLastModified = function (componentID, lastModified) {
    var siteID = Site.current.ID;
    var componentUrl = '/' + siteID + '/components/' + componentID + '/lastmodified';
    customCache.setCache(componentUrl, lastModified);
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
 * @param {string} pageIDs - pageIDs
 * @param {string} exportDate - export Date
 * @returns {Object} array of page designer objects
 */
Utils.getPageComponents = function (pageIDs, exportDate) {
    var siteID = Site.current.ID;
    var items = [];
    var pageIDsArr = pageIDs.split(',');
    var pageID;
    var componentItemsUrl;
    var components;
    var customAttributes;
    var pages = Utils.getPageItems();
    var pageName;

    for (var k = 0; k < pageIDsArr.length; k++) {
        pageID = pageIDsArr[k];
        pageName = pageID;

        for (var m = 0; m < pages.length; m++) {
            if (pages[m].ID === pageID) {
                pageName = pages[m].name;
                break;
            }
        }

        componentItemsUrl = '/' + siteID + '/pages/' + pageID + '/components';
        components = customCache.getCache(componentItemsUrl);

        if (components) {
            for (var i = 0; i < components.length; i++) {
                customAttributes = Utils.getComponentCustom(components[i].id);
                components[i].custom = customAttributes;
                components[i].id = pageID + '|' + components[i].id;
                components[i].pageName = pageName;

                if (exportDate) {
                    if (!Utils.isRecentlyExported(customAttributes.exportDate, exportDate)) {
                        items.push(components[i]);
                    }
                } else {
                    items.push(components[i]);
                }
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
