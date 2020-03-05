'use strict';

var assert = require('chai').assert;
var sinon = require('sinon');
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();

describe('createTranslation', function () {
    var createTranslation = proxyquire('../../../../../cartridges/bm_textmaster/cartridge/scripts/translation/createTranslation', {
        'dw/system/Site': {
            getCurrent: function () {
                return {
                    getCustomPreferenceValue: function (params) {
                        return params;
                    }
                };
            },
            current: {
                ID: 'siteID'
            }
        },
        'dw/system/System': {
            instanceHostname: 'instanceHostname'
        },
        'dw/system/Transaction': {
            begin: function () {},
            commit: function () {}
        },
        'dw/web/Resource': {
            msg: function (params) {
                return params;
            }
        },
        'dw/catalog/ProductMgr': {
            getProduct: function () {
                return {
                    attributeModel: {
                        getDisplayValue: function () {
                            return 'content value';
                        }
                    }
                };
            }
        },
        'dw/catalog/CatalogMgr': {
            getCategory: function () {}
        },
        'dw/content/ContentMgr': {
            getContent: function () {}
        },
        'dw/object/SystemObjectMgr': {
            describe: function () {
                return {
                    getAttributeDefinitions: function () {
                        return {
                            toArray: function () {
                                return [{
                                    ID: 'name'
                                }];
                            }
                        };
                    }
                };
            }
        },
        'dw/object/CustomObjectMgr': {
            getCustomObject: function () {},
            createCustomObject: function () {
                return {
                    custom: {
                        documentCount: 1,
                        documents: '[]'
                    }
                };
            }
        },
        'dw/util/Calendar': sinon.stub(),
        'dw/util/StringUtils': {
            formatCalendar: function () {}
        },
        '*/cartridge/scripts/utils/tmUtils': {
            firstLetterCapital: function () {},
            getMappedLanguage: function () {},
            getLocaleName: function () {},
            config: {
                api: {
                    get: {
                        project: 'project',
                        document: 'document'
                    }
                },
                autolaunch: {
                    coName: 'autoLaunch'
                }
            },
            formatLocaleDemandware: function () {},
            textMasterClient: function () {
                return [{
                    id: 'documentID',
                    original_content: {
                        name: {
                            original_phrase: 'product nmae'
                        }
                    }
                }];
            },
            getWordCount: function () {
                return 2;
            }
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

    it('should send product for translation, if projectID is there', function () {
        var input = {
            ProjectID: 'ProjectID',
            LocaleFrom: 'en-us',
            LocaleTo: '{"id":"fr"}',
            ItemType: 'product',
            CatalogID: 'storefront',
            Attributes: '[{"id":"name","type":"system"}]',
            Items: '[{"id":"1111"}]',
            AutoLaunch: {
                toLowerCase: function () {
                    return 'true';
                }
            }
        };
        global.request = {
            setLocale: function () {}
        };
        var result = createTranslation.output(input);
        assert.equal(result, 'ProjectID');
    });

    it('should send content for translation, if projectID is not there', function () {
        var input = {
            ProjectID: '',
            LocaleFrom: 'en-us',
            LocaleTo: '{"template":{"name":"templatename"}}',
            ItemType: 'content',
            Attributes: '[{"id":"name","type":"system"}]',
            Items: '[{"id":"about-us"}]',
            AutoLaunch: {
                toLowerCase: function () {
                    return 'true';
                }
            }
        };
        global.request = {
            setLocale: function () {}
        };
        var result = createTranslation.output(input);
    });
});
