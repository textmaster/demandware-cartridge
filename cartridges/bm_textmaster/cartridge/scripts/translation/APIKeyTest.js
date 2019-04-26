'use strict';
/**
* 	Check if API Key and Secret are valid in the API environment    
*   
*	@input APIKey : String
*	@input APISecret : String
*	@input APIEnv : String
*
*/

importPackage(dw.system);
importPackage(dw.web);

// Lib Includes
var LogUtils = require('~/cartridge/scripts/utils/LogUtils'),
	Utils = require('~/cartridge/scripts/utils/Utils');

// Global variables
var log = LogUtils.getLogger("getFollowUpList");

function execute( pdict : PipelineDictionary ) : Number
{
	var input = {
			apiKey: pdict.APIKey,
			apiSecret: pdict.APISecret,
			apiEnv: pdict.APIEnv
		},
		output = getOutput(input);
	
	response.getWriter().print(output);
	
	return PIPELET_NEXT;
}

function getOutput(input){
   	var result = Utils.TextMasterTest(input),
   		output = "failure";
   	
   	if(result && result.message 
   			&& result.message.indexOf(Resource.msg('api.test.msg.key', 'textmaster',null)) > -1 
   			&& result.message.indexOf(Resource.msg('api.test.msg.secret', 'textmaster',null)) > -1){
   		output = "success";
   	}
   	
   	return output;
}

module.exports = {
	output: function(input){
		return getOutput(input);
	}
}
