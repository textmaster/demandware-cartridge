'use strict';

/* API Includes */
var Site = require('dw/system/Site');
var Transaction = require('dw/system/Transaction');

/**
 * Set API configurations
 * @param {Object} input - input object
 * @returns {boolean} true or false
 */
function getOutput(input) {
    var site = Site.current;
    Transaction.begin();
    site.setCustomPreferenceValue('TMCategoryCode', input.APICategory);
    site.setCustomPreferenceValue('TMMasterCatalogID', input.APICatalogID);
    site.setCustomPreferenceValue('TMAPIEnvironment', input.APIEnv);
    site.setCustomPreferenceValue('TMAPICache', input.APICache);
    site.setCustomPreferenceValue('TMDashboardPageSize', input.TMPageSize);
    site.setCustomPreferenceValue('tmApiBaseUrlDemo', input.tmApiBaseUrlDemo);
    site.setCustomPreferenceValue('tmApiBaseUrlLive', input.tmApiBaseUrlLive);
    site.setCustomPreferenceValue('tmBackofficeBaseUrlLive', input.tmBackofficeBaseUrlLive);
    site.setCustomPreferenceValue('tmBackofficeBaseUrlDemo', input.tmBackofficeBaseUrlDemo);
    site.setCustomPreferenceValue('tmApiVersionUrlLive', input.tmApiVersionUrlLive);
    site.setCustomPreferenceValue('tmApiVersionUrlDemo', input.tmApiVersionUrlDemo);
    site.setCustomPreferenceValue('tmExternalAliasHostName', input.tmExternalAliasHostName);

    if (Site.current.status === Site.SITE_STATUS_PROTECTED) {
        site.setCustomPreferenceValue('TMSFpassword', input.TMSFpassword);
    }

    Transaction.commit();

    return true;
}

module.exports = {
    output: getOutput
};
