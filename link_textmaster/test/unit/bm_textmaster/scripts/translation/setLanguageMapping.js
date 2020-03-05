'use strict';

var assert = require('chai').assert;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();

describe('setLanguageMapping', function () {
    var setLanguageMapping = proxyquire('../../../../../cartridges/bm_textmaster/cartridge/scripts/translation/setLanguageMapping', {
        'dw/system/Site': {
            current: {
                getCustomPreferenceValue: function () {
                    return '[{"dw":"en-us","tm":"en-us"},{"dw":"de","tm":"de-de"}]';
                },
                setCustomPreferenceValue: function () {}
            }
        },
        'dw/system/Transaction': {
            begin: function () {},
            commit: function () {}
        },
        'dw/system/Logger': {
            error: function () {}
        }
    });

    it('should return success', function () {
        var input = {
            currDwLangCode: 'de',
            currTmLangCode: 'de-de'
        };
        var result = setLanguageMapping.outputData(input);
        assert.equal(result, true);
    });
});
