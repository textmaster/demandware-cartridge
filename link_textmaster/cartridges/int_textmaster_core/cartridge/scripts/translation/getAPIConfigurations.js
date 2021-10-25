'use strict';

/* API Includes */
var Site = require('dw/system/Site');
var Resource = require('dw/web/Resource');

/* Script Includes */
var utils = require('~/cartridge/scripts/utils/tmUtils');

/**
 * Get API configurations
 * @returns {Object} configuration object
 */
function getOutput() {
    var site = Site.current;
    var categories = [];
    var catResponse = utils.textMasterPublic('GET', Resource.msg('api.get.categories', 'textmaster', null));

    if (catResponse && catResponse.categories) {
        categories = catResponse.categories;
    }

    return {
        APIEnv: site.getCustomPreferenceValue('TMAPIEnvironment'),
        APICache: site.getCustomPreferenceValue('TMAPICache'),
        APICategory: site.getCustomPreferenceValue('TMCategoryCode') || '',
        APICatalogID: site.getCustomPreferenceValue('TMMasterCatalogID') || '',
        APICategories: categories,
        TMPageSize: site.getCustomPreferenceValue('TMDashboardPageSize') || 100,
        TMSFpassword: site.getCustomPreferenceValue('TMSFpassword') || '',
        tmApiBaseUrlDemo: site.getCustomPreferenceValue('tmApiBaseUrlDemo') || '',
        tmApiBaseUrlLive: site.getCustomPreferenceValue('tmApiBaseUrlLive') || '',
        tmBackofficeBaseUrlLive: site.getCustomPreferenceValue('tmBackofficeBaseUrlLive') || '',
        tmBackofficeBaseUrlDemo: site.getCustomPreferenceValue('tmBackofficeBaseUrlDemo') || '',
        tmApiVersionUrlDemo: site.getCustomPreferenceValue('tmApiVersionUrlDemo') || '',
        tmApiVersionUrlLive: site.getCustomPreferenceValue('tmApiVersionUrlLive') || '',
        tmLanguageMapping: site.getCustomPreferenceValue('tmLanguageMapping')
    };
}

module.exports = {
    output: getOutput
};
