/**
 * Gets language mapping site preference value and add language name to it to show on mapping page
 *
 * @module cartridge/scripts/translation/getLanguageMapping
 */

'use strict';

/* Script Includess */
var logUtils = require('~/cartridge/scripts/utils/tmLogUtils');
var utils = require('~/cartridge/scripts/utils/tmUtils');

var log = logUtils.getLogger('getLanguageMapping');

/**
 * Add language name to mapping to display on mapping page table
 * @returns {Object} language mapping with language names
 */
function getData() {
    var apiConfig = require('~/cartridge/scripts/translation/getAPIConfigurations');
    var config = apiConfig.output();
    var languageMappingStr = config.tmLanguageMapping || '[]';
    var languageMapping = [];

    try {
        languageMapping = JSON.parse(languageMappingStr);
    } catch (e) {
        log.error('Error to get language mapping list :' + e.message);
    }

    for (var i = 0; i < languageMapping.length; i++) {
        languageMapping[i].dwName = utils.getLocaleName(languageMapping[i].dw);
        languageMapping[i].tmName = utils.getTMLocaleName(languageMapping[i].tm);
        languageMapping[i].enabled = utils.isLocaleEnabled(languageMapping[i].dw);
    }

    return languageMapping;
}
module.exports = {
    data: getData()
};
