/**
 * Controller that provides methods related to PageDesigners Impex features
 *
 * @module  controllers/TMPageDesignersImpex
 */

'use strict';

/* global request */
/* eslint no-unneeded-ternary: 0 */

var guard = require('*/cartridge/scripts/guard');

/**
 * check if the content indicated by the pageid is Page object or not
 */
function getPage() {
    var pageID = request.httpParameterMap.pageid.stringValue;
    var PageMgr = require('dw/experience/PageMgr');
    var r = require('*/cartridge/scripts/util/Response');
    var page = PageMgr.getPage(pageID);
    r.renderJSON({
        isPage: page ? true : false,
        name: page ? page.name : '',
        online: page ? page.isVisible() : false,
        description: page ? page.description : '',
        pageDescription: page ? page.pageDescription : '',
        pageKeywords: page ? page.pageKeywords : '',
        pageTitle: page ? page.pageTitle : ''
    });
}

exports.GetPage = guard.ensure(['https', 'get'], getPage);
