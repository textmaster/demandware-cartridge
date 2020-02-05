/**
*	Reads translation parameters from previous form, build and generate a JSON
*
*	@input LocaleFrom: Object
*	@input ItemType: String
*	@input LocaleTo: Object
*	@input Attributes: Object
*	@input Items: Object
*	@input CatalogID: String
*
*	@output TransParams: String
*
*/
importPackage( dw.system );

// API Includes
var CatalogMgr = require('dw/catalog/CatalogMgr');
	
// Lib Includes
var LogUtils = require('~/cartridge/scripts/utils/LogUtils'),
	Utils = require('~/cartridge/scripts/utils/Utils');

// Global variables
var log = LogUtils.getLogger("setupTranslationParameters");

function execute( pdict : PipelineDictionary ) : Number {
	var input = {
			LocaleFrom: pdict.LocaleFrom,
			ItemType: pdict.ItemType,
			CatalogID: pdict.CatalogID,
			LocaleTo: pdict.LocaleTo.toArray(),
			Attributes: pdict.Attributes.toArray(),
			Items: pdict.Items.split(",")
		},
		output;
	
	output = getOutput(input);
	pdict.TransParams = output.TransParams;
	
	return PIPELET_NEXT;
}

function getOutput(input){
	var localeFrom = input.LocaleFrom,
		mappedLocaleFrom = input.MappedLocaleFrom,
		itemType = input.ItemType,
		catalogID = input.CatalogID,
		localeTo = input.LocaleTo,
		mappedLocaleTo = input.MappedLocaleTo,
		attributes = input.Attributes,
		items = input.Items,
		localeFromName, localeTo, locale, localeName, attribute, attr, count = 0, output;
	
	localeFromName = Utils.getLocaleName(localeFrom);
	
	// Get Master Catalog ID from site preference
	if(itemType == "product"){
		catalogID = Site.current.getCustomPreferenceValue('TMMasterCatalogID') || "";
	}
	
	for each(locale in localeTo){
		localeName = Utils.getLocaleName(locale);
		localeTo[count] = {
			id: Utils.toTextMasterLocaleID(locale),
			name: localeName,
			template: {}
		};
		count++;
	}
	
	count = 0;
	for each(attribute in attributes){
		attr = attribute.split("|");
		attributes[count] = {
			id: attr[0],
			name: attr[1],
			type: attr[2]
		};
		count++;
	}
	
	output = {
		localeFrom: {
				id: Utils.toTextMasterLocaleID(localeFrom),
				name: localeFromName
			},
		localeTo: localeTo,
		mappedLocaleFrom: Utils.toTextMasterLocaleID(mappedLocaleFrom),
		mappedLocaleTo: mappedLocaleTo,
		itemType: itemType,
		catalogID: catalogID,
		attributes: attributes,
		items: items
	};
	
	return {
		TransParams: JSON.stringify(output)
	};
}

module.exports = {
	output: function(input){
		return getOutput(input);
	}
}
