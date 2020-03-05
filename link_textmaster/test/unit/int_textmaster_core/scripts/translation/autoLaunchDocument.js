'use strict';

var assert = require('chai').assert;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();

describe('autoLaunchDocument', function () {
    var autoLaunchDocument = proxyquire('../../../../../cartridges/int_textmaster_core/cartridge/scripts/translation/autoLaunchDocument', {
        'dw/system/Site': {
            current: {
                ID: 'SiteID'
            }
        },
        'dw/system/Transaction': {
            begin: function () {},
            commit: function () {}
        },
        'dw/object/CustomObjectMgr': {
            getCustomObject: function () {
                return {
                    custom: {
                        documents: '[]',
                        documentCount: 1
                    }
                };
            },
            createCustomObject: function () {}
        },
        '~/cartridge/scripts/utils/tmUtils': {
            config: {
                autolaunch: {
                    coName: '',
                    jobname: 'TextMasterAskQuote'
                },
                ocapi: {
                    jobs: {
                        post: '/dw/data/v20_2/jobs/{0}/executions'
                    }
                }
            },
            ocapiClient: function () {
                return {
                    execution_status: 'running'
                };
            }
        },
        '~/cartridge/scripts/utils/tmLogUtils': {
            getLogger: function () {
                return {
                    error: function () {}
                };
            }
        }
    });

    it('should return success true', function () {
        var input = {
            ProjectID: 'projectID',
            DocumentID: 'documentID'
        };
        var result = autoLaunchDocument.output(input);
        assert.equal(result.success, true);
    });
});
