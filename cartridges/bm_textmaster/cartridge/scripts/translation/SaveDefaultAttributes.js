/**
*	Saves default attributes
*
*	@input ItemType: String
*	@input Attributes: Array
*
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
		ItemType: pdict.ItemType,
		Attributes: pdict.Attributes
	};
	output = getOutput(input);
	
	response.getWriter().println(output);
	
	return PIPELET_NEXT;
}

function getOutput(input){
	var itemType = input.ItemType,
		attributes = input.Attributes.toArray(),
		attributeList = [],
		attr, prefName, prefValue;
	
	log = LogUtils.getLogger("SaveDefualtAttributes");
	
	for each(attr in attributes){
		attributeList.push(attr.split("|")[0]);
	}
	
	prefName = 'TM'+ Utils.firstLetterCapital(itemType) +'Attributes';
	prefValue = JSON.stringify(attributeList);
	
	Transaction.begin();
	Site.getCurrent().setCustomPreferenceValue(prefName, prefValue);
	Transaction.commit();
	
	return {
		output: "success"
	};
}

module.exports = {
	output: function(input){
		return getOutput(input);
	}
}
