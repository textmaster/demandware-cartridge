/**
*	Gets attribute list for a particular item type (product, content, category)
*
*	@input ItemType: String
*
*	@output Attributes: Object
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
	var input = {
			itemType: pdict.ItemType
		},
		output;
	
	output = getOutput(input);
	pdict.Attributes = output.Attributes;
	
   	return PIPELET_NEXT;
}

function getOutput(input){
	var attrDefinitions, attr, attrDef,
		attributes = [],
		defaultAttributes = dw.system.Site.getCurrent().getCustomPreferenceValue('TM'+ input.itemType +'Attributes');
		
	log = LogUtils.getLogger("GetAttributeList");
	
	try{
		defaultAttributes = defaultAttributes ? JSON.parse(defaultAttributes) : null;
	}
	catch(ex){
		log.error("Exception on getting default attribute list for "+ input.itemType +" from Site Preferences: " + ex.message);
	}
	
	try{
		attrDefinitions = dw.object.SystemObjectMgr.describe(input.itemType).getAttributeDefinitions().toArray();
		
		for each(attrDef in attrDefinitions){
			if((input.itemType.toLowerCase() != "product" && attrDef.system && !Utils.isAttributeAccessible(input.itemType.toLowerCase(), attrDef.ID)) || attrDef.ID == "ID" || attrDef.ID == "TranslatedLanguages" || attrDef.ID == "UUID" || attrDef.ID == "taxClassID"){
				continue;
			}
			
			if(attrDef.valueTypeCode == 3 || attrDef.valueTypeCode == 4 || attrDef.valueTypeCode == 5){
				attr = {};
				attr.ID = attrDef.ID;
				attr.name = attrDef.displayName;
				attr.tmDefault = getTMDefault(attrDef.ID, attrDef.displayName, defaultAttributes);
				attr.type = attrDef.system ? 'system' : 'custom';
				
				attributes.push(attr);
			}
		}
	}
	catch(ex){
		log.error("Exception on dealing with attributeDefinitions for "+ input.itemType +": " + ex.message);
	}
	
	return {
		Attributes: attributes
	};
}

/*
*	Gets flag by checking attribute in default attribute list that set in preference
*/
function getTMDefault(ID, name, defaultAttributes){
	var attr,
		result = false;
			
	if(defaultAttributes && defaultAttributes.length > 0){
		for each(attr in defaultAttributes){
			if(attr == ID || attr == name){
				result = true;
				break;
			}
		}
	}
	
	return result;
}

module.exports = {
	output: function(input){
		return getOutput(input);
	}
};
