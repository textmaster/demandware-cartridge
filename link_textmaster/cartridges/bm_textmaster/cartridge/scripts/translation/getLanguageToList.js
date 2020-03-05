'use strict';

/* Script Includes */
var utils = require('*/cartridge/scripts/utils/tmUtils');

/**
 * Get 'Language to' list
 * @param {Object} input - input object
 * @returns {Array} Language To list
 */
function getOutput(input) {
    var languageFrom = input.LanguageFrom;
    var languageTo = utils.getLanguageTo(languageFrom);

    return {
        LanguageToList: languageTo
    };
}

module.exports = {
    output: getOutput
};
