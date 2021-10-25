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
 */
function postBulkDocuments(documents, projectID) {
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

            log.debug('Request: PUT ' + documentEndPoint + ' ' + JSON.stringify(documentPostData));
            var updatedDocumentResult = utils.textMasterClient('PUT', documentEndPoint, JSON.stringify(documentPostData));
            log.debug('Response: ' + JSON.stringify(updatedDocumentResult));
        }
    }
}

/**
 * Gets attributes of specific Page Designer objects from storefront custom code, since those values are accessible only on storefront context
 * @param {string} pageID - pageID
 * @param {string} attrID - attribute ID
 * @param {string} locale - locale
 * @returns {string} attribute value
 */
function getPDAttrValueFromStorefront(pageID, attrID, locale) {
    var pageObject;
    var attrVal = '';
    var endPoint = '/TMPageDesignersImpex-GetPage?pageid=' + pageID;

    pageObject = utils.storefrontCall('GET', endPoint, {}, locale);

    if (pageObject) {
        attrVal = pageObject[attrID];
    }

    return attrVal;
}

/**
 * Gets PageDesigner single Attribute Value
 * @param {string} pageID - pageID
 * @param {string} attrID - attribute ID
 * @param {string} locale - locale
 * @returns {string} attribute value
 */
function getPageDesignerAttrValue(pageID, attrID, locale) {
    var attrValue = getPDAttrValueFromStorefront(pageID, attrID, locale);

    return attrValue;
}

/**
 * Gets Page Component single Attribute Value
 * @param {string} pageID - pageID
 * @param {string} componentID - componentID
 * @param {string} attributeID - attribute ID
 * @param {string} language - language
 * @returns {string} attribute value
 */
function getComponentAttrValue(pageID, componentID, attributeID, language) {
    var attrValue = '';
    var customCache = require('*/cartridge/scripts/utils/customCacheWebdav');
    var componentsCacheUrl = '/pages/' + pageID + '/components/' + language;
    var components = customCache.getCache(componentsCacheUrl);

    for (var i = 0; i < components.length; i++) {
        if (components[i].id === componentID && attributeID === 'component-name' && components[i].name) {
            attrValue = components[i].name;
            break;
        } else if (components[i].id === componentID && components[i].data && components[i].data[attributeID]) {
            attrValue = components[i].data[attributeID];
            break;
        }
    }

    return attrValue;
}

/**
 * Sets PageDesigner Export Date in custom cache
 * @param {string} pageID - pageID
 * @param {Object} time - time
 */
function setPageDesignerExportDate(pageID, time) {
    var customCache = require('*/cartridge/scripts/utils/customCacheWebdav');
    var pageCustomUrl = '/pages/' + pageID + '/custom';
    var custom = customCache.getCache(pageCustomUrl);
    custom = custom ? custom : {};
    custom.exportDate = time;
    customCache.setCache(pageCustomUrl, custom);
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
    var pageID = input.PageID;
    var attributes = JSON.parse(input.Attributes);
    var componentAttributes = attributes;
    var items = JSON.parse(input.Items);
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

                if (itemType === 'pagedesigner' || itemType === 'component') {
                    setPageDesignerExportDate(items[i], Site.getCurrent().getCalendar().getTime());
                } else {
                    Transaction.begin();
                    item.custom.exportDate = Site.getCurrent().getCalendar().getTime();
                    Transaction.commit();
                }

                if (itemType === 'component') {
                    attributes = [];

                    for (var j = 0; j < componentAttributes.length; j++) {
                        if (componentAttributes[j].componentID === items[i]) {
                            attributes.push(componentAttributes[j]);
                        }
                    }
                }

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
                    case 'pagedesigner':
                        contentValue = getPageDesignerAttrValue(items[i], attribute.id, dwLocaleID);

                        if (contentValue) {
                            itemData[attribute.id] = contentValue;
                        }

                        if (attribute.id === 'name') {
                            itemName = contentValue;
                        }

                        break;
                    case 'component':
                        contentValue = getComponentAttrValue(pageID, items[i], attribute.id, localeFrom);

                        if (contentValue) {
                            itemData[attribute.id] = contentValue;
                        }

                        break;
                    }

                    if (contentValue) {
                        attrData.id = attribute.id;

                        if (itemType !== 'component') {
                            attrData.type = attribute.type;
                        }

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
                    case 'pagedesigner':
                        itemName = itemName ? itemName : getPageDesignerAttrValue(items[i], 'name', dwLocaleID);
                        break;
                    case 'component':
                        itemName = getComponentAttrValue(pageID, items[i], 'component-name', localeFrom);
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

                    if (itemType === 'component') {
                        document.custom_data.item.page_id = pageID;
                    }

                    documents.push(document);
                    bulkLimitCount++;
                } else {
                    // No content to be exported
                    avoidItems.push(items[i]);
                }

                itemCount++;

                if (bulkLimitCount === bulkLimit || itemCount === items.length) {
                    postBulkDocuments(documents, projectID);

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
