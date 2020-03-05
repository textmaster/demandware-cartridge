'use strict';

var assert = require('chai').assert;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();

describe('tmQuote', function () {
    var tmQuote = proxyquire('../../../../../cartridges/int_textmaster_core/cartridge/scripts/translation/tmQuote', {
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
            getCustomObject: function () {},
            createCustomObject: function () {}
        },
        '~/cartridge/scripts/utils/tmUtils': {
            config: {
                quote: {
                    jobname: 'TextMasterAskQuote'
                },
                ocapi: {
                    jobs: {
                        post: '/dw/data/v20_2/jobs/{0}/executions'
                    }
                }
            },
            ocapiClient: function () {}
        },
        '~/cartridge/scripts/utils/tmLogUtils': {
            getLogger: function () {
                return {
                    error: function () {}
                };
            }
        }
    });

    it('should return job status code', function () {
        var result = tmQuote.output({ ProjectID: 'someID' });
        assert.equal(result.statusCode, 404);
    });
    it('should return stausCode 400, if ProjectID is empty', function () {
        var result = tmQuote.output({ ProjectID: '' });
        assert.equal(result.statusCode, 400);
    });
});
