'use strict';

/* API Includes */
var ContentMgr = require('dw/content/ContentMgr');
var CatalogMgr = require('dw/catalog/CatalogMgr');
var ProductMgr = require('dw/catalog/ProductMgr');

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
 * Compares the item's last export date with the selected date
 * @param {Object} type - product/category/content object
 * @param {Date} date - selected date on the web page
 * @returns {boolean} - true or false
 */
function isLastExported(type, date) {
    var lastExportedDate = type.custom.exportDate ? type.custom.exportDate.toISOString().substr(0, 10) : '';
    return (date && lastExportedDate && (lastExportedDate > date || lastExportedDate === date));
}

/**
 * Gets category list of a catalog
 * @param {Object} input - input object
 * @returns {Object} - item list object
 */
function getOutput(input) {
    var date = input.Date;
    var itemType = input.ItemType;
    var categoryIDs = input.Category ? input.Category.split(',') : [];
    var productIDs = input.ProductIDs ? input.ProductIDs.split(',') : [];
    var items = [];
    var allCategories = [];

    if (!itemType || (itemType === 'category' && !categoryIDs.length) || (itemType === 'product' && !categoryIDs.length && !productIDs.length)) {
        log.error('Mandatory values are missing for getting item list');

        return {
            Type: itemType,
            ItemList: []
        };
    }

    /* Populate item list according to the itemType selected */
    switch (itemType) { // eslint-disable-line default-case
    case 'product':
        if (categoryIDs && categoryIDs.length) {
            for (var prodCatID = 0; prodCatID < categoryIDs.length; prodCatID++) {
                var category = CatalogMgr.getCategory(categoryIDs[prodCatID]);
                allCategories.push(category);
            }
    
            for (var prodCat = 0; prodCat < allCategories.length; prodCat++) {
                var products = allCategories[prodCat].getProducts();
    
                for (var prod = 0; prod < products.length; prod++) {
                    if (!(utils.isProductExistInList(items, products[prod])) && !isLastExported(products[prod], date)) {
                        items.push(products[prod]);
                    }
                }
            }
        } else {
            for (var i = 0; i < productIDs.length; i++) {
                var product = ProductMgr.getProduct(productIDs[i].trim());

                if (!(utils.isProductExistInList(items, product)) && !isLastExported(product, date)) {
                    items.push(product);
                }
            }
        }
        break;
    case 'category':
        for (var catID = 0; catID < categoryIDs.length; catID++) {
            var rootCategory = CatalogMgr.getCategory(categoryIDs[catID]);
            var subCategories = utils.getAllSubCategories(rootCategory);

            for (var cat = 0; cat < subCategories.length; cat++) {
                if (!(utils.isCategoryExistInList(items, subCategories[cat])) && !isLastExported(subCategories[cat], date)) {
                    items.push(subCategories[cat]);
                }
            }

            if (!(utils.isCategoryExistInList(items, rootCategory)) && !isLastExported(rootCategory, date)) {
                items.push(rootCategory);
            }

            if (subCategories.length && !(utils.isCategoryNameExistInList(allCategories, rootCategory)) && !isLastExported(rootCategory, date)) {
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
            contents = subContentFolders[index].content.toArray();
            for (var con = 0; con < contents.length; con++) {
                var content = contents[con];
                var contentCurrentIndex = contents.indexOf(content);

                if (isLastExported(content, date)) {
                    contents.splice(contentCurrentIndex, 1);
                    con--;
                }
            }
            items.push.apply(items, contents);
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
