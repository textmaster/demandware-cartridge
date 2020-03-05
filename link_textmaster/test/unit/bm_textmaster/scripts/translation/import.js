'use strict';

var sinon = require('sinon');
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();

describe('import', function () {
    var importScript = proxyquire('../../../../../cartridges/bm_textmaster/cartridge/scripts/translation/import', {
        'dw/web/Resource': {
            msg: function (params) {
                return params;
            }
        },
        'dw/system/Site': {
            current: {
                ID: 'siteID'
            }
        },
        'dw/content/ContentMgr': {},
        'dw/io/FileWriter': sinon.stub(),
        'dw/io/File': function () {
            return {
                exists: function () {
                    return true;
                },
                mkdirs: function () {
                    return true;
                },
                remove: function () {
                    return true;
                },
                createNewFile: function () {
                    return true;
                }
            };
        },
        'dw/io/XMLIndentingStreamWriter': function () {
            return {
                writeStartDocument: sinon.stub(),
                writeStartElement: sinon.stub(),
                writeAttribute: sinon.stub(),
                writeEndElement: sinon.stub(),
                writeCharacters: sinon.stub(),
                writeEndDocument: sinon.stub(),
                flush: sinon.stub(),
                close: sinon.stub()
            };
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
                api: {
                    get: {
                        project: 'project',
                        document: 'document'
                    }
                },
                ocapi: {
                    jobs: {
                        post: '/dw/data/v20_2/jobs/{0}/executions'
                    }
                }
            },
            textMasterClient: function () {
                return {
                    custom_data: {
                        itemType: 'product',
                        catalogID: 'storefront',
                        sfccLanguageTo: 'en-us',
                        item: {
                            id: 'itemid'
                        },
                        attribute: [{
                            id: 'name',
                            type: 'system'
                        },
                        {
                            id: 'pageDescription',
                            type: 'system'
                        }]
                    },
                    author_work: {
                        name: 'itemName'
                    },
                    status: {
                        toLowerCase: function () {
                            return 'in_review';
                        }
                    }
                };
            },
            attributes: {
                product: ['name', 'shortDescription']
            },
            toDemandwareLocaleID: function () {},
            idToXMLTag: function () {},
            ocapiClient: function () {
                return {
                    execution_status: {
                        toLowerCase: function () {
                            return 'running';
                        }
                    }
                };
            }
        },
        '~/cartridge/scripts/translation/updateTranslatedLanguageList': {
            execute: function () {}
        }
    });

    it('should import translated data', function () {
        importScript.execute();
    });
});
