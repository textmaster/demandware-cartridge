'use strict';

var assert = require('chai').assert;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();

describe('handleAutoLaunch', function () {
    var handleAutoLaunch = proxyquire('../../../../../cartridges/bm_textmaster/cartridge/scripts/translation/handleAutoLaunch', {
        'dw/system/Site': {
            getCurrent: function () {
                return {
                    getCustomPreferenceValue: function (params) {
                        return params;
                    }
                };
            },
            current: {
                status: 'notprotected',
                ID: 'siteID'
            },
            SITE_STATUS_PROTECTED: 'protected'
        },
        'dw/system/System': {
            instanceHostname: 'instanceHostname'
        },
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
            },
            triggerURL: function () {}
        }
    });

    it('should handle autoLaunch', function () {
        var input = {
            ProjectID: 'ProjectID',
            AutoLaunch: {
                toLowerCase: function () {
                    return 'false';
                }
            }
        };
        var result = handleAutoLaunch.output(input);
        assert.equal(result.status, 'success');
    });
});
