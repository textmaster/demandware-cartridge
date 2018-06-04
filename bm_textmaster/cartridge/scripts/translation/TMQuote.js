/**
*	Creates translation documents
*
*	@input ProjectID: String
*	@output Status: Number
*	
*/
importPackage( dw.system );
importPackage( dw.catalog );
importPackage( dw.util );

importClass( dw.web.Resource );
importClass( dw.object.CustomObjectMgr );

// Lib Includes
var LogUtils = require('~/cartridge/scripts/utils/LogUtils'),
	Utils = require('~/cartridge/scripts/utils/Utils');

// Global variables
var log = LogUtils.getLogger("TMQuote Script");;

function execute( pdict : PipelineDictionary ) : Number
{
	var input, output;
	
	input = {
		ProjectID: pdict.ProjectID
	};
	
	output = getOutput(input);
	pdict.Status = output.statusCode;
	
   	return PIPELET_NEXT;
}

function getOutput(input){
	var jobName, jobResponse, ocapiJobUrl, statusCode,
		projectid = input.ProjectID;
	
	try {
    	if(projectid){
	    	var co = CustomObjectMgr.getCustomObject('TextMasterProject', projectid);
	    	if (co == null) {
	    		Transaction.begin();
	    		co = CustomObjectMgr.createCustomObject('TextMasterProject', projectid);
	    		Transaction.commit();
	    	}
	    	
	    	jobName = Resource.msg("quote.jobname", "textmaster",null) + dw.system.Site.current.ID;
	    	ocapiJobUrl = Resource.msgf("ocapi.jobs.post","textmaster",null,jobName);
	    	jobResponse = Utils.OCAPIClient("post", ocapiJobUrl,null);
	    	
	    	statusCode = jobResponse && (jobResponse.execution_status.toLowerCase() == "running" || jobResponse.execution_status.toLowerCase() == "pending") ? 201 : 404;
    	}
    	else{
    		statusCode = 400;
    	}
    	
	} catch(ex) {
		log.error("Exception in TMQuote Script: "+ ex.message);
		statusCode = 500;
	}
	
	return {
		statusCode: statusCode
	};
}

module.exports = {
	output: function(input){
		return getOutput(input);
	}
}
