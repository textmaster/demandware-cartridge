/**
* 	set API configurations 
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
	
	if(autoLaunch.toLowerCase() === "true"){
		// finalize project
		projectEndPoint = Resource.msg("api.get.project","textmaster",null) + "/" + projectID + "/" + Resource.msg("api.projects.finalize","textmaster",null);
		projectResult = Utils.TextMasterClient("PUT", projectEndPoint, JSON.stringify({}));
	}
	else{
		Utils.TriggerURL("POST", "https://"+ sfProtectionURLpart + System.instanceHostname +"/on/demandware.store/Sites-"+ Site.current.ID +"-Site/default/TMQuote-Send?projectid="+ projectID);
	}
	
	response.getWriter().println("success");
}

module.exports = {
	output: function(input){
		return getOutput(input);
	}
}
