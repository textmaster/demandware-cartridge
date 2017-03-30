/**
*	Gets templates response from TextMaster API
*
*/
importPackage( dw.system );

importClass( dw.web.Resource );

// Lib Includes
var LogUtils = require('~/cartridge/scripts/utils/LogUtils'),
	Utils = require('~/cartridge/scripts/utils/Utils');

// Global variables
var log;

function execute( pdict : PipelineDictionary ) : Number
{
	var output = getOutput();
	response.getWriter().println(output);
	
	return PIPELET_NEXT;
}

function getOutput(){
	var templatesEndPoint = Resource.msg("api.get.templates","textmaster",null),
		result;
	log = LogUtils.getLogger("GetTemplateList");
	result = Utils.TextMasterClient("GET", templatesEndPoint);
	
	return JSON.stringify(result);
}

module.exports = {
	output: getOutput()
}
