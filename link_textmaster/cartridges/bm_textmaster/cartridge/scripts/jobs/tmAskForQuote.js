'use strict';

/**
 * gets the render html for the given isml template
 * @param {Object} templateContext - object that will fill template placeholders
 * @param {string} templateName - the name of the isml template to render.
 * @returns {string} the rendered isml.
 */
function getRenderedHtml(templateContext, templateName) {
    var HashMap = require('dw/util/HashMap');
    var Template = require('dw/util/Template');

    var context = new HashMap();

    Object.keys(templateContext).forEach(function (key) {
        context.put(key, templateContext[key]);
    });

    var template = new Template(templateName);
    return template.render(context).text;
}

/**
 * Send a mail
 * @param {string} mailTo - recipient email address
 * @param {string} mailForm -sender email address
 * @param {string} mailSubject - mail subject
 * @param {Object} mailContent - mail content
 * @param {string} mailTemplate - template name
 */
function sendMail(mailTo, mailForm, mailSubject, mailContent, mailTemplate) {
    var Mail = require('dw/net/Mail');

    if (mailTo && mailForm && mailSubject && mailContent && mailTemplate) {
        var email = new Mail();

        email.addTo(mailTo);
        email.setSubject(mailSubject);
        email.setFrom(mailForm);
        email.setContent(getRenderedHtml(mailContent, mailTemplate), 'text/html', 'UTF-8');
        email.send();
    }
}

/**
 * This script excecutes the job for sending a mail about the information of a project
 */
function askForQuote() {
    var Transaction = require('dw/system/Transaction');
    var CustomObjectMgr = require('dw/object/CustomObjectMgr');
    var getProjects = require('~/cartridge/scripts/translation/getProjects');
    var getProjectForMail = require('~/cartridge/scripts/translation/getProjectForMail');
    var tmProjects = getProjects.execute();

    for (var proj = 0; proj < tmProjects.length; proj++) {
        var project = tmProjects[proj];
        var mailInfos = getProjectForMail.execute(project);

        if (mailInfos != null) {
            var mailTo = mailInfos.to;
            var mailForm = mailInfos.from;
            var mailSubject = mailInfos.subject;
            var mailContent = { MailInfos: mailInfos };
            var mailTemplate = 'mail/projectinfo';
            sendMail(mailTo, mailForm, mailSubject, mailContent, mailTemplate);
        }

        Transaction.begin();
        CustomObjectMgr.remove(project);
        Transaction.commit();
    }
}

module.exports = {
    execute: askForQuote
};
