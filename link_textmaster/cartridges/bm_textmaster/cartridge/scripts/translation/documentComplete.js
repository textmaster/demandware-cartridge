'use strict';

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
    var documentID = input.documentID;
    var documentEndPoint = utils.config.api.get.project + '/' + projectID + '/' + utils.config.api.get.document + '/'
                         + documentID + '/' + Resource.msg('api.complete', 'textmaster', null);
    var documentResult = utils.textMasterClient('PUT', documentEndPoint);

    return documentResult;
}

module.exports = {
    output: getOutput
};
