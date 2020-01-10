/**
* Save new language mapping to custom site preference
*
* @module cartridge/scripts/translation/setLanguageMapping
*/

'use strict';
var Site = require('dw/system/Site');
var Transaction = require('dw/system/Transaction');
var Logger = require('dw/system/Logger');

/**
* Save new language mapping to custom site preference
* @param {Object} inputData - language mapping data
* @returns {boolean}
*/

function setLanguageMapping(mapping){
	var currentLanguageMappingStr = Site.current.getCustomPreferenceValue("tmLanguageMapping") || '[]';
	var languageMapping = [];

	try {
		languageMapping = JSON.parse(currentLanguageMappingStr);
	} catch (e) {
		Logger.error('Error while parsing current Language Mapping' + e,message);
	}

	if (mapping.currDwLangCode && mapping.currTmLangCode) { // Edit mode
		for (var index in languageMapping) {
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
		Site.current.setCustomPreferenceValue("tmLanguageMapping", JSON.stringify(languageMapping));
	Transaction.commit();
	
	return true;
}

module.exports = {
	outputData: function(inputData){
		return setLanguageMapping(inputData);
	}
}