'use strict';

/**
* 	Get API configurations 
*
*	@output APIKey: String
*	@output APISecret: String
*	@output APICategory: String
*	@output APICategories: Array
*	@output APICatalogID: String
*
*/
importPackage(dw.system);

// Lib Includes
var LogUtils = require('~/cartridge/scripts/utils/LogUtils'),
	Utils = require('~/cartridge/scripts/utils/Utils');

// Global variable
var log;

function execute( pdict : PipelineDictionary ) : Number
{	
	var output = getOutput();
	
	pdict.APIKey = output.APIKey;
	pdict.APISecret = output.APISecret;
	pdict.APICategory = output.APICategory;
	pdict.APICatalogID = output.APICatalogID;
	pdict.APICategories = output.APICategories;
	
	return PIPELET_NEXT;
}

function getOutput(){
	var site = Site.current,
		categories = [],
		catResponse;
		
	log = LogUtils.getLogger("GetAPIConfiguration");
	catResponse = Utils.TextMasterPublic("GET",dw.web.Resource.msg("api.get.categories","textmaster",null));
	
	if(catResponse && catResponse.categories){
		categories = catResponse.categories;
	}
	
	return {
		APIEnv: site.getCustomPreferenceValue("TMAPIEnvironment"),
		APIKey: site.getCustomPreferenceValue("TMApiKey") || "",
		APISecret: site.getCustomPreferenceValue("TMApiSecret") || "",
		APICategory: site.getCustomPreferenceValue("TMCategoryCode") || "",
		APICatalogID: site.getCustomPreferenceValue("TMMasterCatalogID") || "",
		APICategories: categories,
		TMPageSize: site.getCustomPreferenceValue("TMDashboardPageSize") || 100,
	}
}

module.exports = {
	output: getOutput()
}
