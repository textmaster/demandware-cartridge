'use strict';

/**
 * Generates Page designer object list from content library XML
 */
function start() {
    var pageUtils = require('*/cartridge/scripts/utils/tmPageUtils');
    var items = require('~/cartridge/scripts/translation/tmPageDesigners').getPageDesignerList();
    pageUtils.setPageItems(items);

    for (var i = 0; i < items.length; i++) {
        var itemID = items[i].ID;
        var lastModified = {
            lastModified: new Date()
        };
        pageUtils.setPageLastModified(itemID, lastModified);
    }
}

module.exports = {
    execute: start
};
