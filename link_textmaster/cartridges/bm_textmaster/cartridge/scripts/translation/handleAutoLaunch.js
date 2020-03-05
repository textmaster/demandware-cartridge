'use strict';

/* API Includes */
var Site = require('dw/system/Site');
var System = require('dw/system/System');
var Resource = require('dw/web/Resource');

/* Script Includes */
var utils = require('*/cartridge/scripts/utils/tmUtils');

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

    if (autoLaunch.toLowerCase() === 'false') {
        utils.triggerURL('POST', 'https://' + sfProtectionURLpart + System.instanceHostname + '/on/demandware.store/Sites-' + Site.current.ID + '-Site/default/TMQuote-Send?projectid=' + projectID);
    } else {
        /* AutoLaunch is handled by autoLaunch job when all finalisation calls back are received.
           Autolaunch job is triggered on autolaunch call back controller logic. */
    }

    return {
        status: 'success'
    };
}

module.exports = {
    output: getOutput
};
