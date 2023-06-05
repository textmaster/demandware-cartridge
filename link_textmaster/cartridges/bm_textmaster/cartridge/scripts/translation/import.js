'use strict';

/* global empty */

/* API Includes */
var Resource = require('dw/web/Resource');
var Site = require('dw/system/Site');
var ContentMgr = require('dw/content/ContentMgr');
var ProductMgr = require('dw/catalog/ProductMgr');
var FileWriter = require('dw/io/FileWriter');
var File = require('dw/io/File');
var XMLIndentingStreamWriter = require('dw/io/XMLIndentingStreamWriter');

/* Script Modules */
var logUtils = require('*/cartridge/scripts/utils/tmLogUtils');
var utils = require('*/cartridge/scripts/utils/tmUtils');

/* Global variables */
var log = logUtils.getLogger('ImportScript');

/**
 * Populates component data in library XML with translated content for import
 * @param {string} pageID - pageID
 * @param {string} componentID - componentID
 * @param {Object} attrList - attribute List
 * @param {string} sfccLanguageTo - language code, example fr-fr
 * @param {string} language - language code, example fr_FR
 * @param {Object} content - translated content
 * @param {Object} writer - XML writer
 */
function writePageComponents(pageID, componentID, attrList, sfccLanguageTo, language, content, writer) {
    var customCache = require('*/cartridge/scripts/utils/customCacheWebdav');
    var componentsCacheUrl = '/pages/' + pageID + '/components/' + sfccLanguageTo;
    var components = customCache.getCache(componentsCacheUrl);
    var data;
    var componentPosition;

    for (var i = 0; i < components.length; i++) {
        if (components[i].id === componentID) {
            data = components[i].data;
            componentPosition = i;
            break;
        }
    }

    for (var j = 0; j < attrList.length; j++) {
        data[attrList[j].id] = content[attrList[j].id];
    }

    writer.writeStartElement('data');
    writer.writeAttribute('xml:lang', language);
    writer.writeCharacters(JSON.stringify(data));
    writer.writeEndElement();

    // write imported data back in cache
    components[componentPosition].data = data;
    customCache.setCache(componentsCacheUrl, components);
}

/**
 * Gets existing variation attribute values of a master product
 * @param {string} productID - productID
 * @param {Object} variationModel - variationModel
 * @param {Object} pvAttribute - Product Variation Attribute
 * @returns {Object} array of all values
 * */
function getVariationAttributeAllValues(productID, variationModel, pvAttribute) {
    var customCache = require('*/cartridge/scripts/utils/customCacheWebdav');
    var cacheUrl = utils.config.cache.url.masterProducts + '/' + productID;
    var cacheProduct = customCache.getCache(cacheUrl);
    var allValues = [];

    if (cacheProduct && Object.keys(cacheProduct).length) {
        if (cacheProduct.attributes && cacheProduct.attributes.length) {
            for (var a = 0; a < cacheProduct.attributes.length; a++) {
                if (cacheProduct.attributes[a].id === pvAttribute.attributeID) {
                    allValues = cacheProduct.attributes[a].values;
                    break;
                }
            }
        }
    }

    if (!allValues.length) {
        var values = variationModel.getAllValues(pvAttribute);

        for (var b = 0; b < values.length; b++) {
            allValues.push(values[b].value);
        }
        utils.log.debug('all values in model: ' + JSON.stringify(allValues));
    }

    return allValues;
}

/**
 * Imports translation data from textMaster projects
 * @param {string} projectID - textmaster project ID
 * @param {string} documentID - textmaster document ID
 * @param {string} isFirstImport - first time import or not
 */
function execute(projectID, documentID, isFirstImport) {
    var projectEndPoint = utils.config.api.get.project + '/' + projectID;
    var docEndPoint = projectEndPoint + '/' + utils.config.api.get.document + '/' + documentID;
    var canImport = false;
    var writer;
    var fileName;
    var itemID;
    var relativeFolder;
    var pageAttrs = {
        pageTitle: {},
        pageDescription: {},
        pageKeywords: {},
        pageURL: {}
    };
    var project = utils.textMasterClient('GET', projectEndPoint, '');

    if (project && project.custom_data.itemType) {
        var itemType = project.custom_data.itemType;
        var attrItemType = itemType === 'pagedesigner' || itemType === 'component' ? 'content' : itemType; // Pagedesigner's attributes are of Content Asset
        var catalogID = project.custom_data.catalogID;
        var sfccLanguageTo = project.custom_data.sfccLanguageTo;
        var language = utils.toDemandwareLocaleID(sfccLanguageTo);
        var sysAttrList = utils.attributes[attrItemType];

        if (itemType === 'product' && !catalogID) {
            return;
        }

        try {
            var baseFolder = File.IMPEX + File.SEPARATOR + 'src';
            var genericFolder;
            if (itemType === 'content' || itemType === 'folder' || itemType === 'pagedesigner' || itemType === 'component') {
                genericFolder = 'content';
            } else if (itemType === 'product' || itemType === 'category') {
                genericFolder = 'catalog';
            }
            relativeFolder = 'textmaster' + File.SEPARATOR + genericFolder;
            fileName = documentID + '.xml';

            var importDir = new File(baseFolder + File.SEPARATOR + relativeFolder);

            if (!importDir.exists()) {
                importDir.mkdirs();
            }

            // xml file
            var importXML = new File(baseFolder + File.SEPARATOR + relativeFolder + File.SEPARATOR + fileName);

            if (importXML.exists()) {
                importXML.remove();
            }

            importXML.createNewFile();

            var swriter = new FileWriter(importXML);
            writer = new XMLIndentingStreamWriter(swriter);
            writer.writeStartDocument('UTF-8', '1.0');

            var startElement = itemType === 'product' || itemType === 'category' ? 'catalog' : 'library';
            writer.writeStartElement(startElement);
            writer.writeAttribute('xmlns', 'http://www.demandware.com/xml/impex/' + startElement + '/2006-10-31');

            if (itemType === 'product' || itemType === 'category') {
                writer.writeAttribute('catalog-id', catalogID);
            } else if (Site.getCurrent().getCustomPreferenceValue('TMLibraryType').value === 'shared') {
                writer.writeAttribute('library-id', ContentMgr.getSiteLibrary().ID);
            }

            var doc = utils.textMasterClient('GET', docEndPoint, '');

            if (doc && (doc.status.toLowerCase() === 'in_extra_review' || doc.status.toLowerCase() === 'in_review' || doc.status.toLowerCase() === 'completed')) {
                itemID = doc.custom_data.item.id || '';
                var attrList = doc.custom_data.attribute || [];
                var content = doc.author_work ? doc.author_work : {};
                var variationAttributeCheck = false;
                var isMasterProduct = false;
                var variationAttributes;
                var variationAttributeIDs = [];
                var product;

                if (itemType === 'product') {
                    product = ProductMgr.getProduct(itemID);

                    if (product.master || product.variant) {
                        variationAttributes = utils.getVariationAttributes(product);
                        variationAttributeCheck = true;

                        for (var i = 0; i < variationAttributes.length; i++) {
                            var productVariationAttribute = variationAttributes[i];
                            variationAttributeIDs.push(productVariationAttribute.attributeID);
                        }
                    }

                    if (product.master) {
                        isMasterProduct = true;
                    }
                }

                writer.writeStartElement(attrItemType);
                writer.writeAttribute(attrItemType + '-id', itemID);

                if (itemType === 'component') {
                    var pageID = doc.custom_data.item.page_id;
                    writePageComponents(pageID, itemID, attrList, sfccLanguageTo, language, content, writer);
                } else {
                    // each system attribute without page attributes
                    for (var sysAttr = 0; sysAttr < sysAttrList.length; sysAttr++) {
                        var sysAttribute = sysAttrList[sysAttr];
                        if (sysAttribute.indexOf('page') !== 0 && content[sysAttribute]) {
                            writer.writeStartElement(utils.idToXMLTag(sysAttribute === 'name' ? 'displayName' : sysAttribute));
                            writer.writeAttribute('xml:lang', language);
                            writer.writeCharacters(content[sysAttribute]);
                            writer.writeEndElement();
                        }
                    }

                    // keep each system page attribute ordered list
                    for (var attr = 0; attr < attrList.length; attr++) {
                        var attribute = attrList[attr];
                        if (attribute.type === 'system' && attribute.id.indexOf('page') === 0 && content[attribute.id]) {
                            pageAttrs[attribute.id] = {
                                id: attribute.id,
                                value: content[attribute.id]
                            };
                        }
                    }

                    if (itemType === 'folder') {
                        var libraryFolder = ContentMgr.getFolder(itemID);
                        if (empty(libraryFolder)) {
                            libraryFolder = ContentMgr.getFolder(ContentMgr.getLibrary(ContentMgr.PRIVATE_LIBRARY), itemID);
                        }
                        writer.writeStartElement('parent');
                        writer.writeCharacters(libraryFolder ? libraryFolder.parent.ID : 'root');
                        writer.writeEndElement();
                    }

                    // each system attribute
                    writer.writeStartElement('page-attributes');

                    Object.keys(pageAttrs).forEach(function (pageKey) {
                        if (Object.prototype.hasOwnProperty.call(pageAttrs, pageKey)) {
                            var pageAttribute = pageAttrs[pageKey];
                            if (pageAttribute.id) {
                                writer.writeStartElement(utils.idToXMLTag(pageAttribute.id));
                                writer.writeAttribute('xml:lang', language);
                                writer.writeCharacters(pageAttribute.value);
                                writer.writeEndElement();
                            }
                        }
                    });

                    writer.writeEndElement();

                    // each custom attribute
                    writer.writeStartElement('custom-attributes');

                    for (var k = 0; k < attrList.length; k++) {
                        var cAttribute = attrList[k];

                        if (variationAttributeCheck && variationAttributeIDs.indexOf(cAttribute.id) > -1) { // attribute is a variation attribute
                            continue; // eslint-disable-line no-continue
                        }

                        if (cAttribute.type === 'custom' && content[cAttribute.id]) {
                            writer.writeStartElement('custom-attribute');
                            writer.writeAttribute('attribute-id', cAttribute.id);
                            writer.writeAttribute('xml:lang', language);
                            writer.writeCharacters(content[cAttribute.id]);
                            writer.writeEndElement();
                        }
                    }

                    writer.writeEndElement(); // custom-attributes

                    if (isMasterProduct) { // write all variation attribute minimum data
                        writer.writeStartElement('variations');
                        writer.writeStartElement('attributes');
                        var variationModel = product.variationModel;

                        for (var m = 0; m < variationAttributes.length; m++) {
                            writer.writeStartElement('variation-attribute');
                            writer.writeAttribute('attribute-id', variationAttributes[m].attributeID);
                            writer.writeAttribute('variation-attribute-id', variationAttributes[m].ID);

                            var translatedVAttr = [];
                            var pvAttribute = variationAttributes[m];
                            var allValues = getVariationAttributeAllValues(itemID, variationModel, pvAttribute);

                            for (var q = 0; q < attrList.length; q++) {
                                if (attrList[q].id === variationAttributes[m].attributeID) {
                                    for (var a = 0; a < allValues.length; a++) {
                                        var attrKey = attrList[q].id + '|' + allValues[a];
                                        translatedVAttr.push({
                                            key: allValues[a],
                                            value: content[attrKey]
                                        });
                                    }
                                }
                            }

                            writer.writeStartElement('variation-attribute-values');

                            for (var p = 0; p < allValues.length; p++) {
                                var singleVariantValue = allValues[p];
                                writer.writeStartElement('variation-attribute-value');
                                writer.writeAttribute('value', singleVariantValue);

                                for (var r = 0; r < translatedVAttr.length; r++) {
                                    if (translatedVAttr[r].key === singleVariantValue) {
                                        writer.writeStartElement('display-value');
                                        writer.writeAttribute('xml:lang', language);
                                        writer.writeCharacters(translatedVAttr[r].value);
                                        writer.writeEndElement(); // end of display-value
                                    }
                                }

                                writer.writeEndElement(); // end of variation-attribute-value
                            }

                            writer.writeEndElement(); // end of variation-attribute-values

                            writer.writeEndElement(); // end of variation-attribute
                        }

                        writer.writeEndElement(); // end of attributes
                        writer.writeEndElement(); // end of variations
                    }
                }

                writer.writeEndElement(); // itemType
                canImport = true;
            }

            writer.writeEndElement(); // startElement
            writer.writeEndDocument();
        } catch (ex) {
            log.error(ex.message);
        } finally {
            if (writer != null) {
                writer.flush();
                writer.close();
            }
        }

        if (canImport) {
            var jobName;
            switch (itemType) { // eslint-disable-line default-case
            case 'product':
            case 'category':
                jobName = Resource.msg('import.catalog.job.name', 'textmaster', null) + Site.current.ID;
                break;
            case 'content':
            case 'pagedesigner':
            case 'component':
            case 'folder':
                jobName = Resource.msg('import.content.job.name', 'textmaster', null) + Site.current.ID;
                break;
            }

            utils.setItemLastUpdatedData(projectID, documentID, itemType, itemID, isFirstImport);

            var ocapiJobUrl = utils.config.ocapi.jobs.post;
            ocapiJobUrl = ocapiJobUrl.replace('{0}', jobName);
            var jobResponse = utils.ocapiClient('post', ocapiJobUrl, null);
            var statusCode = jobResponse && (jobResponse.execution_status.toLowerCase() === 'running' || jobResponse.execution_status.toLowerCase() === 'pending' || jobResponse.execution_status.toLowerCase() === 'finished' || jobResponse.execution_status.toLowerCase() === 'jobalreadyrunningexception') ? 201 : 404;

            if (statusCode === 201) {
                var updateTranslatedLanguageList = require('~/cartridge/scripts/translation/updateTranslatedLanguageList');
                updateTranslatedLanguageList.execute(itemType, itemID, language);
                if (itemType === 'pagedesigner' || itemType === 'component') {
                    var updatePageLastModifiedDate = require('~/cartridge/scripts/translation/updatePageLastModifiedDate');
                    updatePageLastModifiedDate.execute(itemType, itemID);
                }
                log.debug(itemType + ' of ID: ' + itemID + ' - import job is triggered.');
            } else {
                log.error('Item import failed with error code: ' + statusCode);
            }
        }
    }
}

module.exports = {
    execute: execute
};
