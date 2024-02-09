'use strict';

var assert = require('chai').assert;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();

describe('setAPIConfigurations', function () {
    var setAPIConfigurations = proxyquire('../../../../../cartridges/bm_textmaster/cartridge/scripts/translation/setAPIConfigurations', {
        'dw/system/Site': {
            current: {
                setCustomPreferenceValue: function () {}
            }
        },
        'dw/system/Transaction': {
            begin: function () {},
            commit: function () {}
        }
    });

    it('should return true', function () {
        var input = {
            APIKey: 'APIKey',
            APISecret: 'APISecret',
            TMCategoryCode: 'TMCategoryCode',
            APICatalogID: 'APICatalogID',
            APIEnv: 'demo',
            APICache: 'false',
            TMPageSize: 20,
            tmApiBaseUrlDemo: 'https://demo.base.com/',
            tmApiBaseUrlLive: 'https://live.base.com/',
            tmBackofficeBaseUrlLive: 'https://live.backoffice.base.com/',
            tmBackofficeBaseUrlDemo: 'https://demo.backoffice.base.com/',
            tmApiVersionUrlLive: 'v1',
            tmApiVersionUrlDemo: 'v1',
            TMSFpassword: 'password'
        };
        var result = setAPIConfigurations.output(input);
        assert.equal(result, true);
    });
});
