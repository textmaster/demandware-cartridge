'use strict';

/* global empty, XML */
/* eslint new-cap: 0 */

/* Script Modules */
var utils = require('*/cartridge/scripts/utils/tmUtils');
var pageUtils = require('*/cartridge/scripts/utils/tmPageUtils');

/**
 * Writes page or component data to a custom XML
 * @param {Object} formattedContentXML - formattedContentXML
 * @param {Object} xmlStreamWriter - xmlStreamWriter
 */
function writeToPageXML(formattedContentXML, xmlStreamWriter) {
    xmlStreamWriter.writeRaw(formattedContentXML.toXMLString());
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
        var writeFolderPath = File.IMPEX + SEP + 'src' + SEP + 'textmaster' + SEP + Site.current.ID;
        var writeFolder = new File(writeFolderPath);

        if (!writeFolder.exists()) {
            writeFolder.mkdirs();
        }

        var writeFilePath = File.IMPEX + SEP + 'src' + SEP + 'textmaster' + SEP + Site.current.ID + SEP + utils.config.pageDesigner.xmlName;
        var writeXmlFile = new File(writeFilePath);

        if (!writeXmlFile.exists()) {
            writeXmlFile.createNewFile();
        }

        var FileReader = require('dw/io/FileReader');
        var StreamReader = require('dw/io/XMLStreamReader');

        var FileWriter = require('dw/io/FileWriter');
        var StreamWriter = require('dw/io/XMLStreamWriter');

        var xmlFileReader = new FileReader(readXmlFile);
        var xmlStreamReader = new StreamReader(xmlFileReader);
        var StreamConstants = require('dw/io/XMLStreamConstants');

        var xmlFileWriter = new FileWriter(writeXmlFile);
        var xmlStreamWriter = new StreamWriter(xmlFileWriter);

        var contentXML;
        var formattedContentXML;
        var localElementName;
        var pageID;
        var pageObject;
        var contentType;
        var customAttributes;
        var lastModified;

        xmlStreamWriter.writeStartDocument('UTF-8', '1.0');
        xmlStreamWriter.writeStartElement('library');
        xmlStreamWriter.writeAttribute('xmlns', 'http://www.demandware.com/xml/impex/library/2006-10-31');
        xmlStreamWriter.writeComment('Pages and components data');

        while (xmlStreamReader.hasNext()) {
            if (xmlStreamReader.next() === StreamConstants.START_ELEMENT) {
                localElementName = xmlStreamReader.getLocalName();

                if (localElementName === 'content') {
                    var attrCount = xmlStreamReader.getAttributeCount();
                    for (var i = 0; i < attrCount; i++) {
                        if (xmlStreamReader.getAttributeLocalName(i) === 'content-id') {
                            pageID = xmlStreamReader.getAttributeValue(i);
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
                                pageObject = utils.getPageObject(pageID);

                                if (pageObject && pageObject.isPage) {
                                    customAttributes = pageUtils.getPageCustom(pageID);
                                    lastModified = pageUtils.getPageLastModified(pageID);
                                    if (!lastModified) {
                                        pageUtils.setPageLastModified(pageID, { lastModified: new Date() });
                                    }

                                    items.push({
                                        ID: pageID,
                                        name: pageObject.name,
                                        online: pageObject.online,
                                        custom: {
                                            TranslatedLanguages: customAttributes.TranslatedLanguages || ''
                                        }
                                    });
                                }
                                writeToPageXML(contentXML, xmlStreamWriter);
                            }
                        }
                    }
                }
            }
        }
        xmlStreamWriter.writeEndElement();
        xmlStreamWriter.writeEndDocument();

        xmlStreamWriter.close();
        xmlFileWriter.close();

        xmlStreamReader.close();
        xmlFileReader.close();

        readXmlFile.remove();
    }
    return items;
}

module.exports = {
    getPageDesignerList: getPageDesignerList
};
