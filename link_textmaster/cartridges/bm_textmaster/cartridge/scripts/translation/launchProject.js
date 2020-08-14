'use strict';

/* API Includes*/
var Resource = require('dw/web/Resource');

/* Script Modules */
var utils = require('*/cartridge/scripts/utils/tmUtils');

/**
 * Return the response when a project is launched
 * @param {Object} input - project id
 * @returns {Object} object
 */
function getOutput(input) {
    var projectID = input.projectID;
    var projectEndPoint = utils.config.api.get.project + '/' + projectID + '/' + Resource.msg('api.launch', 'textmaster', null);
    var projectResult = utils.textMasterClient('PUT', projectEndPoint);

    return projectResult;
}

module.exports = {
    output: getOutput
};
