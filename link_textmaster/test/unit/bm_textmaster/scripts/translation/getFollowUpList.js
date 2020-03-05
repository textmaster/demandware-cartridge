'use strict';

var assert = require('chai').assert;
var sinon = require('sinon');
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();
var documentMock = [{
    status: 'in_review',
    custom_data: {
        item: {
            id: 'itemid'
        }

    }
}];
var projectMock = [{
    name: 'projectname',
    launched_at: {
        year: '2020',
        month: '1',
        day: '30'
    },
    custom_data: {
        itemType: 'product',
        sfccLanguageTo: 'en-us'

    },
    language_to_code: 'en-us'
}];

describe('getFollowUpList', function () {
    var getFollowUpList = proxyquire('../../../../../cartridges/bm_textmaster/cartridge/scripts/translation/getFollowUpList', {
        'dw/system/Site': {
            current: {
                ID: 'siteID',
                getCustomPreferenceValue: function () {
                    return 1;
                }
            }
        },
        'dw/web/Resource': {
            msg: function (params) {
                return params;
            },
            msgf: function (params) {
                return params;
            }
        },
        'dw/web/URLAction': sinon.stub(),
        'dw/web/URLParameter': sinon.stub(),
        'dw/web/URLUtils': {
            abs: function () {
                return 'https//demo.com';
            }
        },
        '*/cartridge/scripts/utils/tmLogUtils': {
            getLogger: function () {
                return {
                    error: function () {}
                };
            }
        },
        '*/cartridge/scripts/utils/tmUtils': {
            config: {
                apiEnv: 'demo',
                tmBackofficeBaseUrlLive: 'https://live.backoffice.base.com/',
                tmBackofficeBaseUrlDemo: 'https://demo.backoffice.base.com/',
                api: {
                    get: {
                        projects: 'projects/filter',
                        project: 'projects'
                    }
                }
            },
            getLocaleName: function () {},
            toDemandwareLocaleID: function () {
                return {
                    replace: function () {}
                };
            },
            textMasterClient: function () {
                return {
                    projects: projectMock,
                    documents: documentMock
                };
            }
        }
    });

    it('should return document list', function () {
        var input = {
            projectPageNumber: 1,
            projectCountInPage: 1,
            docPageNumber: 1,
            docCountInPage: 1
        };
        var result = getFollowUpList.output(input);
        assert.equal(result.ProjectPageNumber, 1);
        assert.equal(result.ShowMore, false);
    });
});
