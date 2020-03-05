'use strict';

var assert = require('chai').assert;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();

describe('saveDefaultAttributes', function () {
    var saveDefaultAttributes = proxyquire('../../../../../cartridges/bm_textmaster/cartridge/scripts/translation/saveDefaultAttributes', {
        'dw/system/Site': {
            getCurrent: function () {
                return {
                    setCustomPreferenceValue: function () {}
                };
            }
        },
        'dw/system/Transaction': {
            begin: function () {},
            commit: function () {}
        },
        '*/cartridge/scripts/utils/tmUtils': {
            firstLetterCapital: function () {}
        }
    });

    it('should return success', function () {
        var input = {
            ItemType: 'product',
            Attributes: {
                toArray: function () {
                    return ['displayName', 'pageDescription', 'pageTitle'];
                }
            }
        };
        var result = saveDefaultAttributes.output(input);
        assert.equal(result.output, 'success');
    });
});
