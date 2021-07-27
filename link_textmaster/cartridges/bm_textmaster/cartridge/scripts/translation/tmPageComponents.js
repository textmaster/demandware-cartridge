'use strict';

/* global empty, XML */
/* eslint new-cap: 0 */

/* API Includes */
var Site = require('dw/system/Site');

/* Script Modules */
var logUtils = require('*/cartridge/scripts/utils/tmLogUtils');

/* Global Variables */
var log = logUtils.getLogger('tmPageComponents');
var componentsData;
var globLocaleID;

/**
 * Returns all component IDs, which are direct child of page designer objects, from library XML
 * @param {Object} readXmlFile - readXmlFile
 * @param {string} pageID - pageID
 * @returns {Object} componentIDs
 */
function getPageComponents(readXmlFile, pageID) {
    var FileReader = require('dw/io/FileReader');
    var StreamReader = require('dw/io/XMLStreamReader');
    var xmlFileReader = new FileReader(readXmlFile);
    var xmlStreamReader = new StreamReader(xmlFileReader);
    var StreamConstants = require('dw/io/XMLStreamConstants');
    var contentID;
    var localElementName;
    var contentXML;
    var pageContentLinks;
    var formattedContentXML;
    var i;
    var attrCount;
    var componentIDs = [];

    while (xmlStreamReader.hasNext()) {
        if (xmlStreamReader.next() === StreamConstants.START_ELEMENT) {
            localElementName = xmlStreamReader.getLocalName();

            if (localElementName === 'content') {
                attrCount = xmlStreamReader.getAttributeCount();
                for (i = 0; i < attrCount; i++) {
                    if (xmlStreamReader.getAttributeLocalName(i) === 'content-id') {
                        contentID = xmlStreamReader.getAttributeValue(i);
                        break;
                    }
                }

                if (contentID === pageID) {
                    contentXML = xmlStreamReader.readXMLObject();

                    if (contentXML) {
                        formattedContentXML = XML(contentXML.toString().replace('xmlns', 'xmlns:i'));
                        pageContentLinks = formattedContentXML.descendants('content-link');

                        for (i = 0; i < pageContentLinks.length(); i++) {
                            componentIDs.push(pageContentLinks[i].attribute('content-id').toString());
                        }

                        break;
                    }
                }
            }
        }
    }

    xmlStreamReader.close();
    xmlFileReader.close();

    return componentIDs;
}

/**
 * Gets value of a specific attribute of Component data
 * @param {string} attributeKey - tag name as in XML
 * @param {string} formattedContentXML - Component XML
 * @returns {Object} data of attribute as in XML
 * */
function getComponentAttributeValue(attributeKey, formattedContentXML) {
    var valueArray = formattedContentXML.descendants(attributeKey);
    var value = '';
    var defaultValue = '';
    var attribute = '';
    var j;

    for (j = 0; j < valueArray.length(); j++) {
        attribute = valueArray[j].attributes().toString();

        if (attribute === globLocaleID) {
            value = valueArray[j].toString();
            break;
        } else if (attribute === 'x-default') {
            defaultValue = valueArray[j].toString();
        }
    }

    if (!value) {
        value = defaultValue;
    }

    return value;
}

/**
 * Returns all component IDs, which are direct child of other components of page designer objects, from library XML
 * @param {Object} readXmlFile - readXmlFile
 * @param {string} componentID - componentID
 * @returns {Object} component ids
 */
function getSubComponents(readXmlFile, componentID) {
    var FileReader = require('dw/io/FileReader');
    var StreamReader = require('dw/io/XMLStreamReader');
    var xmlFileReader = new FileReader(readXmlFile);
    var xmlStreamReader = new StreamReader(xmlFileReader);
    var StreamConstants = require('dw/io/XMLStreamConstants');
    var contentID;
    var localElementName;
    var contentXML;
    var pageContentLinks;
    var formattedContentXML;
    var i;
    var attrCount;
    var contentData;
    var componentIDs = [];
    var name;

    while (xmlStreamReader.hasNext()) {
        if (xmlStreamReader.next() === StreamConstants.START_ELEMENT) {
            localElementName = xmlStreamReader.getLocalName();

            if (localElementName === 'content') {
                attrCount = xmlStreamReader.getAttributeCount();
                for (i = 0; i < attrCount; i++) {
                    if (xmlStreamReader.getAttributeLocalName(i) === 'content-id') {
                        contentID = xmlStreamReader.getAttributeValue(i);
                        break;
                    }
                }

                if (contentID === componentID) {
                    contentXML = xmlStreamReader.readXMLObject();

                    if (contentXML) {
                        formattedContentXML = XML(contentXML.toString().replace('xmlns', 'xmlns:i'));
                        pageContentLinks = formattedContentXML.descendants('content-link');

                        for (i = 0; i < pageContentLinks.length(); i++) {
                            componentIDs.push(pageContentLinks[i].attribute('content-id').toString());
                        }

                        contentData = getComponentAttributeValue('data', formattedContentXML);

                        if (contentData !== '' && contentData !== '{}' && contentData !== '{ }') {
                            name = getComponentAttributeValue('display-name', formattedContentXML);

                            try {
                                contentData = JSON.parse(contentData);
                                componentsData.push({
                                    id: componentID,
                                    name: name,
                                    data: contentData
                                });
                            } catch (e) {
                                log.error(e.message);
                            }
                        }
                        break;
                    }
                }
            }
        }
    }

    xmlStreamReader.close();
    xmlFileReader.close();

    return componentIDs;
}

/**
 * Gets all component IDs, which are direct child of other components of page designer objects, from library XML
 * @param {Object} readXmlFile - readXmlFile
 * @param {string} componentIDs - componentID
 * @returns {Object} component ids
 */
function getComponentComponents(readXmlFile, componentIDs) {
    var subIDs = [];
    var allSubIDs = [];

    for (var i = 0; i < componentIDs.length; i++) {
        subIDs = getSubComponents(readXmlFile, componentIDs[i]);

        if (subIDs && subIDs.length) {
            allSubIDs = allSubIDs.concat(subIDs);
            var subSubIDs = getComponentComponents(readXmlFile, subIDs);

            if (subSubIDs && subSubIDs.length) {
                allSubIDs = allSubIDs.concat(subSubIDs);
            }
        }
    }

    return allSubIDs;
}

/**
 * Gets components data of all the components of a specific page designer object
 * @param {string} pageID - pageID
 * @param {string} locale - locale
 * @returns {Object} component data
 */
function getPDComponents(pageID, locale) {
    componentsData = [];
    var File = require('dw/io/File');
    var SEP = File.SEPARATOR;
    var tmUtils = require('*/cartridge/scripts/utils/tmUtils');
    var readFilePath = File.IMPEX + SEP + 'src' + SEP + 'textmaster' + SEP + Site.current.ID + SEP + tmUtils.config.pageDesigner.xmlName;
    var readXmlFile = new File(readFilePath);
    var componentIDs = [];

    globLocaleID = locale.replace(/_/g, '-');

    if (readXmlFile.exists()) {
        componentIDs = getPageComponents(readXmlFile, pageID);
        getComponentComponents(readXmlFile, componentIDs);
    }

    return componentsData;
}

/**
 * Returns Page Designer Object List
 * @param {Object} input - input object
 * @returns {Object} object
 */
function getComponents(input) {
    var customCache = require('*/cartridge/scripts/utils/customCacheWebdav');
    var components = getPDComponents(input.PageID, input.Language);
    var componentsCacheUrl = '/pages/' + input.PageID + '/components/' + input.Language;
    customCache.setCache(componentsCacheUrl, components);

    return components;
}

module.exports = {
    getComponents: getComponents
};
