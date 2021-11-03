'use strict';

/* global empty */

/* API Includes */
var Resource = require('dw/web/Resource');
var Site = require('dw/system/Site');
var ContentMgr = require('dw/content/ContentMgr');
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
 * Imports translation data from textMaster projects
 * @param {string} projectID - textmaster project ID
 * @param {string} documentID - textmaster document ID
 */
function execute(projectID, documentID) {
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

                    for (var list = 0; list < attrList.length; list++) {
                        var attributeList = attrList[list];
                        if (attributeList.type === 'custom' && content[attributeList.id]) {
                            writer.writeStartElement('custom-attribute');
                            writer.writeAttribute('attribute-id', attributeList.id);
                            writer.writeAttribute('xml:lang', language);
                            writer.writeCharacters(content[attributeList.id]);
                            writer.writeEndElement();
                        }
                    }

                    writer.writeEndElement(); // custom-attributes
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

            var ocapiJobUrl = utils.config.ocapi.jobs.post;
            ocapiJobUrl = ocapiJobUrl.replace('{0}', jobName);
            var jobResponse = utils.ocapiClient('post', ocapiJobUrl, null);
            var statusCode = jobResponse && (jobResponse.execution_status.toLowerCase() === 'running' || jobResponse.execution_status.toLowerCase() === 'pending' || jobResponse.execution_status.toLowerCase() === 'finished' || jobResponse.execution_status.toLowerCase() === 'jobalreadyrunningexception') ? 201 : 404;

            if (statusCode === 201) {
                var updateTranslatedLanguageList = require('~/cartridge/scripts/translation/updateTranslatedLanguageList');
                updateTranslatedLanguageList.execute(itemType, itemID, language);
            } else {
                log.error('Item import failed with error code: ' + statusCode);
            }
        }
    }
}

module.exports = {
    execute: execute
};
