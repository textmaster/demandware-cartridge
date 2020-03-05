'use strict';

/* API Includes */
var CatalogMgr = require('dw/catalog/CatalogMgr');

/* Script Includes */
var utils = require('*/cartridge/scripts/utils/tmUtils');

/**
 * Gets category dropdown list of a catalog
 * @param {Object} input - input object
 * @returns {Array} catagory list
 */
function getOutput(input) {
    var subCategories = [];

    if (input.CatalogID) {
        var catalog = CatalogMgr.getCatalog(input.CatalogID);
        var rootCategory = catalog.getRoot();
        subCategories = utils.getAllSubCategoriesHierarchy(rootCategory, input.ItemType);
    }

    return {
        CategoryList: subCategories
    };
}

module.exports = {
    output: getOutput
};
