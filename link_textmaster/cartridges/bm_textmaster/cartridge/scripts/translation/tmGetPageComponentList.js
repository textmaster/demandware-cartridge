'use strict';

/* API Includes */

/* Script Includes */
var pageUtils = require('*/cartridge/scripts/utils/tmPageUtils');

/**
 * Gets category list of a catalog
 * @param {Object} input - input object
 * @returns {Object} - item list object
 */
function getOutput(input) {
    var items = [];
    var componentMgr = require('~/cartridge/scripts/translation/tmPageComponents');
    var components = componentMgr.getComponents(input);
    var item;
    var i;
    var component;
    var customAttributes;
    var lastModified;
    var attrFound;

    for (i = 0; i < components.length; i++) {
        component = components[i];
        customAttributes = pageUtils.getComponentCustom(component.id);
        lastModified = pageUtils.getPageComponentLastModified(component.id);
        if (!lastModified) {
            pageUtils.setPageComponentLastModified(component.id, { lastModified: new Date() });
        }
        attrFound = false;

        if (component.data) {
            item = {
                id: component.id,
                name: component.name,
                type: component.type,
                lastModified: lastModified || new Date(),
                attributes: [],
                custom: {
                    TranslatedLanguages: customAttributes.TranslatedLanguages || ''
                }
            };

            Object.keys(component.data).forEach(function (key) { // eslint-disable-line no-loop-func
                if (Object.prototype.hasOwnProperty.call(component.data, key)) {
                    if (typeof (component.data[key]) === 'string') {
                        item.attributes.push(key);
                        attrFound = true;
                    }
                }
            });

            if (attrFound) {
                items.push(item);
            }
        }
    }

    return items;
}

module.exports = {
    output: getOutput
};
