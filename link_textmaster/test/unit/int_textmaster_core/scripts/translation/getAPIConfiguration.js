'use strict';

var assert = require('chai').assert;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();

describe('getAPIConfigurations', function () {
    var getAPIConfigurations = proxyquire('../../../../../cartridges/int_textmaster_core/cartridge/scripts/translation/getAPIConfigurations', {
        'dw/system/Site': {
            current: {
                getCustomPreferenceValue: function (params) {
                    return params;
                }
            }
        },
        'dw/web/Resource': {
            msg: function (params) {
                return params;
            }
        },
        '~/cartridge/scripts/utils/tmUtils': {
            textMasterPublic: function () {
                return {
                    categories: []
                };
            }
        }
    });

    it('should return custom preference setting', function () {
        var result = getAPIConfigurations.output();
        assert.equal(result.APIKey, 'TMApiKey');
    });
});
