'use strict';

/* API Includes */
var Site = require('dw/system/Site');
var Resource = require('dw/web/Resource');
var URLAction = require('dw/web/URLAction');
var URLParameter = require('dw/web/URLParameter');
var URLUtils = require('dw/web/URLUtils');

/* Script Includes */
var logUtils = require('*/cartridge/scripts/utils/tmLogUtils');
var utils = require('*/cartridge/scripts/utils/tmUtils');

var log = logUtils.getLogger('getFollowUpList');

/**
 * Prepare single document result object for dashboard
 * @param {Object} document - document details
 * @param {Object} project - project details
 * @returns {Object} object of action details
 */
function getDocumentResult(document, project) {
    var doc = document;
    doc.project_name = project.name;
    doc.project_launch_date = project.launched_at ? (project.launched_at.year || '') + '-' + (project.launched_at.month || '') + '-' + (project.launched_at.day || '') : '';
    doc.item_type = project.custom_data.itemType;
    doc.locale = utils.getLocaleName(project.custom_data && project.custom_data.sfccLanguageTo ? project.custom_data.sfccLanguageTo : project.language_to_code);
    var actions = [];
    var linkBase = utils.config.apiEnv === 'live' ? utils.config.tmBackofficeBaseUrlLive : utils.config.tmBackofficeBaseUrlDemo;
    var itemPipeline;
    var itemIDLabel;

    switch (doc.status.toLowerCase()) { // eslint-disable-line default-case
    case 'in_creation':
        actions.push({
            text: Resource.msg('follow.action.view.project', 'textmaster', null),
            link: linkBase + Resource.msg('link.clients', 'textmaster', null) + Resource.msgf('link.view.project', 'textmaster', null, project.id)
        });
        break;
    case 'in_progress':
    case 'waiting_assignment':
    case 'quality_control':
        actions.push({
            text: Resource.msg('follow.action.view.document', 'textmaster', null),
            link: linkBase + Resource.msg('link.clients', 'textmaster', null) + Resource.msgf('link.view.document', 'textmaster', null, project.id, doc.id)
        });
        break;
    case 'in_review':
        if (doc.item_type) {
            switch (doc.item_type.toLowerCase()) { // eslint-disable-line default-case
            case 'product':
                itemPipeline = 'Product-Show';
                itemIDLabel = 'pid';
                break;
            case 'category':
                itemPipeline = 'Search-Show';
                itemIDLabel = 'cgid';
                break;
            case 'content':
                itemPipeline = 'Page-Show';
                itemIDLabel = 'cid';
                break;
            }
            var languageID = utils.toDemandwareLocaleID(project.language_to_code);
            languageID = languageID.replace('-', '_');
            var urlAction = new URLAction(itemPipeline, Site.current.ID, languageID);
            var urlparam = new URLParameter(itemIDLabel, doc.custom_data.item.id);
            var itemURL = URLUtils.abs(urlAction, urlparam).toString();

            actions.push({
                text: Resource.msg('follow.action.revision', 'textmaster', null),
                link: itemURL
            });
            actions.push({
                text: Resource.msg('follow.action.view.document', 'textmaster', null),
                link: linkBase + Resource.msg('link.clients', 'textmaster', null) + Resource.msgf('link.view.document', 'textmaster', null, project.id, doc.id)
            });
        } else {
            log.error('"project.custom_data.itemType" is not found for project id: ' + project.id);
        }
        break;
    case 'incomplete':
        actions.push({
            text: Resource.msg('follow.action.communicate.translator', 'textmaster', null),
            link: linkBase + Resource.msg('link.clients', 'textmaster', null) + Resource.msgf('link.view.document', 'textmaster', null, project.id, doc.id)
        });
        break;
    }

    doc.actions = actions;

    return doc;
}

/**
 * Return Projects data to Follow up
 * @param {Object} input - input object
 * @returns {Object} object
 */
function getOutput(input) {
    var projectResult;
    var projectPageSize = 50;
    var documentResult;
    var documents = [];
    var docLoopCount;
    var docPageNumber;
    var docCountInPage;
    var docCountCurrProj;

    var platformID = Resource.msg('general.sfcc.partner.id.' + utils.config.apiEnv, 'textmaster', null);
    var resultLimit = Site.current.getCustomPreferenceValue('TMDashboardPageSize') || 100;
    resultLimit = isNaN(resultLimit) ? 100 : parseInt(resultLimit, 10);
    var projectRequestFlag = true;
    var projectPageNumber = input.projectPageNumber ? (input.projectPageNumber - 1) : 0; // input.projectPageNumber is the project API page number in last dashboard load
    var projectCountInPage = input.projectCountInPage || 0; // input.projectCountInPage is the project count in project API page in last dashboard load
    var projectCount = (projectPageNumber * projectPageSize) + projectCountInPage; // projectCount is the total number of project loaded so far

    while (projectRequestFlag) {
        projectPageNumber++;
        var projectsEndPoint = utils.config.api.get.projects + '?page=' + projectPageNumber + '&per_page=' + projectPageSize + '&order=-created_at&platform_id=' + platformID;
        projectResult = utils.textMasterClient('GET', projectsEndPoint);
        var projects = (projectResult && projectResult.projects) ? projectResult.projects : [];
        var projectLoopCount = 0;

        for (var proj = 0; proj < projects.length; proj++) {
            var project = projects[proj];
            var docRequestFlag = true;
            projectLoopCount++;

            if (projectLoopCount < projectCountInPage) { // skip all the projects already shown in this API page of last dashboard load
                continue; // eslint-disable-line no-continue
            }

            projectCount++;

            if (projectLoopCount === projectCountInPage) { // if loop reached the same project as last project shown in last dashboard load
                docPageNumber = input.docPageNumber ? (input.docPageNumber - 1) : 0;
                docCountInPage = input.docCountInPage || 0;
                docCountCurrProj = (docPageNumber * resultLimit) + docCountInPage;
            } else {
                docPageNumber = 0;
                docCountInPage = 0;
                docCountCurrProj = 0;
            }

            while (docRequestFlag) {
                docPageNumber++;
                var documentEndPoint = utils.config.api.get.project + '/' + project.id + '/' + utils.config.api.get.documents +
                    '?page=' + docPageNumber + '&per_page=' + resultLimit + '&order=-created_at';
                documentResult = utils.textMasterClient('GET', documentEndPoint);
                docLoopCount = 0;

                if (documentResult && documentResult.documents) {
                    for (var docIndex = 0; docIndex < documentResult.documents.length; docIndex++) {
                        var document = documentResult.documents[docIndex];
                        docLoopCount++;

                        if (projectLoopCount === projectCountInPage && docPageNumber === input.docPageNumber && docLoopCount <= docCountInPage) {
                            // skip all the documents already shown in this API page of last dashboard load
                            continue; // eslint-disable-line no-continue
                        }

                        docCountCurrProj++;

                        var doc = getDocumentResult(document, project);
                        documents.push(doc);

                        if (documents.length >= resultLimit) {
                            // stop the document loop
                            docRequestFlag = false;
                            break;
                        }
                    }

                    docCountInPage = docLoopCount;
                }

                if (documents.length >= resultLimit || docCountCurrProj >= documentResult.count) {
                    // stop the document loop
                    docRequestFlag = false;
                }
            }

            if (documents.length >= resultLimit) {
                // stop the project loop
                projectRequestFlag = false;
                break;
            }
        }

        projectCountInPage = projectLoopCount;

        if (documents.length >= resultLimit || projectCount >= projectResult.count) {
            // stop the project loop
            projectRequestFlag = false;
        }
    }

    return {
        Documents: documents,
        ProjectPageNumber: projectPageNumber,
        DocPageNumber: docPageNumber,
        ProjectCountInPage: projectCountInPage,
        DocCountInPage: docCountInPage,
        ShowMore: (projectCount < projectResult.count || (projectCount === projectResult.count && docCountCurrProj < documentResult.count))
    };
}

module.exports = {
    output: getOutput
};
