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
 * Gets attribute list for a particular item type (product, content, category)
 * @param {Object} input - input object
 * @returns {Object} attributes array
 */
function getOutput(input) {
    var attributes = [];
    var itemType = input.itemType;
    var defaultAttributes = Site.getCurrent().getCustomPreferenceValue('TM' + itemType + 'Attributes');

    try {
        defaultAttributes = defaultAttributes ? JSON.parse(defaultAttributes) : null;
    } catch (ex) {
    	log.error('Exception on getting default attribute list for ' + input.itemType + ' from Site Preferences: ' + ex.message);
    }

    try {
    	var attrDefinitions = SystemObjectMgr.describe(input.itemType).getAttributeDefinitions().toArray();

        for (var attrDef = 0; attrDef < attrDefinitions.length; attrDef++) {
        	if ((input.itemType.toLowerCase() !== 'product' && attrDefinitions[attrDef].system && !utils.isAttributeAccessible(input.itemType.toLowerCase(), attrDefinitions[attrDef].ID)) || attrDefinitions[attrDef].ID === 'ID' || attrDefinitions[attrDef].ID === 'TranslatedLanguages' || attrDefinitions[attrDef].ID === 'UUID' || attrDefinitions[attrDef].ID === 'taxClassID') {
                continue;
            }

            if (attrDefinitions[attrDef].valueTypeCode === 3 || attrDefinitions[attrDef].valueTypeCode === 4 || attrDefinitions[attrDef].valueTypeCode === 5) {
                var attr = {};
                attr.ID = attrDefinitions[attrDef].ID;
                attr.name = attrDefinitions[attrDef].displayName;
                attr.tmDefault = getTMDefault(attrDefinitions[attrDef].ID, attrDefinitions[attrDef].displayName, defaultAttributes);
                attr.type = attrDefinitions[attrDef].system ? 'system' : 'custom';

                attributes.push(attr);
            }
        }
    } catch (ex) {
    	log.error('Exception on dealing with attributeDefinitions for ' + input.itemType + ': ' + ex.message);
    }

    return {
        Attributes: attributes
    };
}

module.exports = {
    output: getOutput
};
