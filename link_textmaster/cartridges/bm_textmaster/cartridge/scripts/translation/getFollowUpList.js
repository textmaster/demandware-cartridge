'use strict';

/* API Includes */
var Site = require('dw/system/Site');
var Resource = require('dw/web/Resource');

/* Script Includes */
var utils = require('*/cartridge/scripts/utils/tmUtils');

/**
 * Return Projects data to Follow up
 * @param {Object} input - input object
 * @returns {Object} object
 */
function getOutput(input) {
    var projectResult;
    var platformID = Resource.msg('general.sfcc.partner.id.' + utils.config.apiEnv, 'textmaster', null);
    var resultLimit = Site.current.getCustomPreferenceValue('TMDashboardPageSize') || 100;
    resultLimit = isNaN(resultLimit) ? 100 : parseInt(resultLimit, 10);
    var projectPageNumber = input.projectPageNumber ? input.projectPageNumber : 0; // input.projectPageNumber is the project API page number in last dashboard load
    var projectsEndPoint = utils.config.api.get.projects + '?page=' + projectPageNumber + '&per_page=' + resultLimit + '&order=-updated_at&platform_id=' + platformID;
    projectResult = utils.textMasterClient('GET', projectsEndPoint);
    var projects = (projectResult && projectResult.projects) ? projectResult.projects : [];

    for (var proj = 0; proj < projects.length; proj++) {
        var documentsObj = projects[proj].documents_statuses;
        var currencyVal = 0.0;
        var documentsCount = 0;
        var statuskeys = Object.keys(documentsObj);

        if (projects[proj].cost_in_currency) {
            currencyVal = (projects[proj].cost_in_currency.amount).toFixed(2) + ' ' + projects[proj].cost_in_currency.currency;
        }

        for (var index = 0; index < statuskeys.length; index++) {
            documentsCount += documentsObj[statuskeys[index]];
        }

        projects[proj].status = projects[proj].status ? Resource.msg('status.' + projects[proj].status, 'textmaster', null) : '';

        if (projects[proj].status === Resource.msg('status.in_creation', 'textmaster', null)) {
            projects[proj].status = projects[proj].finalized ? Resource.msg('status.in_creation', 'textmaster', null) : Resource.msg('status.counting', 'textmaster', null);
        }

        projects[proj].documentsCount = documentsCount;
        projects[proj].currency = currencyVal;
        projects[proj].localeID = projects[proj].custom_data && projects[proj].custom_data.sfccLanguageTo ? projects[proj].custom_data.sfccLanguageTo : projects[proj].language_to_code;
        projects[proj].locale = utils.getLocaleName(projects[proj].localeID);
    }

    return {
        Projects: projects,
        ShowMore: (projectPageNumber < projectResult.total_pages)
    };
}


/**
 * Return Documents data to Follow up
 * @param {Object} input - input object
 * @returns {Object} object
 */
function getDocsOutput(input) {
    var projectID = input.projectID;
    var resultLimit = Site.current.getCustomPreferenceValue('TMDashboardPageSize') || 100;
    resultLimit = isNaN(resultLimit) ? 100 : parseInt(resultLimit, 10);
    var documentPageNumber = input.documentPageNumber ? input.documentPageNumber : 1;
    var documentEndPoint = utils.config.api.get.project + '/' + projectID + '/' + utils.config.api.get.documents
                           + '?page=' + documentPageNumber + '&per_page=' + resultLimit + '&order=-updated_at';
    var documentResult = utils.textMasterClient('GET', documentEndPoint);
    
    var documents = (documentResult && documentResult.documents) ? documentResult.documents : [];

    for (var doc = 0; doc < documents.length; doc++) {
        documents[doc].status = documents[doc].status ? Resource.msg('status.' + documents[doc].status, 'textmaster', null) : '';

        if (documents[doc].status === Resource.msg('status.in_creation', 'textmaster', null)) {
            documents[doc].status = documents[doc].finalized ? Resource.msg('status.in_creation', 'textmaster', null) : Resource.msg('status.counting', 'textmaster', null);
        }
    }

    return {
        Documents: documents,
        ShowMore: (documentResult && documentResult.total_pages && documentPageNumber < documentResult.total_pages)
    };
}

module.exports = {
    output: getOutput,
    getDocsOutput: getDocsOutput
};
