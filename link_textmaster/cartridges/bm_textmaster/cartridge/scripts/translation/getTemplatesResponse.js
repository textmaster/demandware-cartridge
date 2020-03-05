'use strict';

/* API Includes */
var Resource = require('dw/web/Resource');

/* Script Includes */
var utils = require('*/cartridge/scripts/utils/tmUtils');

/**
 * Gets templates response from TextMaster API
 * @returns {string} API response as string
 */
function getOutput() {
    var templatesEndPoint = Resource.msg('api.get.templates', 'textmaster', null);
    var result = utils.textMasterClient('GET', templatesEndPoint);

    return JSON.stringify(result);
}

module.exports = {
    output: getOutput
};
