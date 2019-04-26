'use strict';

/**
 * Controller that provides functions for auto launch document
 * @module controllers/TMAutoLaunch
 */

/* Script Modules */
var server = require('server');
var logUtils = require('*/cartridge/scripts/utils/LogUtils');

/* Global variables */
var log = logUtils.getLogger("AutoLaunchController");

/**
* Calls start method
*/

server.post('Document', function (req, res, next) {
	var input, output, projectid, documentid, autoLaunchDocument;
	
	projectid = req.querystring.projectid;
	documentid = req.querystring.documentid;
	input = {
		ProjectID: projectid,
		DocumentID: documentid
	};
	
	autoLaunchDocument = require('*/cartridge/scripts/translation/AutoLaunchDocument');
	output = autoLaunchDocument.output(input);
	
	res.json(output);
	
    next();
});

module.exports = server.exports();
