'use strict';

var assert = require('chai').assert;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();

describe('apiKeyTest', function () {
    var apiKeyTest = proxyquire('../../../../../cartridges/bm_textmaster/cartridge/scripts/translation/apiKeyTest', {
        'dw/web/Resource': {
            msg: function (params) {
                return params;
            }
        },
        '*/cartridge/scripts/utils/tmUtils': {
            textMasterTest: function () {
                return {
                    message: 'api.test.msg.key.api.test.msg.secret'
                };
            }
        }
    });

    it('should return output success', function () {
        var result = apiKeyTest.output();
        assert.equal(result, 'success');
    });
});
