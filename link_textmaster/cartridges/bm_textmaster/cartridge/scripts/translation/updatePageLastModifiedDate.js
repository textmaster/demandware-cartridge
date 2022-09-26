'use strict';

/* Script Modules */
var logUtils = require('*/cartridge/scripts/utils/tmLogUtils');
var pageUtils = require('*/cartridge/scripts/utils/tmPageUtils');

var log = logUtils.getLogger('removeImportedFile');

/**
 * Update the last modified date for page designer and component
 * @param {string} itemType - item type
 * @param {string} itemID - item id
 */
function execute(itemType, itemID) {
    try {
        var lastModified = {
            lastModified: new Date()
        };
        if (itemType === 'pagedesigner') {
            pageUtils.setPageLastModified(itemID, lastModified);
        } else if (itemType === 'component') {
            pageUtils.setPageComponentLastModified(itemID, lastModified);
        }
    } catch (ex) {
        log.error(ex.message);
    }
}

module.exports = {
    execute: execute
};
