/**
* Logics of LanguageMapping feature
*
* @module  controllers/TMMapping
*/

'use strict';
var ISML = require('dw/template/ISML');
var utils = require('~/cartridge/scripts/utils/Utils');

/**
* Gets the demandware and textmaster languages
* @return {boolean}
*/
function newMappingRow(){
	var languageMapping = require('~/cartridge/scripts/translation/getLanguageMapping');
	var dwLanguages = utils.getDWLanguages();
	var currDwLangCode = request.httpParameterMap.get('currDwLangCode').stringValue;
	var currTmLangCode = request.httpParameterMap.get('currTmLangCode').stringValue;
	var currDwLangName = utils.getLocaleName(currDwLangCode);
	var currTmLangName = utils.getTMLocaleName(currTmLangCode);
	languageMapping = languageMapping.data;
	
	dwLanguages = dwLanguages.filter (function (item) {
		for (var i = 0; i < languageMapping.length; i++ ) {
			if (languageMapping[i].dw === item.id) {
				return false;
			}
		}
		return true;
	});
	
	var tmLanguages = utils.getTextMasterLanguages();
	
	tmLanguages = tmLanguages.filter (function (item) {
		for (var i = 0; i < languageMapping.length; i++ ) {
			if (languageMapping[i].tm === item.code) {
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
function saveLanguageMapping(){
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
		tmLangName: request.httpParameterMap.get('tmLangName').stringValue
	};

	apiConfig.outputData(saveInput);
	ISML.renderTemplate('translation/addlanguagemappingrow', {input:displayInput});
}

/**
 * Deletes Language Mapping Row
 */
function deleteLanguageMappingRow() {
	var deleteLanguageMapping = require('~/cartridge/scripts/translation/deleteLanguageMapping'),
		input = {
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
