'use strict';

/* API Includes */
var Site = require('dw/system/Site');
var System = require('dw/system/System');
var Resource = require('dw/web/Resource');

/* Script Includes */
var logUtils = require('*/cartridge/scripts/utils/tmLogUtils');
var utils = require('*/cartridge/scripts/utils/tmUtils');

var log = logUtils.getLogger('autoLaunch');

/**
 * Handle auto launch or send quote
 * @param {Object} input - input object
 * @returns {Object} status
 */
function getOutput(input) {
    var projectID = input.ProjectID;
    var autoLaunch = input.AutoLaunch;
    var tmSFpassword = Site.getCurrent().getCustomPreferenceValue('TMSFpassword') || '';
    var sfProtectionURLpart = (Site.current.status === Site.SITE_STATUS_PROTECTED) ? (Resource.msg('storefront.username', 'textmaster', null) + ':' + tmSFpassword + '@') : '';

    if (autoLaunch.toLowerCase() === 'true') {
        log.debug('Auto launched Project ID: ' + projectID);
        var projectEndPoint = utils.config.api.get.project + '/' + projectID + '/' + Resource.msg('api.projects.finalize', 'textmaster', null);
        utils.textMasterClient('PUT', projectEndPoint, JSON.stringify({}));
    } else {
        log.debug('Sending quote for Project ID: ' + projectID);
        utils.triggerURL('POST', 'https://' + sfProtectionURLpart + System.instanceHostname + '/on/demandware.store/Sites-' + Site.current.ID + '-Site/default/TMQuote-Send?projectid=' + projectID);
    }

    return {
        status: 'success'
    };
}

module.exports = {
    output: getOutput
};
