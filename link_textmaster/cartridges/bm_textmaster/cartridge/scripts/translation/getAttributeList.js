'use strict';
/* eslint no-continue: 0 */

/* API Includes */
var Site = require('dw/system/Site');
var SystemObjectMgr = require('dw/object/SystemObjectMgr');

/* Script Includes */
var utils = require('*/cartridge/scripts/utils/tmUtils');
var logUtils = require('*/cartridge/scripts/utils/tmLogUtils');

var log = logUtils.getLogger('GetAttributeList');

/**
 * Gets flag by checking attribute in default attribute list that set in preference
 * @param {string} ID - attribute ID
 * @param {string} name - attribute name
 * @param {Array} defaultAttributes - default attribute list
 * @returns {boolean} result
 */
function getTMDefault(ID, name, defaultAttributes) {
    var result = false;

    if (defaultAttributes && defaultAttributes.length > 0) {
        for (var attr = 0; attr < defaultAttributes.length; attr++) {
            if (defaultAttributes[attr] === ID || defaultAttributes[attr] === name) {
                result = true;
                break;
            }
        }
    }

    return result;
}

/**
 * Load Default Attributes from Cache
 * @param {string} cacheFileName - Cache file name
 * @returns {Object} defaultAttributes
 * */
function loadDefaultAttributesFromCache(cacheFileName) {
    var customCache = require('*/cartridge/scripts/utils/customCacheWebdav');
    var siteID = Site.current.ID;
    var cacheUrl = '/' + siteID + '/configurations/default-attributes/' + cacheFileName;
    var defaultAttributes = customCache.getCache(cacheUrl);

    return defaultAttributes;
}

/**
 * Gets attribute list for a particular item type (product, content, category)
 * @param {Object} input - input object
 * @returns {Object} attributes array
 */
function getOutput(input) {
    var attributes = [];
    var itemType = input.itemType;
    var attrItemType = itemType === 'Pagedesigner' ? 'Content' : itemType; // Pagedesigner's attributes are of Content Asset
    var defaultAttributes = loadDefaultAttributesFromCache('TM' + itemType + 'Attributes');
    var attributeValueTypes = [3, 4, 5, 23]; /* string = 3, text: 4, html: 5, set of string = 23 */

    try {
        var attrDefinitions = SystemObjectMgr.describe(attrItemType).getAttributeDefinitions().toArray();

        for (var attrDef = 0; attrDef < attrDefinitions.length; attrDef++) {
            if ((attrItemType.toLowerCase() !== 'product' && attrDefinitions[attrDef].system && !utils.isAttributeAccessible(attrItemType.toLowerCase(), attrDefinitions[attrDef].ID)) || attrDefinitions[attrDef].ID === 'ID' || attrDefinitions[attrDef].ID === 'TranslatedLanguages' || attrDefinitions[attrDef].ID === 'UUID' || attrDefinitions[attrDef].ID === 'taxClassID') {
                continue;
            }

            if (itemType.toLowerCase() === 'pagedesigner' && (!attrDefinitions[attrDef].system || attrDefinitions[attrDef].ID === 'pageURL')) {
                // for page designers, no need to consider custom attributes of Content Asset
                continue;
            }

            if (attributeValueTypes.indexOf(attrDefinitions[attrDef].valueTypeCode) > -1) {
                var attr = {};
                attr.ID = attrDefinitions[attrDef].ID;
                attr.name = attrDefinitions[attrDef].displayName;
                attr.tmDefault = getTMDefault(attrDefinitions[attrDef].ID, attrDefinitions[attrDef].displayName, defaultAttributes);
                attr.type = attrDefinitions[attrDef].system ? 'system' : 'custom';

                attributes.push(attr);
            }
        }
    } catch (ex) {
        log.error('Exception on dealing with attributeDefinitions for ' + itemType + ': ' + ex.message);
    }

    return {
        Attributes: attributes
    };
}

module.exports = {
    output: getOutput
};
