'use strict';

/* API Includes */
var Resource = require('dw/web/Resource');
var Site = require('dw/system/Site');

/* Script Modules */
var logUtils = require('*/cartridge/scripts/utils/tmLogUtils');
var utils = require('*/cartridge/scripts/utils/tmUtils');

var log = logUtils.getLogger('AskForQuote');

/**
 * Returns Mail object with Information about the Project.
 * @param {Object} tmProject - TM project object
 * @returns {Object} Mail object with Information about the Project.
 */
function execute(tmProject) {
    var projectID = tmProject.custom.projectid;
    var projectEndPoint = utils.config.api.get.project + '/' + projectID;
    var projectResult = utils.textMasterClient('GET', projectEndPoint);
    var linkBase = utils.config.apiEnv === 'live' ? utils.config.tmBackofficeBaseUrlLive : utils.config.tmBackofficeBaseUrlDemo;
    var mail = null;
    var mContent = {};
    var projectOptions = {};
    var updateRequest;
    var costs = 0;
    var currency = '';
    var wordCount = 0;

    if (projectResult != null) {
        var userEndPoint = Resource.msg('api.get.user', 'textmaster', null);
        var userResult = utils.textMasterClient('GET', userEndPoint);

        if (projectResult.total_costs != null && projectResult.total_costs[0] != null) {
            costs = projectResult.total_costs[0].amount;
            currency = projectResult.total_costs[0].currency;
        }

        wordCount = projectResult.total_word_count;
        projectOptions = projectResult.options;
        projectOptions.translation_memory = true;

        // update project to add translation_memory: true
        updateRequest = {
            project: {
                options: projectOptions
            }
        };

        projectEndPoint = utils.config.api.get.project + '/' + projectID;
        projectResult = utils.textMasterClient('PUT', projectEndPoint, JSON.stringify(updateRequest));

        mail = {};

        if (projectResult) {
            mail.from = Site.getCurrent().getCustomPreferenceValue('TMEmail') || '';
            mail.to = userResult.email;
            mail.subject = 'TextMaster: Quotation for ' + projectResult.name;
            mContent.text = 'Project ' + projectResult.name + ' (' + projectID + ') will cost you ' +
                costs.toFixed(2) + currency +
                '. Please go to link ' + linkBase + Resource.msg('link.clients', 'textmaster', null) + Resource.msg('link.list.projects', 'textmaster', null) + '/' +
                projectResult.id + '/edit to check your project and launch it.';
            mContent.firstName = userResult.contact_information.first_name;
            mContent.wordCount = wordCount; // total_word_count before updating the project
            mContent.weightedWordCount = projectResult.total_word_count;

            mail.content = mContent;
        } else {
            log.error('PUT ' + projectEndPoint + ' throws error on request: ' + JSON.stringify(updateRequest));
        }
    }

    return mail;
}

module.exports = {
    execute: execute
};
