'use strict';

/* API Includes */
var Site = require('dw/system/Site');

/* Script Includes */
var utils = require('*/cartridge/scripts/utils/tmUtils');

/**
 * Reads translation parameters from previous form, build and generate a JSON
 * @param {Object} input - object
 * @returns {Object} Translation parameter object
 */
function getOutput(input) {
    var localeFrom = input.LocaleFrom;
    var mappedLocaleFrom = input.MappedLocaleFrom;
    var itemType = input.ItemType;
    var localeTo = input.LocaleTo;
    var mappedLocaleTo = input.MappedLocaleTo;
    var attributes = input.Attributes;
    var items = input.Items;
    var localeFromName = utils.getLocaleName(localeFrom);
    var count = 0;
    var catalogID;

    // Get Master Catalog ID from site preference
    if (itemType === 'product') {
        catalogID = Site.current.getCustomPreferenceValue('TMMasterCatalogID') || '';
    } else if (itemType === 'category') {
        catalogID = require('dw/catalog/CatalogMgr').siteCatalog.ID;
    }

    for (var loc = 0; loc < localeTo.length; loc++) {
        var locale = localeTo[loc];
        var localeName = utils.getLocaleName(locale);
        localeTo[count] = {
            id: utils.toTextMasterLocaleID(locale),
            name: localeName,
            template: {}
        };
        count++;
    }

    count = 0;
    for (var index = 0; index < attributes.length; index++) {
        var attribute = attributes[index];
        var attr = attribute.split('|');

        if (itemType === 'component') {
            attributes[count] = {
                componentID: attr[0],
                id: attr[1],
                componentName: attr[2]
            };
        } else {
            attributes[count] = {
                id: attr[0],
                name: attr[1],
                type: attr[2]
            };
        }

        count++;
    }

    var output = {
        localeFrom: {
            id: utils.toTextMasterLocaleID(localeFrom),
            name: localeFromName
        },
        localeTo: localeTo,
        mappedLocaleFrom: utils.toTextMasterLocaleID(mappedLocaleFrom),
        mappedLocaleTo: mappedLocaleTo,
        itemType: itemType,
        catalogID: catalogID,
        attributes: attributes,
        pageID: input.PageID,
        items: items
    };

    return {
        TransParams: JSON.stringify(output)
    };
}

module.exports = {
    output: getOutput
};
