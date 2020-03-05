'use strict';

var assert = require('chai').assert;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();

describe('getLanguageToList', function () {
    var getLanguageToList = proxyquire('../../../../../cartridges/bm_textmaster/cartridge/scripts/translation/getLanguageToList', {
        '*/cartridge/scripts/utils/tmUtils': {
            getLanguageTo: function () {
                return 'French';
            }
        }
    });

    it('should return languageTo list', function () {
        var input = {
            LanguageFrom: 'en-us'
        };
        var result = getLanguageToList.output(input);
        assert.equal(result.LanguageToList, 'French');
    });
});
