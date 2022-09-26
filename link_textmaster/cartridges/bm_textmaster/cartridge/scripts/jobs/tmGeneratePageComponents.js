'use strict';

/**
 * Generates Page components list from content library XML
 */
function start() {
    var utils = require('*/cartridge/scripts/utils/tmUtils');
    var pageUtils = require('*/cartridge/scripts/utils/tmPageUtils');
    var pageID;
    var params;
    var items;
    var language;
    var i;
    var languages = utils.config.languageMapping;

    if (languages.length) {
        for (i = 0; i < languages.length; i++) {
            languages[i].id = languages[i].dw;
        }
    } else {
        languages = utils.getDWLanguages();
    }

    var pages = pageUtils.getPageItems();
    var components = require('~/cartridge/scripts/translation/tmGetPageComponentList');

    for (i = 0; i < pages.length; i++) {
        for (var j = 0; j < languages.length; j++) {
            pageID = pages[i].ID;
            language = languages[j].id;
            params = {
                PageID: pageID,
                Language: language
            };
            items = components.output(params);
        }

        pageUtils.setPageComponents(pageID, items);

        for (var k = 0; k < items.length; k++) {
            var itemID = items[k].id;
            var lastModified = {
                lastModified: new Date()
            };
            pageUtils.setPageComponentLastModified(itemID, lastModified);
        }
    }
}

module.exports = {
    execute: start
};
