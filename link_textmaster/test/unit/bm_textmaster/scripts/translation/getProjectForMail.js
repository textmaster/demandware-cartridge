'use strict';

var assert = require('chai').assert;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();

describe('getProjectForMail', function () {
    var getProjectForMail = proxyquire('../../../../../cartridges/bm_textmaster/cartridge/scripts/translation/getProjectForMail', {
        'dw/web/Resource': {
            msg: function (params) {
                return params;
            }
        },
        'dw/system/Site': {
            getCurrent: function () {
                return {
                    getCustomPreferenceValue: function () {
                        return 'emailform@gmail.com';
                    }
                };
            }
        },
        '*/cartridge/scripts/utils/tmUtils': {
            textMasterClient: function () {
                return {
                    email: 'emailto@gmail.com',
                    name: 'projectname',
                    contact_information: {
                        first_name: 'username'
                    },
                    total_costs: [{
                        amount: 6.86,
                        currency: 'EUR'
                    }],
                    total_word_count: 30,
                    options: {}
                };
            },
            config: {
                apiEnv: 'demo',
                tmBackofficeBaseUrlLive: 'https://backoffice.base.live.com',
                tmBackofficeBaseUrlDemo: 'https://backoffice.base.demo.com',
                api: {
                    get: {
                        project: 'project'
                    }
                }
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
        var tmProject = {
            custom: {
                projectid: 'projectid'
            }
        };
        var result = getProjectForMail.execute(tmProject);
        assert.equal(result.from, 'emailform@gmail.com');
    });
});
