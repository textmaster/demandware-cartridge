'use strict';

var assert = require('chai').assert;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();

describe('importData', function () {
    var importData = proxyquire('../../../../../cartridges/int_textmaster_core/cartridge/scripts/translation/importData', {
        'dw/system/Site': {
            current: {
                ID: 'SiteID'
            }
        },
        '~/cartridge/scripts/utils/tmUtils': {
            setImportJobQuery: function () {
                return false;
            },
            config: {
                importData: {
                    jobname: 'TextMasterImportData',
                    parameterError: 'Parameters projectid and documentid are required in URL'
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
        var result = importData.output(input);
        assert.equal(result.success, true);
    });
});
