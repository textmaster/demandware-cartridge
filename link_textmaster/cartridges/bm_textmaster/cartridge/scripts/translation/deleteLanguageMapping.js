/**
 * Delete a language mapping in custom site preference
 *
 * @module cartridge/scripts/translation/DeleteLanguageMapping
 */

'use strict';

/* API Includes */
var Site = require('dw/system/Site');
var Transaction = require('dw/system/Transaction');
var Logger = require('dw/system/Logger');

/**
 * Deletes new language mapping in custom site preference
 * @param {Object} mapping - language mapping data
 * @returns {boolean} return true
 */
function deleteLanguageMapping(mapping) {
    var currentLanguageMappingStr = Site.current.getCustomPreferenceValue('tmLanguageMapping') || '[]';
    var languageMapping = [];

    try {
        languageMapping = JSON.parse(currentLanguageMappingStr);
        for (var index = 0; index < languageMapping.length; index++) {
            if (languageMapping[index].dw === mapping.dwLangCode && languageMapping[index].tm === mapping.tmLangCode) {
                languageMapping.splice(index, 1);
                break;
            }
        }
    } catch (e) {
        Logger.error('Error while parsing current Language Mapping' + e.message);
    }

    Transaction.begin();
    Site.current.setCustomPreferenceValue('tmLanguageMapping', JSON.stringify(languageMapping));
    Transaction.commit();

    return true;
}

module.exports = {
    action: deleteLanguageMapping
};
