'use strict';
/* global empty, XML */
/* eslint new-cap: 0 */

var utils;
var CustomObjectMgr;

/**
 * Writes Product data of variation attribute values to custom cache
 * @param {Object} masterProduct - master product object
 * */
function writeProductToCache(masterProduct) {
    var customCache = require('*/cartridge/scripts/utils/customCacheWebdav');
    var cacheUrl = utils.config.cache.url.masterProducts + '/' + masterProduct.id;
    customCache.setCache(cacheUrl, masterProduct);
}

/**
 * Removes Master Product Custom Object
 * @param {string} masterProductID - master Product ID
 * */
function removeMasterProductCustomObject(masterProductID) {
    var Transaction = require('dw/system/Transaction');
    var co = CustomObjectMgr.getCustomObject(utils.config.masterProducts.coName, masterProductID);

    if (co) {
        Transaction.begin();
        CustomObjectMgr.remove(co);
        Transaction.commit();
    }
}

/**
 * Generates Master product cache
 */
function start() {
    utils = require('*/cartridge/scripts/utils/tmUtils');
    CustomObjectMgr = require('dw/object/CustomObjectMgr');
    var productIDCos = CustomObjectMgr.getAllCustomObjects(utils.config.masterProducts.coName);
    var productIDs = [];

    while (productIDCos.hasNext()) {
        var productIDCo = productIDCos.next();
        productIDs.push(productIDCo.custom.productID);
    }

    if (productIDs.length) {
        var File = require('dw/io/File');
        var SEP = File.SEPARATOR;
        var readFilePath = File.IMPEX + SEP + 'src' + SEP + 'textmaster' + SEP + utils.config.masterProducts.xmlName;
        var readXmlFile = new File(readFilePath);

        if (readXmlFile.exists()) {
            var FileReader = require('dw/io/FileReader');
            var StreamReader = require('dw/io/XMLStreamReader');

            var xmlFileReader = new FileReader(readXmlFile);
            var xmlStreamReader = new StreamReader(xmlFileReader);
            var StreamConstants = require('dw/io/XMLStreamConstants');

            var contentXML;
            var formattedContentXML;
            var localElementName;
            var productID;
            var variationAttributes;
            var productCount = 0;

            while (xmlStreamReader.hasNext()) {
                if (xmlStreamReader.next() === StreamConstants.START_ELEMENT) {
                    localElementName = xmlStreamReader.getLocalName();

                    if (localElementName === 'product') {
                        var attrCount = xmlStreamReader.getAttributeCount();

                        for (var i = 0; i < attrCount; i++) {
                            if (xmlStreamReader.getAttributeLocalName(i) === 'product-id') {
                                productID = xmlStreamReader.getAttributeValue(i);
                                break;
                            }
                        }

                        if (productIDs.indexOf(productID) > -1) {
                            contentXML = xmlStreamReader.readXMLObject();
                            variationAttributes = null;
                            var masterProduct = {
                                id: productID,
                                attributes: []
                            };

                            if (contentXML) {
                                if (contentXML.toString().length < 1000000) { /* string quota limit */
                                    formattedContentXML = XML(contentXML.toString().replace('xmlns', 'xmlns:i'));
                                    variationAttributes = formattedContentXML.descendants('variation-attribute');

                                    if (!empty(variationAttributes)) {
                                        for (var j = 0; j < variationAttributes.length(); j++) {
                                            var variationAttribute = variationAttributes[j];
                                            var writeAttr = {
                                                id: variationAttribute.attribute('attribute-id').toString(),
                                                values: []
                                            };

                                            var attributeValues = variationAttribute.descendants('variation-attribute-value');

                                            for (var k = 0; k < attributeValues.length(); k++) {
                                                writeAttr.values.push(attributeValues[k].attribute('value').toString());
                                            }

                                            masterProduct.attributes.push(writeAttr);
                                        }
                                    }
                                }
                            }

                            writeProductToCache(masterProduct);
                            removeMasterProductCustomObject(masterProduct.id);
                            productCount++;

                            if (productCount >= productIDs.length) {
                                break;
                            }
                        }
                    }
                }
            }

            xmlStreamReader.close();
            xmlFileReader.close();
        }
    }
}

module.exports = {
    execute: start
};
