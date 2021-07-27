/**
 * Controller that provides methods related to PageDesigners Impex features
 *
 * @module  controllers/TMPageDesignersImpex
 */

'use strict';
/* eslint no-unneeded-ternary: 0 */

var server = require('server');

/**
 * check if the content indicated by the pageid is Page object or not
 */
server.get('GetPage', function (req, res, next) {
    var pageID = req.querystring.pageid;
    var PageMgr = require('dw/experience/PageMgr');
    var page = PageMgr.getPage(pageID);
    res.json({
        isPage: page ? true : false,
        name: page ? page.name : '',
        online: page ? page.isVisible() : false,
        description: page ? page.description : '',
        pageDescription: page ? page.pageDescription : '',
        pageKeywords: page ? page.pageKeywords : '',
        pageTitle: page ? page.pageTitle : ''
    });
    next();
});

module.exports = server.exports();
