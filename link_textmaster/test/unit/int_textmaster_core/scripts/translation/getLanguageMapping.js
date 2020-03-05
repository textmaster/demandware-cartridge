'use strict';

var assert = require('chai').assert;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();

describe('getLanguageMapping', function () {
    var getLanguageMapping = proxyquire('../../../../../cartridges/int_textmaster_core/cartridge/scripts/translation/getLanguageMapping', {
        '~/cartridge/scripts/utils/tmLogUtils': {
            getLogger: function () {
                return {
                    error: function () {}
                };
            }
        },
        '~/cartridge/scripts/utils/tmUtils': {
            getLocaleName: function () {
                return 'French';
            },
            getTMLocaleName: function () {
                return 'French';
            },
            isLocaleEnabled: function () {
                return true;
            }
        },
        '~/cartridge/scripts/translation/getAPIConfigurations': {
            output: function () {
                return {
                    tmLanguageMapping: '[{"dw":"fr","tm":"fr-fr"}]'
                };
            }
        }
    });

    it('should return language mapping list', function () {
        var result = getLanguageMapping.data;
        assert.equal(result[0].dwName, 'French');
        assert.equal(result[0].enabled, true);
    });
});
