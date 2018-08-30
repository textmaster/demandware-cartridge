/**
* 	set API configurations 
*
*	@input APIKey: String
*	@input APISecret: String
*	@input APICategory: String
*	@input APICatalogID: String
*	@input APIEnv: String
*	@input TMPageSize: Number
*	@input TMSFpassword: String
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
		APIKey: pdict.APIKey,
		APISecret: pdict.APISecret,
		APICategory: pdict.APICategory,
		APICatalogID: pdict.APICatalogID,
		APIEnv: pdict.APIEnv,
		TMPageSize: pdict.TMPageSize,
		TMSFpassword: pdict.TMSFpassword
	};
	output = getOutput(input);
	
	return PIPELET_NEXT;
}

function getOutput(input){
	var site = Site.current;
		
	log = LogUtils.getLogger("SetAPIConfiguration");

	Transaction.begin();
	site.setCustomPreferenceValue("TMApiKey",input.APIKey);
	site.setCustomPreferenceValue("TMApiSecret",input.APISecret);
	site.setCustomPreferenceValue("TMCategoryCode",input.APICategory);
	site.setCustomPreferenceValue("TMMasterCatalogID",input.APICatalogID);
	site.setCustomPreferenceValue("TMAPIEnvironment",input.APIEnv);
	site.setCustomPreferenceValue("TMDashboardPageSize",input.TMPageSize);
	
	if(Site.current.status === Site.SITE_STATUS_PROTECTED){
		site.setCustomPreferenceValue("TMSFpassword",input.TMSFpassword);
	}
	
	Transaction.commit();
	
	return true;
}

module.exports = {
	output: function(input){
		return getOutput(input);
	}
}
