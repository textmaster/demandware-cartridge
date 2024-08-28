'use strict';

/* API Includes */
var Site = require('dw/system/Site');

/* Script Includes */
var utils = require('*/cartridge/scripts/utils/tmUtils');

/**
 * Save default attributes in custom cache
 * @param {string} prefName - object cache file name
 * @param {string} prefValue - object attributes list to save to cache file
 * */
function saveDefaultAttributesInCache(prefName, prefValue) {
    var customCache = require('*/cartridge/scripts/utils/customCacheWebdav');
    var siteID = Site.current.ID;
    var cacheUrl = '/' + siteID + '/configurations/default-attributes/' + prefName;

    customCache.setCache(cacheUrl, prefValue);
}

/**
 * Saves default attributes
 * @param {Object} input - input object
 * @returns {Object} output object
 */
function getOutput(input) {
    var itemType = input.ItemType;
    var attributes = input.Attributes.toArray();
    var attributeList = [];

    for (var attr = 0; attr < attributes.length; attr++) {
        attributeList.push(attributes[attr].split('|')[0]);
    }

    var prefName = 'TM' + utils.firstLetterCapital(itemType) + 'Attributes';
    var prefValue = JSON.stringify(attributeList);

    saveDefaultAttributesInCache(prefName, prefValue);

    return {
        output: 'success'
    };
}

module.exports = {
    output: getOutput
};
