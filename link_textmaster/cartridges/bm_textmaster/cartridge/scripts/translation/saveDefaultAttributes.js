'use strict';

/* API Includes */
var Site = require('dw/system/Site');
var Transaction = require('dw/system/Transaction');

/* Script Includes */
var utils = require('*/cartridge/scripts/utils/tmUtils');

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

    Transaction.begin();
    Site.getCurrent().setCustomPreferenceValue(prefName, prefValue);
    Transaction.commit();

    return {
        output: 'success'
    };
}

module.exports = {
    output: getOutput
};
