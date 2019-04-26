/**
* 	Handle auto launch or send quote 
*
*	@input ProjectID: String
*	@input AutoLaunch: String
*
*/
importPackage( dw.system );

importClass( dw.web.Resource );

// Lib Includes
var LogUtils = require('~/cartridge/scripts/utils/LogUtils'),
	Utils = require('~/cartridge/scripts/utils/Utils');

// Global variables
var log = LogUtils.getLogger("HandleAutoLaunch");

function execute( pdict : PipelineDictionary ) : Number
{
	var input, output;
	
	input = {
		ProjectID: pdict.ProjectID,
		AutoLaunch: pdict.AutoLaunch
	};
	output = getOutput(input);
	
	return PIPELET_NEXT;
}

function getOutput(input){
	var projectID = input.ProjectID,
		autoLaunch = input.AutoLaunch,
		tmSFpassword = Site.getCurrent().getCustomPreferenceValue('TMSFpassword') || "",
		sfProtectionURLpart = (Site.current.status === Site.SITE_STATUS_PROTECTED) ? (Resource.msg("storefront.username","textmaster",null) + ":" + tmSFpassword + "@") : "",
		projectEndPoint, projectResult;
	
	if(autoLaunch.toLowerCase() === "false"){
		Utils.TriggerURL("POST", "https://"+ sfProtectionURLpart + System.instanceHostname +"/on/demandware.store/Sites-"+ Site.current.ID +"-Site/default/TMQuote-Send?projectid="+ projectID);
	}
	else{
		// AutoLaunch is handled by autoLaunch job
	}
	
	response.getWriter().println("success");
}

module.exports = {
	output: function(input){
		return getOutput(input);
	}
}
