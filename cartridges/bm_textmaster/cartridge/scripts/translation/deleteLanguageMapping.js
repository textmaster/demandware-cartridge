/**
* Delete a language mapping in custom site preference
*
* @module cartridge/scripts/translation/DeleteLanguageMapping
*/

'use strict';
var Site = require('dw/system/Site');
var Transaction = require('dw/system/Transaction');
var Logger = require('dw/system/Logger');

/**
* Deletes new language mapping in custom site preference
* @param {Object} inputData - language mapping data
* @returns {boolean}
*/

function deleteLanguageMapping(mapping){
	var currentLanguageMappingStr = Site.current.getCustomPreferenceValue("tmLanguageMapping") || '[]';
	var languageMapping = [];

	try {
		languageMapping = JSON.parse(currentLanguageMappingStr);

		for (var index in languageMapping) {
			if (languageMapping[index].dw === mapping.dwLangCode && languageMapping[index].tm === mapping.tmLangCode) {
				languageMapping.splice(index, 1);
				break;
			}
		}
	} catch (e) {
		Logger.error('Error while parsing current Language Mapping' + e,message);
	}

	Transaction.begin();
		Site.current.setCustomPreferenceValue("tmLanguageMapping", JSON.stringify(languageMapping));
	Transaction.commit();
	
	return true;
}

module.exports = {
	action: function(inputData){
		return deleteLanguageMapping(inputData);
	}
}