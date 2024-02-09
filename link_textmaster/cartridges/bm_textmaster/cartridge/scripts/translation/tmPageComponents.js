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

    if (attributeKey === 'type') {
        value = valueArray.split('.');
        var componentType = value[2];
        return componentType;
    }

    for (j = 0; j < valueArray.length(); j++) {
        attribute = valueArray[j].attributes().toString().toLowerCase();

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
 * @param {string} componentID - componentID
 * @returns {Object} component ids
 */
function getSubComponents(componentID) {
    var FileReader = require('dw/io/FileReader');
    var StreamReader = require('dw/io/XMLStreamReader');
    var StreamConstants = require('dw/io/XMLStreamConstants');
    var localElementName;
    var pageContentLinks;
    var contentXML;
    var formattedContentXML;
    var i;
    var contentData;
    var componentIDs = [];
    var name;
    var type;
    var File = require('dw/io/File');
    var SEP = File.SEPARATOR;
    var readFilePath = File.IMPEX + SEP + 'src' + SEP + 'textmaster' + SEP + Site.current.ID + SEP + 'allComponentXMLs' + SEP + componentID + '.xml';
    var readXmlFile = new File(readFilePath);

    if (readXmlFile.exists()) {
        var xmlFileReader = new FileReader(readXmlFile);
        var xmlStreamReader = new StreamReader(xmlFileReader);

        while (xmlStreamReader.hasNext()) {
            if (xmlStreamReader.next() === StreamConstants.START_ELEMENT) {
                localElementName = xmlStreamReader.getLocalName();

                if (localElementName === 'content') {
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
                            type = getComponentAttributeValue('type', formattedContentXML);

                            try {
                                contentData = JSON.parse(contentData);
                                componentsData.push({
                                    id: componentID,
                                    name: name,
                                    type: type,
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

        xmlStreamReader.close();
        xmlFileReader.close();
    }

    return componentIDs;
}

/**
 * Gets all component IDs, which are direct child of other components of page designer objects, from library XML
 * @param {string} componentIDs - componentID
 * @returns {Object} component ids
 */
function getComponentComponents(componentIDs) {
    var subIDs = [];
    var allSubIDs = [];

    for (var i = 0; i < componentIDs.length; i++) {
        subIDs = getSubComponents(componentIDs[i]);

        if (subIDs && subIDs.length) {
            allSubIDs = allSubIDs.concat(subIDs);
            var subSubIDs = getComponentComponents(subIDs);

            if (subSubIDs && subSubIDs.length) {
                allSubIDs = allSubIDs.concat(subSubIDs);
            }
        }
    }

    return allSubIDs;
}

/**
 * Returns all component IDs, which are direct child of page designer objects, from library XML
 * @param {string} pageID - pageID
 * @returns {Object} componentIDs
 */
function getFirstLevelComponentIDs(pageID) {
    var customCache = require('*/cartridge/scripts/utils/customCacheWebdav');
    var componentIDs = [];
    var siteID = Site.current.ID;
    var componentsCacheUrl = '/' + siteID + '/pages/' + pageID + '/components';
    var components = customCache.getCache(componentsCacheUrl);

    for (var i = 0; i < components.length; i++) {
        componentIDs.push(components[i].id);
    }

    return componentIDs;
}

/**
 * Gets components data of all the components of a specific page designer object
 * @param {string} pageID - pageID
 * @param {string} locale - locale
 * @returns {Object} component data
 */
function getPDComponents(pageID, locale) {
    componentsData = [];
    var componentIDs = [];

    globLocaleID = locale.replace(/_/g, '-');
    componentIDs = getFirstLevelComponentIDs(pageID);
    getComponentComponents(componentIDs);

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
    var siteID = Site.current.ID;
    var componentsCacheUrl = '/' + siteID + '/pages/' + input.PageID + '/components/' + input.Language;
    customCache.setCache(componentsCacheUrl, components);

    return components;
}

module.exports = {
    getComponents: getComponents
};
