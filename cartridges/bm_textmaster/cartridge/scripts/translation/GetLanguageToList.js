/**
* Get 'Language to' list
*
*	@input LanguageFrom: String
*
*	@output LanguageToList: Array
*/
importPackage( dw.system );

// Lib Includes
var LogUtils = require('~/cartridge/scripts/utils/LogUtils'),
	Utils = require('~/cartridge/scripts/utils/Utils');

// Global variables
var log;

function execute( pdict : PipelineDictionary ) : Number
{
	var input, output;
	
	input = {
		LanguageFrom: pdict.LanguageFrom
	};
	output = getOutput(input);
	
	pdict.LanguageToList = output.LanguageToList;
	
	return PIPELET_NEXT;
}

function getOutput(input){
	var languageFrom = input.LanguageFrom,
		languageTo = Utils.getLanguageTo(languageFrom);
	
	log = LogUtils.getLogger("GetLanguageToList");
	
	return {
		LanguageToList: languageTo
	};
}

module.exports = {
	output: function(input){
		return getOutput(input);
	}
}