'use strict';

/**
 * Generates Page designer object list from content library XML
 */
function start() {
    var pageUtils = require('*/cartridge/scripts/utils/tmPageUtils');
    var items = require('~/cartridge/scripts/translation/tmPageDesigners').getPageDesignerList();
    pageUtils.setPageItems(items);
}

module.exports = {
    execute: start
};
