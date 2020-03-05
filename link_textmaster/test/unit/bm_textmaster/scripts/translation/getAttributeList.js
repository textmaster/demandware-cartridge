'use strict';

var assert = require('chai').assert;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();

describe('getAttributeList', function () {
    var getAttributeList = proxyquire('../../../../../cartridges/bm_textmaster/cartridge/scripts/translation/getAttributeList', {
        'dw/system/Site': {
            getCurrent: function () {
                return {
                    getCustomPreferenceValue: function () {
                        return '["ID", "name"]';
                    }
                };
            }
        },
        'dw/object/SystemObjectMgr': {
            describe: function () {
                return {
                    getAttributeDefinitions: function () {
                        return {
                            toArray: function () {
                                return [{
                                    system: true,
                                    valueTypeCode: 3,
                                    ID: 'name',
                                    displayName: 'Name',
                                    tmDefault: true
                                }];
                            }
                        };
                    }
                };
            }
        },
        '*/cartridge/scripts/utils/tmUtils': {
            isAttributeAccessible: function () {
                return true;
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

    it('should return attribute lists', function () {
        var input = {
            itemType: 'product'
        };
        var result = getAttributeList.output(input);
        assert.equal(result.Attributes[0].ID, 'name');
        assert.equal(result.Attributes[0].type, 'system');
    });
});
