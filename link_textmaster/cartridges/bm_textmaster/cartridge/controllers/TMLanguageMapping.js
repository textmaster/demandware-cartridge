/**
 * Logics of LanguageMapping feature
 *
 * @module  controllers/TMMapping
 */

'use strict';
/* global request */

/* API Includes */
var ISML = require('dw/template/ISML');

/* Script Includes */
var utils = require('*/cartridge/scripts/utils/tmUtils');

/**
 * Gets the demandware and textmaster languages
 */
function newMappingRow() {
    var languageMapping = require('*/cartridge/scripts/translation/getLanguageMapping');
    var dwLanguages = utils.getDWLanguages();
    var currDwLangCode = request.httpParameterMap.get('currDwLangCode').stringValue;
    var currTmLangCode = request.httpParameterMap.get('currTmLangCode').stringValue;
    var currDwLangName = utils.getLocaleName(currDwLangCode);
    var currTmLangName = utils.getTMLocaleName(currTmLangCode);
    languageMapping = languageMapping.data;

    dwLanguages = dwLanguages.filter(function (item) {
        for (var i = 0; i < languageMapping.length; i++) {
            if (languageMapping[i].dw === item.id) {
                return false;
            }
        }
        return true;
    });

    for (var i = 0; i < dwLanguages.length; i++) {
        if (utils.isLocaleEnabled(dwLanguages[i].id)) {
            dwLanguages[i].name = '* ' + dwLanguages[i].name;
        }
    }

    var tmLanguages = utils.getTextMasterLanguages();

    tmLanguages = tmLanguages.filter(function (item) {
        for (var j = 0; j < languageMapping.length; j++) {
            if (languageMapping[j].tm === item.code) {
                return false;
            }
        }
        return true;
    });

    var input = {
        dwLanguages: dwLanguages,
        tmLanguages: tmLanguages,
        currDwLangCode: currDwLangCode,
        currTmLangCode: currTmLangCode,
        currDwLangName: currDwLangName,
        currTmLangName: currTmLangName
    };

    ISML.renderTemplate('translation/newmappingrow', input);
}

/**
 * Gets the language code to save language mapping
 */
function saveLanguageMapping() {
    var apiConfig = require('~/cartridge/scripts/translation/setLanguageMapping');
    var saveInput = {
        dwLangCode: request.httpParameterMap.get('dwLangCode').stringValue,
        tmLangCode: request.httpParameterMap.get('tmLangCode').stringValue,
        currDwLangCode: request.httpParameterMap.get('currDwLangCode').stringValue,
        currTmLangCode: request.httpParameterMap.get('currTmLangCode').stringValue
    };
    var displayInput = {
        dwLangCode: request.httpParameterMap.get('dwLangCode').stringValue,
        tmLangCode: request.httpParameterMap.get('tmLangCode').stringValue,
        dwLangName: request.httpParameterMap.get('dwLangName').stringValue,
        tmLangName: request.httpParameterMap.get('tmLangName').stringValue,
        enabled: utils.isLocaleEnabled(request.httpParameterMap.get('dwLangCode').stringValue)
    };

    apiConfig.outputData(saveInput);
    ISML.renderTemplate('translation/addlanguagemappingrow', {
        input: displayInput
    });
}

/**
 * Deletes Language Mapping Row
 */
function deleteLanguageMappingRow() {
    var deleteLanguageMapping = require('~/cartridge/scripts/translation/deleteLanguageMapping');
    var input = {
        dwLangCode: request.httpParameterMap.get('dwLangCode').stringValue,
        tmLangCode: request.httpParameterMap.get('tmLangCode').stringValue
    };

    deleteLanguageMapping.action(input);
}

newMappingRow.public = true;
saveLanguageMapping.public = true;
deleteLanguageMappingRow.public = true;

exports.NewMappingRow = newMappingRow;
exports.SaveLanguageMapping = saveLanguageMapping;
exports.DeleteLanguageMappingRow = deleteLanguageMappingRow;
