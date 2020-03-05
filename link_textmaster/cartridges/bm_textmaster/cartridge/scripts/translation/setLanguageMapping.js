/**
 * Save new language mapping to custom site preference
 *
 * @module cartridge/scripts/translation/setLanguageMapping
 */

'use strict';

/* API Includes */
var Site = require('dw/system/Site');
var Transaction = require('dw/system/Transaction');
var Logger = require('dw/system/Logger');

/**
 * Save new language mapping to custom site preference
 * @param {Object} mapping - language mapping data
 * @returns {boolean} return true
 */
function setLanguageMapping(mapping) {
    var currentLanguageMappingStr = Site.current.getCustomPreferenceValue('tmLanguageMapping') || '[]';
    var languageMapping = [];

    try {
        languageMapping = JSON.parse(currentLanguageMappingStr);
    } catch (e) {
        Logger.error('Error while parsing current Language Mapping' + e.message);
    }

    if (mapping.currDwLangCode && mapping.currTmLangCode) { // Edit mode
        for (var index = 0; index < languageMapping.length; index++) {
            if (languageMapping[index].dw === mapping.currDwLangCode && languageMapping[index].tm === mapping.currTmLangCode) {
                languageMapping[index] = {
                    dw: mapping.dwLangCode,
                    tm: mapping.tmLangCode
                };
                break;
            }
        }
    } else { // new mapping
        languageMapping.push({
            dw: mapping.dwLangCode,
            tm: mapping.tmLangCode
        });
    }

    Transaction.begin();
    Site.current.setCustomPreferenceValue('tmLanguageMapping', JSON.stringify(languageMapping));
    Transaction.commit();

    return true;
}

module.exports = {
    outputData: setLanguageMapping
};
