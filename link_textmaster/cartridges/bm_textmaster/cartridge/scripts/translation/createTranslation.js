'use strict';

/* global empty, XML */
/* eslint new-cap: 0 */
/* eslint no-unneeded-ternary: 0 */
/* eslint default-case: 0 */
/* eslint no-nested-ternary: 0 */
/* eslint no-loop-func: 0 */

/* API Includes */
var Site = require('dw/system/Site');
var System = require('dw/system/System');
var Transaction = require('dw/system/Transaction');
var Resource = require('dw/web/Resource');
var ProductMgr = require('dw/catalog/ProductMgr');
var CatalogMgr = require('dw/catalog/CatalogMgr');
var ContentMgr = require('dw/content/ContentMgr');
var SystemObjectMgr = require('dw/object/SystemObjectMgr');
var CustomObjectMgr = require('dw/object/CustomObjectMgr');
var Calendar = require('dw/util/Calendar');
var StringUtils = require('dw/util/StringUtils');

/* Script Includes */
var logUtils = require('*/cartridge/scripts/utils/tmLogUtils');
var utils = require('*/cartridge/scripts/utils/tmUtils');

/* Global Variables */
var log = logUtils.getLogger('CreateTranslation');

/**
 * Send documents to API to create bulk documents
 * @param {Object} documents - document details
 * @param {string} projectID - project id
 * @param {boolean} autoLaunch -true or false
 */
function postBulkDocuments(documents, projectID, autoLaunch) {
    var documentPostData = {};
    var tmSFpassword = Site.getCurrent().getCustomPreferenceValue('TMSFpassword') || '';
    var sfProtectionURLpart = (Site.current.status === Site.SITE_STATUS_PROTECTED) ? (Resource.msg('storefront.username', 'textmaster', null) + ':' + tmSFpassword + '@') : '';

    documentPostData.documents = documents;
    var documentEndPoint = utils.config.api.get.project + '/' + projectID + '/' + Resource.msg('api.post.documents', 'textmaster', null);
    log.debug('Request: POST ' + documentEndPoint + ' ' + JSON.stringify(documentPostData));
    var documentResult = utils.textMasterClient('POST', documentEndPoint, JSON.stringify(documentPostData));
    log.debug('Response: ' + JSON.stringify(documentResult));

    if (documentResult) {
        for (var doc = 0; doc < documentResult.length; doc++) {
            var document = documentResult[doc];
            var documentID = document.id;
            // document edit
            documentEndPoint = utils.config.api.get.project + '/' + projectID + '/' + utils.config.api.get.document + '/' + documentID;

            var wordCount = 0;

            Object.keys(document.original_content).forEach(function (key) {
                if (Object.prototype.hasOwnProperty.call(document.original_content, key)) {
                    wordCount += utils.getWordCount(document.original_content[key].original_phrase);
                }
            });
            var callBackURL = 'https://' + sfProtectionURLpart + System.instanceHostname + '/on/demandware.store/Sites-' + Site.current.ID + '-Site/default/TMImport-Data?projectid=' + projectID + '&documentid=' + documentID;
            var autoLaunchCallBackURL = autoLaunch.toLowerCase() === 'true' ? 'https://' + sfProtectionURLpart + System.instanceHostname + '/on/demandware.store/Sites-' + Site.current.ID + '-Site/default/TMAutoLaunch-Document?projectid=' + projectID + '&documentid=' + documentID : '';

            documentPostData = {
                document: {
                    callback: {
                        in_review: {
                            url: callBackURL
                        },
                        completed: {
                            url: callBackURL
                        }
                    },
                    word_count: wordCount
                }
            };

            if (autoLaunchCallBackURL) {
                documentPostData.document.callback.word_count_finished = {
                    url: autoLaunchCallBackURL
                };
            }
            log.debug('Request: PUT ' + documentEndPoint + ' ' + JSON.stringify(documentPostData));
            var updatedDocumentResult = utils.textMasterClient('PUT', documentEndPoint, JSON.stringify(documentPostData));
            log.debug('Response: ' + JSON.stringify(updatedDocumentResult));
        }
    }
}

/**
 * Prepare Custom Object for Auto Launch feature
 * Keeping total number of documents in a project, in custom object.
 * @param {string} projectID - project id
 * @param {integer} count - count
 */
function setAutoLaunchCustomObject(projectID, count) {
    var customObjectName = utils.config.autolaunch.coName;
    var customObjectInstanceID = projectID;
    try {
        var dataHolder = CustomObjectMgr.getCustomObject(customObjectName, customObjectInstanceID);

        if (dataHolder == null) {
            Transaction.begin();
            dataHolder = CustomObjectMgr.createCustomObject(customObjectName, customObjectInstanceID);
            dataHolder.custom.documentCount = count;
            dataHolder.custom.documents = '[]';
            Transaction.commit();
        } else {
            Transaction.begin();
            dataHolder.custom.documentCount += count;
            Transaction.commit();
        }
    } catch (ex) {
        log.error(ex.message + ' - No custom object found.');
    }
}

/**
 * Creates translation documents
 * @param {Object} input - input object
 * @returns {string} project id
 */
function getOutput(input) {
    var projectID = input.ProjectID;
    var localeFrom = input.LocaleFrom;
    var localeTo = JSON.parse(input.LocaleTo);
    var itemType = input.ItemType;
    var catalogID = input.CatalogID;
    var attributes = JSON.parse(input.Attributes);
    var items = JSON.parse(input.Items);
    var autoLaunch = input.AutoLaunch;
    var categoryCode = Site.getCurrent().getCustomPreferenceValue('TMCategoryCode') || '';
    var calendarDate = Calendar();
    var bulkLimit = Resource.msg('api.bulk.doc.limit', 'textmaster', null) || 20;
    var bulkLimitCount = 0;
    var itemCount = 0;
    var projectResult;
    var item;
    var contentValue;
    var itemAttrs;
    var attrData;
    var itemName;
    var avoidItems = [];

    bulkLimit = isNaN(bulkLimit) ? 25 : parseInt(bulkLimit, 10);

    if (localeTo) {
        if (!projectID) {
            var projectPostData = {};
            var project = {};

            project.name = utils.firstLetterCapital(itemType) + ' - ' + localeTo.template.name + ' - ' + StringUtils.formatCalendar(Calendar(calendarDate), 'yyyy-MM-dd');
            project.ctype = Resource.msg('constant.translation', 'textmaster', null);

            var mappedLanguageFrom = utils.getMappedLanguage(localeFrom);
            var mappedLanguageTo = utils.getMappedLanguage(localeTo.id);

            project.language_from = mappedLanguageFrom ? mappedLanguageFrom : localeFrom;
            project.language_to = mappedLanguageTo ? mappedLanguageTo : localeTo.id;
            project.category = categoryCode;
            project.project_briefing = 'LANGUAGE - FROM ' + utils.getLocaleName(localeFrom) + ' [' + localeFrom + '] TO ' + utils.getLocaleName(localeTo.id) + ' [' + localeTo.id + '] - ' + Resource.msg('constant.briefing', 'textmaster', null);
            project.options = {
                language_level: Resource.msg('constant.enterprise', 'textmaster', null)
            };
            project.api_template_id = localeTo.template.id;
            project.custom_data = {
                itemType: itemType,
                catalogID: catalogID,
                sfccLanguageFrom: localeFrom,
                sfccLanguageTo: localeTo.id
            };

            projectPostData.project = project;
            var projectEndPoint = utils.config.api.get.project;
            log.debug('Request: POST ' + projectEndPoint + ' ' + JSON.stringify(projectPostData));
            projectResult = utils.textMasterClient('POST', projectEndPoint, JSON.stringify(projectPostData));
            log.debug('response: ' + JSON.stringify(projectResult));

            if (projectResult && projectResult.id !== undefined) {
                projectID = projectResult.id;
            }
        }

        if (projectID) {
            var documents = [];
            var dwLocaleID = utils.formatLocaleDemandware(localeFrom);
            request.setLocale(dwLocaleID); // eslint-disable-line no-undef

            for (var i = 0; i < items.length; i++) {
                var customData = [];
                var itemData = {};
                var document = {};
                var markupFlag = false;

                switch (itemType) {
                case 'product':
                    item = ProductMgr.getProduct(items[i]);
                    itemAttrs = SystemObjectMgr.describe('Product').getAttributeDefinitions().toArray();
                    break;
                case 'content':
                    item = ContentMgr.getContent(items[i]);
                    break;
                case 'category':
                    item = CatalogMgr.getCategory(items[i]);
                    break;
                case 'folder':
                    item = ContentMgr.getFolder(items[i]);
                    if (empty(item)) {
                        item = ContentMgr.getFolder(ContentMgr.getLibrary(ContentMgr.PRIVATE_LIBRARY), items[i]);
                    }
                    break;
                }

                Transaction.begin();
                item.custom.exportDate = Site.getCurrent().getCalendar().getTime();
                Transaction.commit();

                for (var attr = 0; attr < attributes.length; attr++) {
                    var attribute = attributes[attr];
                    attrData = {};
                    contentValue = '';

                    switch (itemType) {
                    case 'product':
                        for (var itemAttr = 0; itemAttr < itemAttrs.length; itemAttr++) {
                            var itemAttribute = itemAttrs[itemAttr];
                            if (attribute.id === itemAttribute.ID) {
                                contentValue = (attribute.id === 'shortDescription' || attribute.id === 'longDescription') ? (item[attribute.id] ? (item[attribute.id].source ? item[attribute.id].source : item[attribute.id]) : '') : item.attributeModel.getDisplayValue(itemAttribute);
                                if (contentValue) {
                                    contentValue = contentValue.source ? contentValue.source : contentValue;
                                    itemData[attribute.id] = contentValue;
                                }
                            }
                        }
                        break;
                    case 'content':
                    case 'category':
                    case 'folder':
                        contentValue = attribute.type === 'system' ? (item[attribute.id] || '') : (item.custom[attribute.id] ? (item.custom[attribute.id].source ? item.custom[attribute.id].source : item.custom[attribute.id]) : '');

                        if (contentValue) {
                            contentValue = contentValue.source ? contentValue.source : contentValue;
                            itemData[attribute.id] = contentValue;
                        }
                        break;
                    }

                    if (contentValue) {
                        attrData.id = attribute.id;
                        attrData.type = attribute.type;
                        markupFlag = /<[a-z][\s\S]*>/i.test(contentValue) ? true : markupFlag;
                        customData.push(attrData);
                    }
                }

                if (customData.length) {
                    switch (itemType) {
                    case 'category':
                    case 'folder':
                        itemName = item.displayName;
                        break;
                    case 'product':
                    case 'content':
                        itemName = item.name;
                        break;
                    }
                    document.title = itemType + '-' + items[i];
                    document.original_content = itemData;
                    document.type = Resource.msg('constant.key.value', 'textmaster', null);
                    document.perform_word_count = true;
                    document.markup_in_content = markupFlag;
                    document.custom_data = {
                        item: {
                            id: items[i],
                            name: itemName
                        },
                        attribute: customData
                    };

                    documents.push(document);
                    bulkLimitCount++;
                } else {
                    // No content to be exported
                    avoidItems.push(items[i]);
                }

                itemCount++;

                if (bulkLimitCount === bulkLimit || itemCount === items.length) {
                    postBulkDocuments(documents, projectID, autoLaunch);

                    if (autoLaunch.toLowerCase() === 'true') {
                        setAutoLaunchCustomObject(projectID, documents.length);
                    }

                    bulkLimitCount = 0;
                    documents = [];
                }
            }

            if (avoidItems.length) {
                log.debug('Failed (' + avoidItems.length + ') ' + utils.firstLetterCapital(itemType) + ' items to export [No contents]: ' + JSON.stringify(avoidItems));
            }
        }
    }

    // Returns project ID if only one project is created. On result page template this project ID is used to go to TextMaster specific project page. Else to go to project list page.
    return projectID;
}

module.exports = {
    output: getOutput
};
