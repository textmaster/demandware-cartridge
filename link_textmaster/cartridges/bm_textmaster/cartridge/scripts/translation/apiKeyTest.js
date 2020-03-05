'use strict';

/* API Includes */
var Resource = require('dw/web/Resource');

/* Script Includes */
var utils = require('*/cartridge/scripts/utils/tmUtils');

/**
 * Check if API Key and Secret are valid in the API environment
 * @param {Object} input - input object
 * @returns {string} output success or failure
 */
function getOutput(input) {
    var result = utils.textMasterTest(input);
    var output = 'failure';

    if (result && result.message &&
        result.message.indexOf(Resource.msg('api.test.msg.key', 'textmaster', null)) > -1 &&
        result.message.indexOf(Resource.msg('api.test.msg.secret', 'textmaster', null)) > -1) {
        output = 'success';
    }

    return output;
}

module.exports = {
    output: getOutput
};

