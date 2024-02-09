'use strict';

/* global empty, XML */
/* eslint new-cap: 0 */

/* Script Modules */
var utils = require('*/cartridge/scripts/utils/tmUtils');
var pageUtils = require('*/cartridge/scripts/utils/tmPageUtils');
var logUtils = require('*/cartridge/scripts/utils/tmLogUtils');
var customLog = logUtils.getLogger('tmPageDesigners');

/**
 * Writes page or component data to a custom XML
 * @param {Object} formattedContentXML - formattedContentXML
 * @param {Object} xmlStreamWriter - xmlStreamWriter
 */
function writeToPageXML(formattedContentXML, xmlStreamWriter) {
    xmlStreamWriter.writeRaw(formattedContentXML.toXMLString());
}

/**
 * Writes first level components into custom cache
 * @param {Object} formattedContentXML - Formatted Content XML
 * @param {string} pageID - Page ID
 */
function writeFirstLevelComponentsInCache(formattedContentXML, pageID) {
    var components = [];
    var pageContentLinks = formattedContentXML.descendants('content-link');

    for (var i = 0; i < pageContentLinks.length(); i++) {
        components.push({
            id: pageContentLinks[i].attribute('content-id').toString()
        });
    }

    pageUtils.setPageComponents(pageID, components);
}

/**
 * Returns Page Designer Object List
 * @param {Object} exportDate - exportDate
 * @returns {Object} object
 */
function getPageDesignerList() {
    var Site = require('dw/system/Site');
    var items = [];
    var File = require('dw/io/File');
    var SEP = File.SEPARATOR;
    var readFilePath = File.IMPEX + SEP + 'src' + SEP + utils.config.pageDesigner.xmlName;
    var readXmlFile = new File(readFilePath);

    if (readXmlFile.exists()) {
        var writeFolderPath = File.IMPEX + SEP + 'src' + SEP + 'textmaster' + SEP + Site.current.ID + SEP + 'allComponentXMLs';
        var writeFolder = new File(writeFolderPath);

        if (!writeFolder.exists()) {
            writeFolder.mkdirs();
        }

        var FileReader = require('dw/io/FileReader');
        var StreamReader = require('dw/io/XMLStreamReader');

        var FileWriter = require('dw/io/FileWriter');
        var StreamWriter = require('dw/io/XMLStreamWriter');

        var xmlFileReader = new FileReader(readXmlFile);
        var xmlStreamReader = new StreamReader(xmlFileReader);
        var StreamConstants = require('dw/io/XMLStreamConstants');

        var contentXML;
        var formattedContentXML;
        var localElementName;
        var contentID;
        var pageObject;
        var contentType;
        var customAttributes;
        var lastModified;

        while (xmlStreamReader.hasNext()) {
            if (xmlStreamReader.next() === StreamConstants.START_ELEMENT) {
                localElementName = xmlStreamReader.getLocalName();

                if (localElementName === 'content') {
                    var attrCount = xmlStreamReader.getAttributeCount();
                    for (var i = 0; i < attrCount; i++) {
                        if (xmlStreamReader.getAttributeLocalName(i) === 'content-id') {
                            contentID = xmlStreamReader.getAttributeValue(i);
                            break;
                        }
                    }
                    contentXML = xmlStreamReader.readXMLObject();
                    contentType = null;

                    if (contentXML) {
                        if (contentXML.toString().length < 1000000) { /* string quota limit */
                            formattedContentXML = XML(contentXML.toString().replace('xmlns', 'xmlns:i'));
                            contentType = formattedContentXML.descendants('type');

                            if (!empty(contentType)) {
                                // in the content object type attribute found
                                if (contentType.toXMLString().indexOf('page') > -1) {
                                    pageObject = utils.getPageObject(contentID);

                                    if (pageObject && pageObject.isPage) {
                                        customAttributes = pageUtils.getPageCustom(contentID);
                                        lastModified = pageUtils.getPageLastModified(contentID);
                                        if (!lastModified) {
                                            pageUtils.setPageLastModified(contentID, { lastModified: new Date() });
                                        }

                                        items.push({
                                            ID: contentID,
                                            name: pageObject.name,
                                            online: pageObject.online,
                                            custom: {
                                                TranslatedLanguages: customAttributes.TranslatedLanguages || ''
                                            }
                                        });

                                        writeFirstLevelComponentsInCache(formattedContentXML, contentID);
                                    }
                                } else if (contentType.toXMLString().indexOf('component') > -1) {
                                    var writeFilePath = writeFolderPath + SEP + contentID + '.xml';
                                    var writeXmlFile = new File(writeFilePath);

                                    if (!writeXmlFile.exists()) {
                                        writeXmlFile.createNewFile();
                                    }

                                    var xmlFileWriter = new FileWriter(writeXmlFile);
                                    var xmlStreamWriter = new StreamWriter(xmlFileWriter);

                                    xmlStreamWriter.writeStartDocument('UTF-8', '1.0');
                                    xmlStreamWriter.writeStartElement('library');
                                    xmlStreamWriter.writeAttribute('xmlns', 'http://www.demandware.com/xml/impex/library/2006-10-31');
                                    xmlStreamWriter.writeComment('Components of page ' + contentID);

                                    writeToPageXML(contentXML, xmlStreamWriter);

                                    xmlStreamWriter.writeEndElement();
                                    xmlStreamWriter.writeEndDocument();

                                    xmlStreamWriter.close();
                                    xmlFileWriter.close();
                                }
                            }
                        } else {
                            var text = contentXML.toString();
                            text = text.substr(text.indexOf('content-id'));
                            text = text.substr(0, text.indexOf('>'));
                            customLog.debug('One component skipped on cache conversion due to SFCC XML string quota limit: ' + text);
                        }
                    }
                }
            }
        }

        xmlStreamReader.close();
        xmlFileReader.close();

        readXmlFile.remove();
    }
    return items;
}

module.exports = {
    getPageDesignerList: getPageDesignerList
};
