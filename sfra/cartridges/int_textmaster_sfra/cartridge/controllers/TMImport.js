/**
* Controller that provides functions for importing translated data from TextMaster
*
* @module  controllers/TMImport
*/

'use strict';

/* Script Modules */
var server = require('server');
var logUtils = require('*/cartridge/scripts/utils/LogUtils');

/* Global variables */
var log = logUtils.getLogger("AutoLaunchController");

/**
* Calls start method
*/

server.post('Data', function (req, res, next) {
	var input, output, projectid, documentid, importData;
	
	projectid = req.querystring.projectid;
	documentid = req.querystring.documentid;
	
	input = {
		ProjectID: projectid,
		DocumentID: documentid
	};
	
	importData = require('*/cartridge/scripts/translation/ImportData');
	output = importData.output(input);
	
	res.json(output);
	
    next();
});

module.exports = server.exports();

