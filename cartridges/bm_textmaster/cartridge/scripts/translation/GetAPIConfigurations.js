'use strict';

/**
* 	Get API configurations 
*
*	@output APIKey: String
*	@output APISecret: String
*	@output APICategory: String
*	@output APICategories: Array
*	@output APICatalogID: String
*	@output APIEnv: String
*	@output APICache: String
*	@output TMPageSize: Number
*	@output TMSFpassword: String
*	@output tmApiBaseUrlDemo: String
*   @output tmApiBaseUrlLive: String
*	@output tmBackofficeBaseUrlLive: String
*	@output tmBackofficeBaseUrlDemo: String
*   @output tmApiVersionUrlDemo: String
*   @output tmApiVersionUrlLive: String
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
	pdict.APIEnv = output.APIEnv;
	pdict.APICache = output.APICache;
	pdict.TMPageSize = output.TMPageSize;
	pdict.TMSFpassword = output.TMSFpassword;
	pdict.tmApiBaseUrlDemo = output.tmApiBaseUrlDemo;
	pdict.tmApiBaseUrlLive = output.tmApiBaseUrlLive;
	pdict.tmBackofficeBaseUrlLive = output.tmBackofficeBaseUrlLive;
	pdict.tmBackofficeBaseUrlDemo = output.tmBackofficeBaseUrlDemo;
	pdict.tmApiVersionUrlDemo = output.tmApiVersionUrlDemo;
	pdict.tmApiVersionUrlLive = output.tmApiVersionUrlLive;
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
		APICache: site.getCustomPreferenceValue("TMAPICache"),
		APIKey: site.getCustomPreferenceValue("TMApiKey") || "",
		APISecret: site.getCustomPreferenceValue("TMApiSecret") || "",
		APICategory: site.getCustomPreferenceValue("TMCategoryCode") || "",
		APICatalogID: site.getCustomPreferenceValue("TMMasterCatalogID") || "",
		APICategories: categories,
		TMPageSize: site.getCustomPreferenceValue("TMDashboardPageSize") || 100,
		TMSFpassword: site.getCustomPreferenceValue("TMSFpassword") || "",
		tmApiBaseUrlDemo: site.getCustomPreferenceValue("tmApiBaseUrlDemo") || "",
		tmApiBaseUrlLive: site.getCustomPreferenceValue("tmApiBaseUrlLive") || "",
		tmBackofficeBaseUrlLive: site.getCustomPreferenceValue("tmBackofficeBaseUrlLive") || "",
		tmBackofficeBaseUrlDemo: site.getCustomPreferenceValue("tmBackofficeBaseUrlDemo") || "",
		tmApiVersionUrlDemo: site.getCustomPreferenceValue("tmApiVersionUrlDemo") || "",
		tmApiVersionUrlLive: site.getCustomPreferenceValue("tmApiVersionUrlLive") || "",
		tmLanguageMapping: site.getCustomPreferenceValue("tmLanguageMapping")
	}
}

module.exports = {
	output: getOutput()
}
