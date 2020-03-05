var assert = require('chai').assert;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();

describe('getCategoryList', function () {
    var getCategoryList = proxyquire('../../../../../cartridges/bm_textmaster/cartridge/scripts/translation/getCategoryList', {
        'dw/catalog/CatalogMgr': {
            getCatalog: function (params) {
                return {
                    getRoot: function () {
                        return params;
                    }
                };
            }
        },
        '*/cartridge/scripts/utils/tmUtils': {
            getAllSubCategoriesHierarchy: function () {
                return ['tops', 'bottoms'];
            }
        }
    });

    it('should return category lists', function () {
        var input = {
            itemType: 'product',
            CatalogID: 'women-clothing'
        };
        var result = getCategoryList.output(input);
        assert.equal(result.CategoryList[0], 'tops');
        assert.equal(result.CategoryList[1], 'bottoms');
    });
});
