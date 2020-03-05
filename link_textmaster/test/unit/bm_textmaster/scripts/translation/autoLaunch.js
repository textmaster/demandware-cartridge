'use strict';

var proxyquire = require('proxyquire').noCallThru().noPreserveCache();

describe('autoLaunch', function () {
    var autoLaunch = proxyquire('../../../../../cartridges/bm_textmaster/cartridge/scripts/translation/autoLaunch', {
        'dw/object/CustomObjectMgr': {
            remove: function () {}
        },
        'dw/web/Resource': {
            msg: function (params) {
                return params;
            }
        },
        'dw/system/Transaction': {
            begin: function () {},
            commit: function () {}
        },
        '*/cartridge/scripts/utils/tmUtils': {
            config: {
                api: {
                    get: {
                        project: 'project'
                    }
                }
            },
            textMasterClient: function () {}
        },
        '*/cartridge/scripts/utils/tmLogUtils': {
            getLogger: function () {
                return {
                    error: function () {},
                    debug: function () {}
                };
            }
        }
    });

    it('should auto launch the translation', function () {
        var autoLaunchObject = {
            custom: {
                ID: 'someID',
                documents: '["someID"]',
                documentCount: 1
            },
            lastModified: {
                getTime: function () {}
            }
        };
        autoLaunch.output(autoLaunchObject);
    });
});
