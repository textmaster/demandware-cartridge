'use strict';

/**
 * Controller that provides user interface for all pages
 * @module controllers/TMTranslation
 */

/* global request */

/* API Includes */
var ISML = require('dw/template/ISML');
var Site = require('dw/system/Site');

/* Script Modules */
var utils = require('*/cartridge/scripts/utils/tmUtils');

/**
 * Registration link to TextMaster
 */
function register() {
    var apiConfig = require('*/cartridge/scripts/translation/getAPIConfigurations');
    var config = apiConfig.output();
    var customCache = require('*/cartridge/scripts/utils/customCacheWebdav');

    if (utils.config.tmApiCache === 'disabled') {
        utils.resetLanguageCache();
    }

    var abilityListCache = customCache.getCache(utils.config.cache.url.languages.abilityList);

    config.ClearCache = abilityListCache !== null;

    ISML.renderTemplate('translation/entertextmaster', config);
}

/**
 * Check API key and API secret entered in Site Preference
 * @returns {boolean} true or false
 */
function loginCheck() {
    var APIKey = Site.current.getCustomPreferenceValue('TMApiKey') || '';
    var APISecret = Site.current.getCustomPreferenceValue('TMApiSecret') || '';

    if (APIKey === '' || APISecret === '') {
        register();

        return false;
    }

    return true;
}

/**
 * Form to show filter options for translation
 */
function newTranslation() {
    var registered = loginCheck();

    if (registered) {
        var languages = utils.getLanguageFromList();
        ISML.renderTemplate('translation/filtertranslationitems', { languages: languages });
    }
}

/**
 * Dashboard page
 */
function followUp() {
    var registered = loginCheck();

    if (registered) {
        ISML.renderTemplate('translation/followupontranslation');
    }
}

/**
 * Documents Dashboard page
 */
function documentsFollowUp() {
    var registered = loginCheck();

    var id = request.httpParameterMap.get('projectID').stringValue;
    var name = request.httpParameterMap.get('projName').stringValue;
    var refer = request.httpParameterMap.get('projRef').stringValue;
    var sourceLangID = request.httpParameterMap.get('sourceLang').stringValue;
    var targetLangID = request.httpParameterMap.get('targetLang').stringValue;
    var creationDate = request.httpParameterMap.get('creationDate').stringValue;
    var lastUpdatedDate = request.httpParameterMap.get('lastUpdatedDate').stringValue;

    var sourceLang = utils.getLocaleName(sourceLangID);
    var targetLang = utils.getLocaleName(targetLangID);

    if (registered) {
        ISML.renderTemplate('translation/secondarydashboard', {
            id: id,
            name: name,
            refer: refer,
            sourceLang: sourceLang,
            targetLang: targetLang,
            creationDate: creationDate,
            lastUpdatedDate: lastUpdatedDate,
            utils: utils
        });
    }
}

/**
 * function 'newTranslation' posts data to this function
 */
function placeOrder() {
    var localeFrom = request.httpParameterMap.get('locale-from').stringValue;
    var mappedLanguageFrom = utils.getMappedLanguage(localeFrom);
    mappedLanguageFrom = mappedLanguageFrom ? mappedLanguageFrom : localeFrom; // eslint-disable-line no-unneeded-ternary
    var localeToArray = request.httpParameterMap.get('locale-to[]').values.toArray();
    var languageMap = utils.config.languageMapping;
    var localeTo;
    var tempLocale = [];

    for (var locale = 0; locale < localeToArray.length; locale++) {
        for (var mapLang = 0; mapLang < languageMap.length; mapLang++) {
            if (localeToArray[locale] === languageMap[mapLang].dw) {
                localeTo = languageMap[mapLang].tm;
            }
        }
        if (localeTo !== undefined) {
            tempLocale.push(localeTo);
        } else {
            tempLocale.push(localeToArray[locale]);
        }
    }

    var mappedLanguageTo = tempLocale;
    var input = {
        LocaleFrom: request.httpParameterMap.get('locale-from').stringValue,
        MappedLocaleFrom: mappedLanguageFrom,
        ItemType: request.httpParameterMap.get('item-type').stringValue,
        LocaleTo: request.httpParameterMap.get('locale-to[]').values.toArray(),
        MappedLocaleTo: mappedLanguageTo,
        Attributes: request.httpParameterMap.get('attribute[]').values.toArray(),
        Items: request.httpParameterMap.get('items').stringValue.split(',')
    };
    var transParams = require('~/cartridge/scripts/translation/setupTranslationParameters');

    var output = transParams.output(input);

    ISML.renderTemplate('translation/placeorder', {
        TransParams: output,
        Utils: utils
    });
}

/**
 * Notification page on project creation
 */
function notification() {
    var currentBaseURL = utils.config.apiEnv === 'live' ? utils.config.tmBackofficeBaseUrlLive : utils.config.tmBackofficeBaseUrlDemo;
    var input = {
        autoLaunchCount: request.httpParameterMap.get('autoLaunchCount').intValue,
        noAutoLaunchCount: request.httpParameterMap.get('noAutoLaunchCount').intValue,
        projectID: request.httpParameterMap.get('projectID').stringValue,
        currentBaseURL: currentBaseURL
    };

    ISML.renderTemplate('translation/notification', input);
}

/**
 * Default attributes settings
 */
function defaultAttributes() {
    ISML.renderTemplate('translation/defaultattributessettings');
}

/**
 * Language mapping main page
 * */
function languageMapping() {
    var languageMap = require('*/cartridge/scripts/translation/getLanguageMapping');
    ISML.renderTemplate('translation/languagemapping', {
        languageMapping: languageMap.data
    });
}

/*
 * Web exposed methods
 */
newTranslation.public = true;
followUp.public = true;
register.public = true;
placeOrder.public = true;
notification.public = true;
defaultAttributes.public = true;
languageMapping.public = true;
documentsFollowUp.public = true;

exports.New = newTranslation;
exports.FollowUp = followUp;
exports.Register = register;
exports.PlaceOrder = placeOrder;
exports.Notification = notification;
exports.DefaultAttributes = defaultAttributes;
exports.LanguageMapping = languageMapping;
exports.DocumentsFollowUp = documentsFollowUp;
