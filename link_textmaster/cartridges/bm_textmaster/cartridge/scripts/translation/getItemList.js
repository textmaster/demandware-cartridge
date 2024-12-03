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
    var contentIDs = input.ContentIDs ? input.ContentIDs.split(',') : [];
    var contentPage = input.ContentPage;
    var items = [];
    var allCategories = [];
    var isLastContentPage = true;
    var i;

    if (!itemType || (itemType === 'category' && !categoryIDs.length) || (itemType === 'product' && !categoryIDs.length && !productIDs.length)) {
        log.error('Mandatory values are missing for getting item list');

        return {
            Type: itemType,
            ItemList: []
        };
    }

    /* Populate item list according to the itemType selected */
    var Site = require('dw/system/Site');

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
            for (i = 0; i < productIDs.length; i++) {
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
        var content;

        if (contentIDs && contentIDs.length) {
            contentPage = 0;
            var consideredCIDs = [];

            for (i = 0; i < contentIDs.length; i++) {
                if (!consideredCIDs.includes(contentIDs[i].trim())) {
                    content = ContentMgr.getContent(contentIDs[i].trim());

                    if (content) {
                        if (!isLastExported(content, date)) {
                            items.push(content);
                            consideredCIDs.push(contentIDs[i].trim());
                        }
                    } else {
                        log.error('Content ID "' + contentIDs[i].trim() + '" is not valid so skipping on search');
                    }
                }
            }
        } else {
            const CONTENT_PAGE_SIZE = 1000;
            var skippedContents = 0;
            var library = ContentMgr.siteLibrary;
            var rootContentFolder = library.root;
            var subContentFolders = getSubContentFolders(rootContentFolder);
            /* read all contents of root content folder, convert to array and keep in items */
            var contents = rootContentFolder.content;
            var contentsArray = contents.toArray();
            contentPage = contentPage === 0 ? 1 : contentPage;

            if (contentPage === 1) {
                items = contentsArray.length <= CONTENT_PAGE_SIZE ? contentsArray : contentsArray.slice(0, CONTENT_PAGE_SIZE);
            } else if (contentsArray.length > (contentPage - 1) * CONTENT_PAGE_SIZE) {
                items = contentsArray.slice((contentPage - 1) * CONTENT_PAGE_SIZE, CONTENT_PAGE_SIZE);
            } else {
                skippedContents = contentsArray.length;
            }

            if (items.length < CONTENT_PAGE_SIZE) {
                /* read all contents of sub content folders, convert to array and append to items */
                for (var index = 0; index < subContentFolders.length; index++) {
                    contents = subContentFolders[index].content.toArray();

                    for (var con = 0; con < contents.length; con++) {
                        content = contents[con];

                        if (!isLastExported(content, date)) {
                            if (contentPage === 1) {
                                items.push(content);

                                if (items.length === CONTENT_PAGE_SIZE) {
                                    break;
                                }
                            } else if (skippedContents < (contentPage - 1) * CONTENT_PAGE_SIZE) {
                                skippedContents++;
                            } else {
                                items.push(content);

                                if (items.length === CONTENT_PAGE_SIZE) {
                                    break;
                                }
                            }
                        }
                    }

                    if (items.length === CONTENT_PAGE_SIZE) {
                        break;
                    }
                }
            }

            if (items.length === CONTENT_PAGE_SIZE) {
                isLastContentPage = false;
            }
        }

        break;
    case 'folder':
        var libraryType = Site.getCurrent().getCustomPreferenceValue('TMLibraryType').value;
        var folderlibrary;
        if (libraryType === 'shared') {
            folderlibrary = ContentMgr.siteLibrary;
        } else if (libraryType === 'private') {
            folderlibrary = ContentMgr.getLibrary(ContentMgr.PRIVATE_LIBRARY);
        }
        var rootFolder = folderlibrary.root;
        var listOfFolders = getSubContentFolders(rootFolder);

        for (var j = 0; j < listOfFolders.length; j++) {
            if (!isLastExported(listOfFolders[j], date)) {
                items.push(listOfFolders[j]);
            }
        }
        break;
    }

    return {
        Type: itemType,
        ItemList: items,
        CategoryList: allCategories,
        ContentPage: contentPage,
        IsLastContentPage: isLastContentPage
    };
}

module.exports = {
    output: getOutput
};
