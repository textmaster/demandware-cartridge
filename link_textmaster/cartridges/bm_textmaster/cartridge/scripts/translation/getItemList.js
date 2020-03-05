'use strict';

/* API Includes */
var ContentMgr = require('dw/content/ContentMgr');
var CatalogMgr = require('dw/catalog/CatalogMgr');

/* Script Includes */
var logUtils = require('*/cartridge/scripts/utils/tmLogUtils');
var utils = require('*/cartridge/scripts/utils/tmUtils');

var log = logUtils.getLogger('GetItemList');

/**
 * Gets all sub folders of a library root content folder, in an array
 * @param {Object} contentFolder - content folder
 * @returns {Object} output
 */
function getSubContentFolders(contentFolder) {
    var output = [];

    var subContentFolders = contentFolder.subFolders;
    for (var index = 0; index < subContentFolders.length; index++) {
        output.push(subContentFolders[index]);
        var nextLevelContentFolders = getSubContentFolders(subContentFolders[index]);
        output.push.apply(output, nextLevelContentFolders);
    }

    return output;
}

/**
 * Gets category list of a catalog
 * @param {Object} input - input object
 * @returns {Object} - item list object
 */
function getOutput(input) {
    var itemType = input.ItemType;
    var catalog = input.Catalog ? CatalogMgr.getCatalog(input.Catalog) : null;
    var categoryIDs = input.Category ? input.Category.split(',') : (catalog ? [catalog.getRoot().ID] : []); // eslint-disable-line no-nested-ternary
    var items = [];
    var allCategories = [];

    if (!itemType || (itemType !== 'content' && !catalog)) {
        log.error('Mandatory values are missing for getting item list');

        return {
            Type: itemType,
            ItemList: []
        };
    }

    /* Populate item list according to the itemType selected */
    switch (itemType) { // eslint-disable-line default-case
    case 'product':
        for (var prodCatID = 0; prodCatID < categoryIDs.length; prodCatID++) {
            var category = CatalogMgr.getCategory(categoryIDs[prodCatID]);
            allCategories.push(category);
        }

        for (var prodCat = 0; prodCat < allCategories.length; prodCat++) {
            var products = allCategories[prodCat].getProducts();

            for (var prod = 0; prod < products.length; prod++) {
                if (!(utils.isProductExistInList(items, products[prod]))) {
                    items.push(products[prod]);
                }
            }
        }
        break;
    case 'category':
        for (var catID = 0; catID < categoryIDs.length; catID++) {
            var rootCategory = CatalogMgr.getCategory(categoryIDs[catID]);
            var subCategories = utils.getAllSubCategories(rootCategory);

            for (var cat = 0; cat < subCategories.length; cat++) {
                if (!(utils.isCategoryExistInList(items, subCategories[cat]))) {
                    items.push(subCategories[cat]);
                }
            }

            if (!(utils.isCategoryExistInList(items, rootCategory))) {
                items.push(rootCategory);
            }

            if (subCategories.length && !(utils.isCategoryNameExistInList(allCategories, rootCategory))) {
                allCategories.push(rootCategory);
            }
        }
        break;
    case 'content':
        var library = ContentMgr.siteLibrary;
        var rootContentFolder = library.root;
        var subContentFolders = getSubContentFolders(rootContentFolder);
        /* read all contents of root content folder, convert to array and keep in items */
        var contents = rootContentFolder.content;
        items = contents.toArray();

        /* read all contents of sub content folders, convert to array and append to items */
        for (var index = 0; index < subContentFolders.length; index++) {
            contents = subContentFolders[index].content;
            items.push.apply(items, contents.toArray());
        }

        break;
    }

    return {
        Type: itemType,
        ItemList: items,
        CategoryList: allCategories
    };
}

module.exports = {
    output: getOutput
};
