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
importClass( dw.object.CustomObjectMgr );

// Lib Includes
var LogUtils = require('~/cartridge/scripts/utils/LogUtils'),
	Utils = require('~/cartridge/scripts/utils/Utils');

// Global variables
var log = LogUtils.getLogger("AutoLaunchController");;

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
		responseObj, triggerJob, jobName, ocapiJobUrl, jobResponse, responseMessage;
	
	if(projectid && documentid){
		triggerJob = setAutoLaunchJobQuery(projectid, documentid);
		
		if(triggerJob){
			jobName = Resource.msg("autolaunch.job.name","textmaster",null) + dw.system.Site.current.ID;
			ocapiJobUrl = Resource.msgf("ocapi.jobs.post","textmaster",null,jobName);
			jobResponse = Utils.OCAPIClient("post", ocapiJobUrl,null);
			
			result = jobResponse && (jobResponse.execution_status.toLowerCase() == "running" || jobResponse.execution_status.toLowerCase() == "pending" || jobResponse.execution_status.toLowerCase() == "finished" || jobResponse.execution_status.toLowerCase() == "jobalreadyrunningexception");
			
			if(!result){
				log.error("jobResponse.execution_status : " + jobResponse.execution_status.toLowerCase());
				log.error("Job '"+ jobName +"' is not found or not enabled");
			}
		}
		else{
			responseMessage = Resource.msg("autolaunch.waiting.message","textmaster",null);
		}
	}
	else{
		responseMessage = Resource.msg("autolaunch.parameter.error","textmaster",null);
		log.error(responseMessage);
	}
	
	responseMessage = responseMessage ? responseMessage : (result ? Resource.msg("autolaunch.success.message","textmaster",null) : Resource.msg("autolaunch.error.message","textmaster",null));
	
	responseObj = {
		success: result,
		message: responseMessage
	};
	
	return responseObj;
}

/* set document in custom object for auto launch */
function setAutoLaunchJobQuery(projectid, documentid){
	var customObjectName = Resource.msg("autolaunch.customobject.name","textmaster",null),
		tryAgain = true,
		documentsString, documents, result = false;
	
	try{
		var dataHolder = CustomObjectMgr.getCustomObject(customObjectName, projectid);
		
		if(dataHolder){
			while(tryAgain){
				try{
					documentsString = dataHolder.custom.documents || "[]";
					documents = JSON.parse(documentsString);
					
					if(documents.indexOf(documentid) < 0){
						documents.push(documentid);
					}
					
					Transaction.begin();
					dataHolder.custom.documents = JSON.stringify(documents);
					Transaction.commit();
					
					tryAgain = false;
				}
				catch(ex){}
			}
			
			documentsString = dataHolder.custom.documents || "[]";
			documents = JSON.parse(documentsString);
			
			result = dataHolder.custom.documentCount == documents.length;
		}
	}
	catch(ex){
		log.error(ex.message + " - No custom object found.");
	}
	
	return result;
}

module.exports = {
	output: function(input){
		return getOutput(input);
	}
}
