'use strict';

/* API Includes */
var Resource = require('dw/web/Resource');

/* Script Includes */
var utils = require('*/cartridge/scripts/utils/tmUtils');
var LogUtils = require('*/cartridge/scripts/utils/tmLogUtils');

var log = LogUtils.getLogger('getTemplateResponse');

/**
 * Gets templates response from TextMaster API
 * @returns {string} API response as string
 */
function getOutput() {
    var result = [];
    var fetchNextPage = true;
    var page = 1;
    var templatesEndPoint = Resource.msg('api.get.templates', 'textmaster', null);

    try {
        while (fetchNextPage) {
            var templatesEndPointPage = templatesEndPoint + '?page=' + page;
            var templatesResponse = utils.textMasterClient('GET', templatesEndPointPage);

            if (templatesResponse && templatesResponse.api_templates && templatesResponse.api_templates.length > 0) {
                var templates = templatesResponse.api_templates;

                for (var i = 0; i < templates.length; i++) {
                    result.push(templates[i]);
                }
            }

            if (templatesResponse && templatesResponse.next_page) {
                page++;
            } else {
                fetchNextPage = false;
            }
        }
    } catch (e) {
        log.error('Error on template API code: ' + e.message);
    }

    return JSON.stringify({
        api_templates: result
    });
}

module.exports = {
    output: getOutput
};
