var assert = require('chai').assert;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();

describe('getItemList', function () {
    var getItemList = proxyquire('../../../../../cartridges/bm_textmaster/cartridge/scripts/translation/getItemList', {
        'dw/catalog/CatalogMgr': {
            getCatalog: function (params) {
                return {
                    getRoot: function () {
                        return params;
                    }
                };
            },
            getCategory: function () {
                return {
                    getProducts: function () {
                        return [{
                            ID: '1111',
                            name: 'shirt'
                        }];
                    }
                };
            }
        },
        'dw/content/ContentMgr': {
            siteLibrary: {
                root: {
                    subFolders: [{
                        length: 1,
                        ID: 'about-us',
                        displayName: 'About Us',
                        subFolders: [{
                            length: 1
                        }]
                    }]
                }
            },
            getRoot: function () {
                return {
                    ID: 'storefront'
                };
            }
        },
        '*/cartridge/scripts/utils/tmUtils': {
            isProductExistInList: function () {
                return false;
            },
            getAllSubCategories: function () {
                return [{
                    ID: 'women-clothing',
                    displayName: 'Women Clothing'
                }];
            },
            isCategoryExistInList: function () {
                return false;
            },
            isCategoryNameExistInList: function () {
                return false;
            }
        },
        '*/cartridge/scripts/utils/tmLogUtils': {
            getLogger: function () {
                return {
                    error: function () {}
                };
            }
        }
    });

    it('should return product item list', function () {
        var input = {
            ItemType: 'product',
            Catalog: 'storefront',
            Category: {
                split: function () {
                    return ['men'];
                }
            }
        };
        var result = getItemList.output(input);
        assert.equal(result.Type, 'product');
        assert.equal(result.ItemList[0].ID, '1111');
    });

    it('should return category item list', function () {
        var input = {
            ItemType: 'category',
            Catalog: 'storefront',
            Category: {
                split: function () {
                    return ['men'];
                }
            }
        };
        var result = getItemList.output(input);
        assert.equal(result.Type, 'category');
        assert.equal(result.ItemList[0].ID, 'women-clothing');
    });

    it('should return empty item list if itemtype is missing', function () {
        var input = {
            ItemType: ''
        };
        var result = getItemList.output(input);
        assert.equal(result.Type, '');
    });
});
