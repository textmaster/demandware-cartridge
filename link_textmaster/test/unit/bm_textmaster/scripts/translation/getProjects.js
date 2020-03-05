'use strict';

var assert = require('chai').assert;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();

describe('getProjects', function () {
    var getProjects = proxyquire('../../../../../cartridges/bm_textmaster/cartridge/scripts/translation/getProjects', {
        'dw/object/CustomObjectMgr': {
            getAllCustomObjects: function () {
                return {
                    asList: function () {
                        return [{ id: 'projectID' }];
                    },
                    close: function () {}
                };
            }
        },
        '*/cartridge/scripts/utils/tmLogUtils': {
            getLogger: function () {
                return {
                    error: function () {}
                };
            }
        }
    });

    it('should return project list', function () {
        var result = getProjects.execute();
        assert.equal(result[0].id, 'projectID');
    });
});
