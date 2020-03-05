'use strict';

/* API Includes */
var ProductMgr = require('dw/catalog/ProductMgr');
var CatalogMgr = require('dw/catalog/CatalogMgr');
var ContentMgr = require('dw/content/ContentMgr');
var Transaction = require('dw/system/Transaction');

/* Script Modules */
var LogUtils = require('*/cartridge/scripts/utils/tmLogUtils');

var log = LogUtils.getLogger('removeImportedFile');

/**
 * Update the custom attribute of item to keep list of translated languages
 * @param {string} itemType - item type
 * @param {string} itemID - item id
 * @param {string} language - import language
 */
function execute(itemType, itemID, language) {
    try {
        var item;
        switch (itemType) { // eslint-disable-line default-case
        case 'product':
            item = ProductMgr.getProduct(itemID);
            break;
        case 'category':
            item = CatalogMgr.getCategory(itemID);
            break;
        case 'content':
            item = ContentMgr.getContent(itemID);
            break;
        }

        Transaction.begin();
        if (item.custom.TranslatedLanguages !== '' && item.custom.TranslatedLanguages != null) {
            if (item.custom.TranslatedLanguages.indexOf(language) < 0) {
                item.custom.TranslatedLanguages += ',' + language;
            }
        } else {
            item.custom.TranslatedLanguages = language;
        }
        Transaction.commit();
    } catch (ex) {
        log.error(ex.message);
    }
}

module.exports = {
    execute: execute
};
