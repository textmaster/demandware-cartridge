/**
*	Creates translation documents
*
*	@input ProjectID: String
*	@input DocumentID: String
*	
*/
importPackage( dw.system );
importPackage( dw.catalog );
importPackage( dw.util );

importClass( dw.web.Resource );

// Lib Includes
var LogUtils = require('~/cartridge/scripts/utils/LogUtils'),
	Utils = require('~/cartridge/scripts/utils/Utils');

// Global variables
var log = LogUtils.getLogger("ImportController");;

function execute( pdict : PipelineDictionary ) : Number
{
	var input, output;
	
	input = {
		ProjectID: pdict.ProjectID,
		DocumentID: pdict.DocumentID
	};
	
	output = getOutput(input);
	response.getWriter().println(JSON.stringify(output));
	
   	return PIPELET_NEXT;
}

function getOutput(input){
	var result = false,
		projectid = input.ProjectID,
		documentid = input.DocumentID,
		responseObj, jobRunning, jobName, ocapiJobUrl, jobResponse, responseMessage;
	
	if(projectid && documentid){
		jobRunning = Utils.setImportJobQuery(projectid, documentid);
		
		if(jobRunning == false){
			jobName = Resource.msg("import.job.name","textmaster",null) + dw.system.Site.current.ID;
			ocapiJobUrl = Resource.msgf("ocapi.jobs.post","textmaster",null,jobName);
			jobResponse = Utils.OCAPIClient("post", ocapiJobUrl,null);
			
			result = jobResponse && (jobResponse.execution_status.toLowerCase() == "running" || jobResponse.execution_status.toLowerCase() == "pending" || jobResponse.execution_status.toLowerCase() == "finished");
			
			if(!result){
				log.error("Job '"+ jobName +"' is not found or not enabled");
			}
		}
		else{
			result = true;
		}
	}
	else{
		responseMessage = Resource.msg("import.parameter.error","textmaster",null);
		log.error(responseMessage);
	}
	
	responseMessage = responseMessage ? responseMessage : (result ? Resource.msg("import.success.message","textmaster",null) : Resource.msg("import.error.message","textmaster",null));
	
	responseObj = {
		success: result,
		message: responseMessage
	};
	
	return responseObj;
}

module.exports = {
	output: function(input){
		return getOutput(input);
	}
}
