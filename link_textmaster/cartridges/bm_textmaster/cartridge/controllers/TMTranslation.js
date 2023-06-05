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
var customCache = require('*/cartridge/scripts/utils/customCacheWebdav');

/**
 * Registration link to TextMaster
 */
function register() {
    var apiConfig = require('*/cartridge/scripts/translation/getAPIConfigurations');
    var config = apiConfig.output();

    if (utils.config.tmApiCache === 'disabled') {
        utils.resetLanguageCache();
    }

    var abilityListCache = customCache.getCache(utils.config.cache.url.languages.abilityList);

    config.ClearCache = abilityListCache !== null;

    ISML.renderTemplate('translation/entertextmaster', config);
}

/**
 * Authentication main page
 * */
function authentication() {
    var code = request.httpParameterMap.get('code').stringValue || '';

    if (code) {
        var saveInput = {
            authCode: code
        };

        var saveAuthData = require('*/cartridge/scripts/translation/tmSaveAuthData');
        saveAuthData.execute(saveInput);
    }

    var apiConfig = require('*/cartridge/scripts/translation/getAPIConfigurations');
    var config = apiConfig.output();
    var authData = customCache.getCache(utils.config.cache.url.authentication);
    var redirectURI = utils.config.api.authentication.redirectURI;

    config.ClientID = authData && authData.clientID ? authData.clientID : '';
    config.ClientSecret = authData && authData.clientSecret ? authData.clientSecret : '';
    config.Token = authData && authData.accessToken ? authData.accessToken : '';
    config.AuthCode = authData && authData.authCode ? authData.authCode : '';
    config.AuthLink = utils.config.api.authentication.authorize;
    config.RedirectURI = redirectURI;
    config.ResponseType = utils.config.api.authentication.responseType;
    config.Scope = utils.config.api.authentication.scope;

    ISML.renderTemplate('translation/authentication', config);
}

/**
 * Check API key and API secret entered in Site Preference
 * @returns {boolean} true or false
 */
function loginCheck() {
    var authData = customCache.getCache(utils.config.cache.url.authentication);

    if (authData && authData.accessToken) {
        return true;
    }

    authentication();

    return false;
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
 * Gets store front URL for review translation, according to item type
 * @param {string} itemType - type of the item for eg: product, category, content assets, folders, Page designer
 * @param {string} targetLangID - to which language the translation needs to be done
 * @returns {string} store URL
 */
function getStoreURL(itemType, targetLangID) {
    var storeLangID = utils.formatLocaleDemandware(utils.formatLocaleStandard(targetLangID));
    var storeURL = 'https://' + Site.current.getHttpsHostName() + '/on/demandware.store/Sites-' + Site.current.ID + '-Site/' + storeLangID;
    var controllerPart = '';
    switch (itemType) {
    case 'product':
        controllerPart = '/Product-Show?pid=';
        break;
    case 'category':
        controllerPart = '/Search-Show?cgid=';
        break;
    case 'content':
    case 'pagedesigner':
    case 'component':
        controllerPart = '/Page-Show?cid=';
        break;
    default:
        controllerPart = '';
    }
    return controllerPart ? (storeURL + controllerPart) : '';
}

/**
 * Documents Dashboard page
 */
function documentsFollowUp() {
    var registered = loginCheck();

    var projectID = request.httpParameterMap.get('projectID').stringValue;
    var name = request.httpParameterMap.get('projName').stringValue;
    var refer = request.httpParameterMap.get('projRef').stringValue;
    var sourceLangID = request.httpParameterMap.get('sourceLang').stringValue;
    var targetLangID = request.httpParameterMap.get('targetLang').stringValue;
    var creationDate = request.httpParameterMap.get('creationDate').stringValue;
    var lastUpdatedDate = request.httpParameterMap.get('lastUpdatedDate').stringValue;
    var itemType = request.httpParameterMap.get('itemType').stringValue;

    var sourceLang = utils.getLocaleName(sourceLangID);
    var targetLang = utils.getLocaleName(targetLangID);
    var storeURL = getStoreURL(itemType, targetLangID);

    if (registered) {
        ISML.renderTemplate('translation/secondarydashboard', {
            projectID: projectID,
            name: name,
            itemType: itemType,
            refer: refer,
            sourceLang: sourceLang,
            targetLang: targetLang,
            storeURL: storeURL,
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
        Items: request.httpParameterMap.get('items').stringValue.split(','),
        ProjectNameType: request.httpParameterMap.get('project-name-type').stringValue,
        ProjectName: request.httpParameterMap.get('project-name').stringValue
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
authentication.public = true;

exports.New = newTranslation;
exports.FollowUp = followUp;
exports.Register = register;
exports.PlaceOrder = placeOrder;
exports.Notification = notification;
exports.DefaultAttributes = defaultAttributes;
exports.LanguageMapping = languageMapping;
exports.DocumentsFollowUp = documentsFollowUp;
exports.Authentication = authentication;
