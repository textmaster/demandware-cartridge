'use strict';

/*
 *    Utility functions for the cartridge
 */

/* eslint-disable no-param-reassign */
/* eslint-disable new-cap */
/* eslint-disable no-unneeded-ternary */
/* eslint-disable no-nested-ternary */
/* eslint-disable no-undef */
/* eslint-disable no-restricted-syntax */
/* eslint-disable guard-for-in */
/* eslint-disable default-case */


/* API Includes */
var Site = require('dw/system/Site');
var System = require('dw/system/System');
var Transaction = require('dw/system/Transaction');
var Resource = require('dw/web/Resource');
var LocalServiceRegistry = require('dw/svc/LocalServiceRegistry');
var CustomObjectMgr = require('dw/object/CustomObjectMgr');
var StringUtils = require('dw/util/StringUtils');
var ProductMgr = require('dw/catalog/ProductMgr');
var CatalogMgr = require('dw/catalog/CatalogMgr');
var ContentMgr = require('dw/content/ContentMgr');
var URLAction = require('dw/web/URLAction');
var URLUtils = require('dw/web/URLUtils');

/* Script Includes */
var customCache = require('./customCacheWebdav');
var pageUtils = require('*/cartridge/scripts/utils/tmPageUtils');
var LogUtils = require('*/cartridge/scripts/utils/tmLogUtils');

// Global Variables
var Utils = {};

Utils.log = LogUtils.getLogger('tmUtils');

/**
 * Accessible attributes of Content
 */
Utils.attributes = {};
Utils.attributes.content = [
    'name', 'description', 'pageTitle', 'pageDescription', 'pageKeywords', 'pageURL'
];

/**
 * Accessible attributes of Category
 */
Utils.attributes.category = [
    'displayName', 'description', 'pageTitle', 'pageDescription', 'pageKeywords', 'pageURL'
];

/*
 *    Accessible attributes of Product
 */
Utils.attributes.product = [
    'name', 'shortDescription', 'longDescription', 'pageTitle', 'pageDescription', 'pageKeywords', 'pageURL'
];

Utils.attributes.folder = [
    'displayName', 'description', 'pageDescription', 'pageKeywords', 'pageTitle', 'pageURL'
];

/**
 * Common configurations
 */
Utils.config = {
    apiEnv: Site.current.getCustomPreferenceValue('TMAPIEnvironment') || 'demo',
    tmBackofficeBaseUrlLive: Site.current.getCustomPreferenceValue('tmBackofficeBaseUrlLive') || 'live',
    tmBackofficeBaseUrlDemo: Site.current.getCustomPreferenceValue('tmBackofficeBaseUrlDemo') || 'demo',
    tmExternalAliasHostName: Site.current.getCustomPreferenceValue('tmExternalAliasHostName') || '',
    tmApiBaseUrlDemo: Site.current.getCustomPreferenceValue('tmApiBaseUrlDemo') || '',
    tmApiBaseUrlLive: Site.current.getCustomPreferenceValue('tmApiBaseUrlLive') || '',
    tmApiVersionUrlLive: Site.current.getCustomPreferenceValue('tmApiVersionUrlLive') || '',
    tmApiVersionUrlDemo: Site.current.getCustomPreferenceValue('tmApiVersionUrlDemo') || '',
    tmApiCache: Site.current.getCustomPreferenceValue('TMAPICache') || 'disabled',
    languageMapping: Site.current.getCustomPreferenceValue('tmLanguageMapping') ? JSON.parse(Site.current.getCustomPreferenceValue('tmLanguageMapping')) : [],
    demandwareLanguages: [],
    dummyTestTranslationValue: '[translated] ',
    cache: {
        url: {
            languages: {
                fromList: '/{site_id}/languages/fromList',
                translation: '/{site_id}/languages/translation',
                abilityList: '/{site_id}/languages/abilityList'
            },
            authentication: '/authentication',
            masterProducts: '/master-products'
        }
    },
    quote: {
        coName: 'TMQuoteDataHolder',
        jobName: 'TextMasterAskForQuote'
    },
    ocapi: {
        jobs: {
            post: '/dw/data/v20_2/jobs/{0}/executions'
        },
        demo: {
            id: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
            password: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
        },
        token: {
            post: 'https://account.demandware.com/dw/oauth2/access_token?grant_type=client_credentials'
        }
    },
    importData: {
        customObject: {
            name: 'TMImportDataHolder',
            instanceid: 'TMImportDataHolder1'
        },
        jobName: 'TextMasterImportData',
        parameterError: 'Parameters projectid and documentid are required in URL',
        successMessage: 'Project import started',
        errorMessage: 'Some error occured. Please refer log file to get more details'
    },
    failedImportData: {
        customObject: {
            name: 'TMFailedImportDataHolder',
            instanceid: 'TMFailedImportDataHolder1'
        }
    },
    checkImportStatus: {
        customObject: {
            name: 'TMCheckImportStatusHolder',
            instanceid: 'TMCheckImportStatusHolder1'
        }
    },
    api: {
        get: {
            projects: 'projects/filter',
            project: 'projects',
            documents: 'documents/filter',
            document: 'documents'
        },
        authentication: {
            redirectURI: 'https://{0}/on/demandware.store/Sites-Site/default/TMTranslation-Authentication',
            authorize: 'oauth/authorize',
            scope: 'project:manage user:manage',
            responseType: 'code',
            token: 'oauth/token',
            accessGrantType: 'authorization_code',
            refreshGrantType: 'refresh_token'
        }
    },
    pageDesigner: {
        xmlName: 'TextMasterExportContent.xml'
    },
    masterProducts: {
        coName: 'TMMasterProducts',
        jobName: 'TextMasterProductCache',
        xmlName: 'TextMasterExportMasterCatalog.xml'
    }
};

/**
 * Product types
 */
Utils.productTypes = {
    variant: 'Variation Product',
    master: 'Variation Master',
    bundle: 'Product Bundle',
    bundled: 'Bundled Product',
    optionProduct: 'Option Product',
    productSet: 'Product Set',
    productSetProduct: 'Product Set Product',
    variationGroup: 'Variation Group',
    product: 'Simple Product'
};

/**
 * Get product type string
 * @param {Object} product - product object
 * @returns {string} product type
 */
Utils.getProductType = function (product) {
    var productType = '';

    for (var pt in Utils.productTypes) {
        if (product[pt]) {
            productType = Utils.productTypes[pt];
            break;
        }
    }

    return productType;
};

/**
 * Checks whether the attribute is accessible or not
 * @param {string} itemType - item type
 * @param {string} attribute - attribute id
 * @returns {string} attributes string
 */
Utils.isAttributeAccessible = function (itemType, attribute) {
    var attrList = Utils.attributes[itemType];
    return attrList.indexOf(attribute) > -1;
};

/**
 * Gets folder path from absolute path of file
 * @param {string} absPath - absolute folder path
 * @returns {string} folder path
 */
Utils.getFolderPath = function (absPath) {
    var folderPath = '';
    if (absPath) {
        folderPath = absPath.substring(0, absPath.lastIndexOf(File.SEPARATOR) + 1);
    }
    return folderPath;
};

/**
 * Gets filename part without extension
 * @param {string} fileName - file name
 * @returns {string} file name part
 */
Utils.getFileNameNoExt = function (fileName) {
    var fileNamePart = '';
    if (fileName) {
        fileNamePart = fileName.substring(0, fileName.lastIndexOf('.'));
    }
    return fileNamePart;
};

/**
 * Gets filename extension
 * @param {string} fileName - file name
 * @returns {string} file extension
 */
Utils.getFileNameExtension = function (fileName) {
    var fileNameExtension = '';
    if (fileName) {
        fileNameExtension = fileName.substring(fileName.lastIndexOf('.') + 1);
    }
    return fileNameExtension;
};

/**
 * Gets Demandware languages in JSON
 * @returns {Array} language array
 */
Utils.getDWLanguages = function () {
    var languages = [];

    if (Utils.config.demandwareLanguages.length) {
        languages = Utils.config.demandwareLanguages;
    } else {
        var ocapiLocaleUrl = Resource.msg('ocapi.locale.get', 'textmaster', null);
        var locale = Utils.ocapiClient('GET', ocapiLocaleUrl, null);
        var totalCount = locale.total;
        var ocapiAllLocaleUrl = Resource.msg('ocapi.all.locale.get', 'textmaster', null) + totalCount;
        var locales = Utils.ocapiClient('GET', ocapiAllLocaleUrl, null);

        if (locales && locales.hits) {
            for (var i = 0; i < locales.hits.length; i++) {
                var lang = locales.hits[i];
                if (lang.id !== 'default') {
                    languages.push({
                        id: lang.id.toLowerCase(),
                        name: lang.name
                    });
                }
            }
        }

        if (languages.length) {
            Utils.config.demandwareLanguages = languages;
        }
    }

    return languages;
};

/**
 * Checks if the locale is enabled in store
 * @param {string} localeID - locale id
 * @returns {boolean} true or false
 */
Utils.isLocaleEnabled = function (localeID) {
    var allLocales = Site.current.allowedLocales;

    localeID = Utils.formatLocaleDemandware(localeID);
    var index = allLocales.indexOf(localeID);

    return index > -1;
};

/**
 * Format the locale string in to Demandware import standard, Eg:- fr_FR
 * @param {string} localeID - locale id
 * @returns {string} formated locale id
 */
Utils.formatLocaleDemandware = function (localeID) {
    localeID = Utils.formatLocaleStandard(localeID);
    localeID = localeID.replace(/-/g, '_');
    return localeID;
};

/*
 *    Converts Datawords locale ID format (eg:- en-us) to Demandware locale ID format (eg:- en-US)
 */
Utils.formatLocaleStandard = function (locale) {
    var localePart = locale.split('-');

    locale = localePart[0];

    if (localePart[1] !== undefined) {
        locale += ('-' + localePart[1].toUpperCase());
    }

    return locale;
};

/**
 * Gets Translation Languages - common languages in Demandware and TextMaster
 * @returns {Array} languages array
 */
Utils.getTranslationLanguages = function () {
    var translationLanguageCache = customCache.getCache(Utils.config.cache.url.languages.translation.replace('{site_id}', Site.current.ID));
    var mappedLanguage;

    if (translationLanguageCache) {
        return translationLanguageCache;
    }

    var dwLanguages = Utils.getDWLanguages();
    var languages = [];

    var tmLanguages = Utils.getTextMasterLanguages();

    for (var i = 0; i < tmLanguages.length; i++) {
        for (var j = 0; j < dwLanguages.length; j++) {
            mappedLanguage = Utils.getMappedLanguage(dwLanguages[j].id);

            if (tmLanguages[i].code === dwLanguages[j].id || tmLanguages[i].code === mappedLanguage) {
                languages.push(dwLanguages[j]);
            }
        }
    }

    languages.sort(function (a, b) {
        return a.name < b.name ? -1 : 1;
    });

    translationLanguageCache = languages;
    customCache.setCache(Utils.config.cache.url.languages.translation.replace('{site_id}', Site.current.ID), translationLanguageCache);

    return languages;
};

/**
 * Get TextMaster languages from API
 * @returns {Array} textmaster languages array
 */
Utils.getTextMasterLanguages = function () {
    var tmLanguageEndPoint = Resource.msg('api.get.languages', 'textmaster', null);
    var tmLanguages = Utils.textMasterPublic('GET', tmLanguageEndPoint, null);

    tmLanguages = tmLanguages ? tmLanguages.languages : [];
    tmLanguages = tmLanguages.filter(function (item) {
        if (item.code.length === 2) {
            return false;
        }
        return true;
    });

    tmLanguages.sort(function (a, b) {
        if (a.value > b.value) {
            return 1;
        } else if (b.value > a.value) {
            return -1;
        }

        return 0;
    });

    return tmLanguages;
};

/**
 * Gets TextMaster language code from Language Mapping
 * @param {string} dwLang - sfcc language id
 * @returns {string} mapped language
 */
Utils.getMappedLanguage = function (dwLang) {
    var mappedLanguage = '';
    var languageMapping = Utils.config.languageMapping;

    for (var i = 0; i < languageMapping.length; i++) {
        if (languageMapping[i].dw === dwLang) {
            mappedLanguage = languageMapping[i].tm;
            break;
        }
    }

    return mappedLanguage;
};

/**
 * Gets SFCC language code from Language Mapping
 * @param {string} tmLang - textmaster language id
 * @returns {string} sfcc mapped language
 */
Utils.getSfccMappingLanguage = function (tmLang) {
    var sfccMappingLanguage = '';
    var languageMapping = Utils.config.languageMapping;

    for (var i = 0; i < languageMapping.length; i++) {
        if (languageMapping[i].tm === tmLang) {
            sfccMappingLanguage = languageMapping[i].dw;
            break;
        }
    }

    return sfccMappingLanguage;
};

/**
 * Get 'language from' list
 * @returns {boolean} true or false
 */
Utils.getLanguageFromList = function () {
    var result = [];
    var apiCache = Utils.config.tmApiCache;

    if (apiCache.toLowerCase() === 'disabled') {
        // Cache settings checking is only here.
        // In all other functions, data will be fetched from cache if data found in cache
        Utils.resetLanguageCache();
    }

    var languageFromListCache = customCache.getCache(Utils.config.cache.url.languages.fromList.replace('{site_id}', Site.current.ID));

    if (languageFromListCache) {
        return languageFromListCache;
    }

    var languages = Utils.getTranslationLanguages();

    for (var j = 0; j < languages.length; j++) {
        var language = languages[j];
        if (Utils.isLocaleEnabled(language.id)) {
            var languageToList = Utils.getLanguageTo(language.id);

            if (languageToList.length > 0) {
                result.push(language);
            }
        }
    }

    result = Utils.makeArrayUnique(result, 'id');

    languageFromListCache = result;
    customCache.setCache(Utils.config.cache.url.languages.fromList.replace('{site_id}', Site.current.ID), languageFromListCache);

    return result;
};

/**
 * Reset cache values
 */
Utils.resetLanguageCache = function () {
    customCache.clearCache('/' + Site.current.ID + '/languages');
};

/**
 * Check whether language is in Demandware and TextMaster
 * @param {string} languageCheck - language id
 * @returns {boolean} true or false
 */
Utils.isTranslationLanguage = function (languageCheck) {
    var languages = Utils.getTranslationLanguages();
    var i;

    for (i = 0; i < languages.length; i++) {
        if (languages[i].id === languageCheck) {
            return true;
        }
    }

    var mappingLanguage = Utils.getSfccMappingLanguage(languageCheck);

    if (mappingLanguage) {
        for (i = 0; i < languages.length; i++) {
            if (languages[i].id === mappingLanguage) {
                return true;
            }
        }
    }

    return false;
};

/**
 * Get all language ability list
 * @returns {Object} object of language details
 */
Utils.getLanguageAbilityList = function () {
    var abilityListCache = customCache.getCache(Utils.config.cache.url.languages.abilityList.replace('{site_id}', Site.current.ID));

    if (abilityListCache) {
        return abilityListCache;
    }

    var abilityEndPoint = Resource.msg('api.get.abilities', 'textmaster', null);
    var result = [];
    var page = 1;
    var lastPage = 1; // will set this with correct value from first API response

    while (page <= lastPage) {
        var abilityEndPointPage = (abilityEndPoint + '&page=' + page);
        var abilities = Utils.textMasterClient('GET', abilityEndPointPage, null);
        Utils.log.debug("Current page: " + page);
        Utils.log.debug(JSON.stringify(abilities));

        if (abilities && abilities.data && abilities.data.length > 0) {
        	if (lastPage === 1 && abilities.total_pages) {
        		lastPage = abilities.total_pages;
        	}
        	
            abilities = abilities.data;

            for (var i = 0; i < abilities.length; i++) {
                var ability = abilities[i];
                
                if (Utils.isTranslationLanguage(ability.language_to)) {
                    result.push({
                        from: ability.language_from,
                        to: ability.language_to
                    });
                }
            }
        }

        page++;
    }

    abilityListCache = result;
    customCache.setCache(Utils.config.cache.url.languages.abilityList.replace('{site_id}', Site.current.ID), abilityListCache);

    return result;
};

/*
 *    Get 'language to' list with dropped 'language from'
 */
Utils.getLanguageTo = function (languageFrom) {
    var languageTo = [];
    var abilityList = Utils.getLanguageAbilityList();
    var mappedLanguage = Utils.getMappedLanguage(languageFrom);

    languageFrom = mappedLanguage ? mappedLanguage : languageFrom;

    for (var i = 0; i < abilityList.length; i++) {
        var language = abilityList[i];
        if (language.from === languageFrom && language.to !== languageFrom) {
            var sfccMappingLanguage = Utils.getSfccMappingLanguage(language.to);
            var languageToCode = sfccMappingLanguage ? sfccMappingLanguage : language.to;
            languageTo.push({
                id: languageToCode,
                name: Utils.getLocaleName(languageToCode)
            });
        }
    }

    languageTo.sort(function (a, b) {
        return a.name < b.name ? -1 : 1;
    });

    languageTo = Utils.makeArrayUnique(languageTo, 'id');

    return languageTo;
};

/**
 * Checks if the SFCC Language added in Language Mapping
 * @param {string} code - language code
 * @returns {boolean} true or false
 */
Utils.isDWLanguageInMapping = function (code) {
    var languageMapping = Utils.config.languageMapping;
    var found = false;

    for (var i = 0; i < languageMapping.length; i++) {
        if (languageMapping[i].dw === code) {
            found = true;
            break;
        }
    }

    return found;
};

/**
 * Remove duplicate values from array
 * @param {Object} arr - language details object
 * @param {string} key - key of arr object
 * @returns {Object} result
 */
Utils.makeArrayUnique = function (arr, key) {
    var result = [];
    var count = 0;
    var found;

    for (var a = 0; a < arr.length; a++) {
        var el = arr[a];
        found = false;

        for (var i = 0; i < count; i++) {
            if (arr[i][key] === el[key]) {
                found = true;
                break;
            }
        }

        if (!found) {
            result.push(el);
        }

        count++;
    }

    return result;
};

/**
 * Gets all underlying subcategories of a root category, in hierarchy object
 * @param {string} root - root folder
 * @param {string} itemType - item type
 * @returns {Object} category details
 */
Utils.getAllSubCategoriesHierarchy = function (root, itemType) {
    var output = [];

    var subCategories = root.getSubCategories();
    for (var i = 0; i < subCategories.length; i++) {
        var category = subCategories[i];
        if (itemType === 'product' || itemType === 'category') {
            var catObject = {
                cat: category,
                sub: Utils.getAllSubCategoriesHierarchy(category, itemType)
            };
            output.push(catObject);
        }
    }

    return output;
};

/**
 * Gets all underlying subcategories of a root category, in a single array
 * @param {string} root - root folder
 * @returns {Object} category details
 */
Utils.getAllSubCategories = function (root) {
    var output = [];

    var subCategories = root.getSubCategories();
    for (var index = 0; index < subCategories.length; index++) {
        var category = subCategories[index];
        output.push(category);
        var nextLevelCategories = Utils.getAllSubCategories(category);
        output.push.apply(output, nextLevelCategories);
    }

    return output;
};

/**
 * Gets underlying subcategories having atleast one subcategory, in a single array
 * @param {string} root - root folder
 * @returns {Object} category details
 */
Utils.getFilterSubCategories = function (root) {
    var output = [];

    var subCategories = root.getSubCategories();
    for (var index = 0; index < subCategories.length; index++) {
        var category = subCategories[index];
        if (category.subCategories.length > 0) {
            output.push(category);
        }
        var nextLevelCategories = Utils.getFilterSubCategories(category);
        output.push.apply(output, nextLevelCategories);
    }

    return output;
};

/**
 * Check product already exists in product list
 * @param {Array} productList - array of product object
 * @param {Object} product - product object
 * @returns {boolean} - true or false
 */
Utils.isProductExistInList = function (productList, product) {
    if (product == null) {
        return true;
    }

    for (var prod = 0; prod < productList.length; prod++) {
        if (productList[prod].ID === product.ID) {
            return true;
        }
    }

    return false;
};

/**
 * Check category already exists in category list
 * @param {Array} categoryList - array of category object
 * @param {Object} category - category object
 * @returns {boolean} - true or false
 */
Utils.isCategoryExistInList = function (categoryList, category) {
    if (category == null) {
        return true;
    }

    for (var cat = 0; cat < categoryList.length; cat++) {
        if (categoryList[cat].ID === category.ID) {
            return true;
        }
    }

    return false;
};

/**
 * Check category name already exists in category list - This is useful for preparing filter option on item list
 * @param {Array} categoryList - array of category object
 * @param {Object} category - category object
 * @returns {boolean} - true or false
 */
Utils.isCategoryNameExistInList = function (categoryList, category) {
    if (category == null) {
        return true;
    }

    for (var cat = 0; cat < categoryList.length; cat++) {
        if (categoryList[cat].displayName === category.displayName) {
            return true;
        }
    }

    return false;
};

/**
 * Gets SFCC name of the locale if locale ID is passed
 * @param {string} localeID - locale ID
 * @returns {string} locale name
 */
Utils.getLocaleName = function (localeID) {
    var localeName = '';
    var locales = Utils.getDWLanguages();

    for (var i = 0; i < locales.length; i++) {
        if (locales[i].id === localeID) {
            localeName = locales[i].name;
            break;
        }
    }

    return localeName;
};

/**
 * Gets TextMaster name of the locale if locale code is passed
 * @param {string} localeCode - locale ID
 * @returns {string} locale name
 */
Utils.getTMLocaleName = function (localeCode) {
    var localeName = '';
    var tmLanguages = Utils.getTextMasterLanguages();

    for (var i = 0; i < tmLanguages.length; i++) {
        if (tmLanguages[i].code === localeCode) {
            localeName = tmLanguages[i].value;
        }
    }

    return localeName;
};


/**
 * HTTPService configuration parseResponse
 * @param {Object} service - service
 * @param {Object} httpClient - httpClient
 * @returns {Object} response
 */
Utils.serviceParseResponse = function (service, httpClient) {
    var resp;

    if (httpClient.statusCode === 200 || httpClient.statusCode === 201) {
        resp = JSON.parse(httpClient.getText());
    } else {
        Utils.log.error('Error on http request: ' + httpClient.getErrorText());
        resp = null;
    }

    return resp;
};

/**
 * Sets service registry for TextMasterClient
 * @param {Object} config - configuration
 * @returns {Object} service
 */
Utils.setServiceRegistry = function (config) {
    var service = LocalServiceRegistry.createService('textmaster.http', config);

    return service;
};

/**
 * Get service configuration for TextMasterClient and TextMasterTest
 * @returns {Object} request
 */
Utils.getServiceConfigClient = function () {
    return {
        createRequest: function (service, args) {
            service.URL = args.endPointUrl;
            service.setRequestMethod(args.method);
            service.addHeader('Authorization', 'Bearer ' + args.token);
            service.addHeader('Content-Type', 'application/json');
            service.addHeader('X-Partner-Id', Resource.msg('general.sfcc.partner.id.' + Utils.config.apiEnv, 'textmaster', null));

            return args.request;
        },

        parseResponse: Utils.serviceParseResponse,

        getRequestLogMessage: function (request) {
            return Utils.filterLogData(request);
        },

        getResponseLogMessage: function (response) {
            return Utils.filterLogData(response.text);
        }
    };
};

/**
 * Communicates with TextMaster clients APIs
 * @param {string} method - method
 * @param {string} endPoint - endPoint Url
 * @param {string} request - request body
 * @returns {Object} response object
 */
Utils.textMasterClient = function (method, endPoint, request) {
    var apiBaseLink = Utils.config.apiEnv === 'live' ? Utils.config.tmApiBaseUrlLive : Utils.config.tmApiBaseUrlDemo;
    var apiVersion = Utils.config.apiEnv === 'live' ? Utils.config.tmApiVersionUrlLive : Utils.config.tmApiVersionUrlDemo;
    var endPointUrl = apiBaseLink + apiVersion + '/' + Resource.msg('api.clients', 'textmaster', null) + endPoint;
    var token = Utils.getSavedToken();
    var serviceArgs = {
        token: token,
        method: method,
        endPointUrl: endPointUrl,
        request: request || ''
    };
    var serviceConfig = Utils.getServiceConfigClient();
    var service = Utils.setServiceRegistry(serviceConfig);
    var result = service.call(serviceArgs);

    if (result.status !== 'OK') {
        Utils.log.error('Error on Service call to endpoint: ' + method + ' ' + endPointUrl);
        Utils.log.error('Error message: ' + result.msg);
    }

    var response = result.status === 'OK' ? result.object : null;

    return response;
};

/**
 * Get saved token from custom cache
 * @returns {string} token - token
 * */
Utils.getSavedToken = function () {
    var authData = customCache.getCache(Utils.config.cache.url.authentication);
    var token;

    if (authData) {
        var currentTimeStamp = new Date().getTime();
        var authCreatedTime = authData.createdAt;

        if (currentTimeStamp - authCreatedTime < authData.expiresIn) {
            token = authData.accessToken;
        } else {
            token = Utils.getRefreshedToken(authData);
        }
    }

    return token;
};

/**
 * Get refreshed token
 * @param {Object} authData - authorization data in custom cache
 * @returns {string} token - token
 * */
Utils.getRefreshedToken = function (authData) {
    var endPoint = Utils.config.api.authentication.token;
    var apiBaseLink = Utils.config.apiEnv === 'live' ? Utils.config.tmApiBaseUrlLive : Utils.config.tmApiBaseUrlDemo;
    var endPointUrl = apiBaseLink + endPoint;
    var request = {
        client_id: authData.clientID,
        client_secret: authData.clientSecret,
        grant_type: Utils.config.api.authentication.refreshGrantType,
        refresh_token: authData.refreshToken
    };
    var serviceConfig = Utils.getServiceConfigPublic();
    var service = Utils.setServiceRegistry(serviceConfig);

    var serviceArgs = {
        method: 'POST',
        endPointUrl: endPointUrl,
        request: JSON.stringify(request)
    };

    var result = service.call(serviceArgs);

    var response = result.status === 'OK' ? result.object : null;

    if (result.status !== 'OK') {
        Utils.log.error('Failed to refresh token. Below is the request.');
        Utils.log.error('Error Message: ' + result.msg);
        Utils.log.debug('Request: ' + JSON.stringify(request));
    } else {
        // Keep new data in custom cache
        var saveAuthData = require('~/cartridge/scripts/translation/tmSaveAuthData');
        saveAuthData.execute(response);
        Utils.log.debug('API authentication token refreshed');
    }

    return response && response.access_token ? response.access_token : null;
};

/**
 * Get service config for TextMasterPublic
 * @returns {Object} request object
 */
Utils.getServiceConfigPublic = function () {
    return {
        createRequest: function (service, args) {
            service.URL = args.endPointUrl;
            service.setRequestMethod(args.method);
            service.addHeader('Content-Type', 'application/json');

            return args.request;
        },
        parseResponse: Utils.serviceParseResponse,

        getRequestLogMessage: function (request) {
            return Utils.filterLogData(request);
        },

        getResponseLogMessage: function (response) {
            return Utils.filterLogData(response.text);
        }
    };
};

/**
 * Communicates with TextMaster public APIs
 * @param {string} method - method
 * @param {string} endPoint - endpoint
 * @param {string} request - request body
 * @returns {Object} response body
 */
Utils.textMasterPublic = function (method, endPoint, request) {
    var apiBaseLink = Utils.config.apiEnv === 'live' ? Utils.config.tmApiBaseUrlLive : Utils.config.tmApiBaseUrlDemo;
    var apiVersion = Utils.config.apiEnv === 'live' ? Utils.config.tmApiVersionUrlLive : Utils.config.tmApiVersionUrlDemo;
    var endPointUrl = apiBaseLink + apiVersion + '/' + Resource.msg('api.public', 'textmaster', null) + endPoint;

    request = request || '';
    var serviceConfig = Utils.getServiceConfigPublic();
    var service = Utils.setServiceRegistry(serviceConfig);

    var serviceArgs = {
        method: method,
        endPointUrl: endPointUrl,
        request: request
    };

    var result = service.call(serviceArgs);

    var response = result.status === 'OK' ? result.object : null;

    return response;
};

/**
 * Generates authorization token
 * @returns {Object} response body
 */
Utils.generateToken = function () {
    var endPoint = Utils.config.api.authentication.token;
    var apiBaseLink = Utils.config.apiEnv === 'live' ? Utils.config.tmApiBaseUrlLive : Utils.config.tmApiBaseUrlDemo;
    var endPointUrl = apiBaseLink + endPoint;

    var authData = customCache.getCache(Utils.config.cache.url.authentication);
    var request = {
        client_id: authData.clientID,
        client_secret: authData.clientSecret,
        grant_type: Utils.config.api.authentication.accessGrantType,
        redirect_uri: authData.redirectURI,
        code: authData.authCode
    };
    var serviceConfig = Utils.getServiceConfigPublic();
    var service = Utils.setServiceRegistry(serviceConfig);

    var serviceArgs = {
        method: 'POST',
        endPointUrl: endPointUrl,
        request: JSON.stringify(request)
    };

    var result = service.call(serviceArgs);

    var response = result.status === 'OK' ? result.object : null;

    if (result.status !== 'OK') {
        Utils.log.error('Failed to generate token. Below is the request.');
        Utils.log.error('Error Message: ' + result.msg);
        Utils.log.debug('Request: ' + JSON.stringify(request));
    }

    return response;
};

/**
 * Communicates with storefront endpoints for page related queries
 * @param {string} method - method
 * @param {string} endPoint - endpoint
 * @param {string} request - request body
 * @param {string} locale - locale
 * @returns {Object} response body
 */
Utils.storefrontCall = function (method, endPoint, request, locale) {
    var languageList = Utils.getLanguageFromList();
    var languageCode = 'default';

    if (locale) {
        languageCode = locale;
    } else if (languageList && languageList.length) {
        languageCode = Utils.formatLocaleDemandware(languageList[0].id);
    }

    var tmSFpassword = Site.getCurrent().getCustomPreferenceValue('TMSFpassword') || '';
    var sfProtectionURLpart = (Site.current.status === Site.SITE_STATUS_PROTECTED) ? (Resource.msg('storefront.username', 'textmaster', null) + ':' + tmSFpassword + '@') : '';
    var urlAction = new URLAction('TMController-Dummy', Site.current.ID, languageCode);
    var storeURL = URLUtils.abs(urlAction).toString();
    var endPointUrl = storeURL.replace('https://', 'https://' + sfProtectionURLpart);
    endPointUrl = endPointUrl.replace('/TMController-Dummy', endPoint);
    endPointUrl = Utils.replaceHostnameWithExternalAlias(endPointUrl, sfProtectionURLpart);

    request = request || '';
    var serviceConfig = Utils.getServiceConfigPublic();
    var service = Utils.setServiceRegistry(serviceConfig);

    var serviceArgs = {
        method: method,
        endPointUrl: endPointUrl,
        request: request
    };

    var result = service.call(serviceArgs);

    var response = result.status === 'OK' ? result.object : null;

    return response;
};

/*
 * get service config for TriggerURL
 */
Utils.getServiceConfigTrigger = function () {
    return {
        createRequest: function (service, args) {
            service.URL = args.endPointUrl;
            service.setRequestMethod(args.method);
            service.addHeader('Content-Type', 'application/json');

            return service;
        },

        parseResponse: function (service, httpClient) {
            if (httpClient.statusCode !== 200 && httpClient.statusCode !== 201) {
                Utils.log.error('Error on http request: ' + httpClient.getErrorText());
            }
        },

        getRequestLogMessage: function (request) {
            return Utils.filterLogData(request);
        },

        getResponseLogMessage: function (response) {
            return Utils.filterLogData(response.text);
        }
    };
};

/**
 * Execute callback URL
 * @param {string} method - method
 * @param {string} endPoint - endPoint Url
 */
Utils.triggerURL = function (method, endPoint) {
    var endPointUrl = endPoint;

    var serviceConfig = Utils.getServiceConfigTrigger();
    var service = Utils.setServiceRegistry(serviceConfig);

    var serviceArgs = {
        method: method,
        endPointUrl: endPointUrl
    };

    service.call(serviceArgs);
};

/**
 * Get service config for OCAPIClient
 * @returns {Object} request object
 */
Utils.getServiceConfigOCAPIClient = function () {
    return {
        createRequest: function (service, args) {
            service.URL = args.endPointUrl;
            service.setRequestMethod(args.method);
            service.addHeader('Content-Type', 'application/json');
            service.addHeader('Authorization', 'Bearer ' + args.token);

            return args.request;
        },

        parseResponse: Utils.serviceParseResponse,

        getRequestLogMessage: function (request) {
            return Utils.filterLogData(request);
        },

        getResponseLogMessage: function (response) {
            return Utils.filterLogData(response.text);
        }
    };
};

/**
 * Communicates with OCAPI
 * @param {string} method - method
 * @param {string} endPoint - endPoint
 * @param {string} request - request body
 * @returns {Object} response object
 */
Utils.ocapiClient = function (method, endPoint, request) {
    var endPointUrl = 'https://' + System.instanceHostname + '/s/-' + endPoint;
    var token = Utils.getOCAPIToken();
    var errorResponse;

    request = request || '';

    var serviceConfig = Utils.getServiceConfigOCAPIClient();
    var service = Utils.setServiceRegistry(serviceConfig);

    var serviceArgs = {
        method: method,
        endPointUrl: endPointUrl,
        request: request,
        token: token
    };

    var result = service.call(serviceArgs);

    if (result.status === 'ERROR') {
        try {
            errorResponse = JSON.parse(result.errorMessage);

            if (!(errorResponse && errorResponse.fault && errorResponse.fault.type && errorResponse.fault.type === 'JobAlreadyRunningException')) {
                Utils.log.error('Invalid OCAPI settings. Also check OCAPI username and password in Site Preference');
                Utils.log.error(result.errorMessage);
            }
        } catch (ex) {
            Utils.log.error(result.errorMessage);
        }
    }

    var response = result.status === 'OK' ? result.object :
        (errorResponse && errorResponse.fault && errorResponse.fault.type ? {
            execution_status: errorResponse.fault.type
        } : null);

    return response;
};

/**
 * Get service config for OCAPIToken
 * @returns {string} empty
 */
Utils.getServiceConfigOCAPIToken = function () {
    return {
        createRequest: function (service, args) {
            service.URL = args.endPointUrl;
            service.setRequestMethod(args.method);
            service.addHeader('Content-Type', 'application/x-www-form-urlencoded');
            service.addHeader('Authorization', args.auth);

            return '';
        },

        parseResponse: Utils.serviceParseResponse,

        getRequestLogMessage: function (request) {
            return Utils.filterLogData(request);
        },

        getResponseLogMessage: function (response) {
            return Utils.filterLogData(response.text);
        }
    };
};

/**
 * Gets OCAPI authorization token
 * @returns {string} token
 */
Utils.getOCAPIToken = function () {
    var ocapiID = Site.getCurrent().getCustomPreferenceValue('TMOCAPIid') || Utils.config.ocapi.demo.id;
    var ocapiPassword = Site.getCurrent().getCustomPreferenceValue('TMOCAPIpassword') || Utils.config.ocapi.demo.password;
    var endPointUrl = Utils.config.ocapi.token.post;
    var token = '';
    var auth = 'Basic ' + StringUtils.encodeBase64(ocapiID + ':' + ocapiPassword);

    token = Utils.getSessionToken(auth);

    if (token) {
        return token;
    }

    var serviceConfig = Utils.getServiceConfigOCAPIToken();
    var service = Utils.setServiceRegistry(serviceConfig);

    var serviceArgs = {
        method: 'post',
        endPointUrl: endPointUrl,
        auth: auth
    };

    var result = service.call(serviceArgs);

    var response = result.status === 'OK' ? result.object : null;

    if (response) {
        token = response.access_token;
    }

    Transaction.begin();
    session.privacy.textmasterTokenAuth = auth;
    session.privacy.textmasterTokenTime = new Date();
    session.privacy.textmasterToken = token;
    Transaction.commit();

    return token;
};

/**
 * Get token from Session if found
 * @param {string} auth - auth
 * @returns {boolean} false
 */
Utils.getSessionToken = function (auth) {
    if (session.privacy.textmasterTokenAuth && session.privacy.textmasterTokenAuth === auth) {
        var sessionTime = new Date(session.privacy.textmasterTokenTime);
        var currentTime = new Date();
        var tokenExpire = 300000; /* 5 minutes */

        if (currentTime.getTime() - sessionTime.getTime() < tokenExpire) {
            return session.privacy.textmasterToken;
        }
    }

    return false;
};

/**
 * Converts Demandware locale ID format (eg:- en_US) to TextMaster locale ID format (eg:- en-us)
 * @param {string} locale - locale id
 * @returns {string} formated locale id
 */
Utils.toTextMasterLocaleID = function (locale) {
    locale = locale.toLowerCase().replace('_', '-');

    return locale;
};

/**
 * Converts TextMaster locale ID format (eg:- en-us) to Demandware locale ID format (eg:- en-US)
 * @param {string} locale - locale id
 * @returns {string} formated locale id
 */
Utils.toDemandwareLocaleID = function (locale) {
    var localePart = locale.split('-');

    locale = localePart[0];

    if (localePart[1] !== undefined) {
        locale += ('-' + localePart[1].toUpperCase());
    }

    return locale;
};

/**
 * Convert first letter to uppercase
 * @param {string} str - string
 * @returns {string} formated string
 */
Utils.firstLetterCapital = function (str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Gets word count
 * @param {string} str - string
 * @returns {number} length of string
 */
Utils.getWordCount = function (str) {
    return str.split(' ').length;
};

/**
 * Get custom object to keep job triggering settings
 * @returns {Object} dataholder
 */
Utils.getJobDataHolder = function () {
    var customObjectName = Utils.config.importData.customObject.name;
    var customObjectInstanceID = Utils.config.importData.customObject.instanceid;
    try {
        var dataHolder = CustomObjectMgr.getCustomObject(customObjectName, customObjectInstanceID);
        if (dataHolder == null) {
            Transaction.begin();
            dataHolder = CustomObjectMgr.createCustomObject(customObjectName, customObjectInstanceID);
            Transaction.commit();
        }
        return dataHolder;
    } catch (ex) {
        Utils.log.error(ex.message + ' - No custom object found.');
        return null;
    }
};

/**
 * Get custom object to keep job triggering settings
 * @returns {Object} dataholder
 */
Utils.getFailedJobDataHolder = function () {
    var customObjectName = Utils.config.failedImportData.customObject.name;
    var customObjectInstanceID = Utils.config.failedImportData.customObject.instanceid;
    try {
        var dataHolder = CustomObjectMgr.getCustomObject(customObjectName, customObjectInstanceID);
        if (dataHolder == null) {
            Transaction.begin();
            dataHolder = CustomObjectMgr.createCustomObject(customObjectName, customObjectInstanceID);
            Transaction.commit();
        }
        return dataHolder;
    } catch (ex) {
        Utils.log.error(ex.message + ' - No custom object found.');
        return null;
    }
};

/**
 * Convert an ID text to XML tag format
 * @param {string} str - string
 * @returns {string} tag name
 */
Utils.idToXMLTag = function (str) {
    var i = 1;
    var tagName = str[0].toLowerCase();

    while (i < str.length) {
        if (str[i - 1] === str[i - 1].toUpperCase()) {
            tagName += str[i].toLowerCase();
        } else if (str[i] === str[i].toUpperCase()) {
            tagName += '-' + str[i].toLowerCase();
        } else {
            tagName += str[i];
        }

        i++;
    }

    return tagName;
};

/**
 * Save project id and document id into custom object for import job
 * @param {string} projectid - project id
 * @param {string} documentid - document id
 * @param {string} isfirstimport - first time import or not
 * @returns {Object} result object
 */
Utils.setImportJobQuery = function (projectid, documentid, isfirstimport) {
    var dataHolder = Utils.getJobDataHolder();
    var tryAgain = true;
    var result;

    while (tryAgain) {
        var queue = dataHolder.custom.QueuedDocuments || '[]';
        var queueObj = JSON.parse(queue);
        queueObj.push({
            projectid: projectid,
            documentid: documentid,
            isfirstimport: isfirstimport
        });

        try {
            Transaction.begin();
            dataHolder.custom.QueuedDocuments = JSON.stringify(queueObj);
            Transaction.commit();

            result = dataHolder.custom.RunningDocument ? true : false;
            tryAgain = false;
        } catch (ex) { } // eslint-disable-line no-empty
    }

    return result;
};

/**
 * Save project id and document id and other details into custom object for failed import job
 * @param {Object} obj - import related details object
 */
Utils.setFailedImportJobQuery = function (obj) {
    var dataHolder = Utils.getFailedJobDataHolder();

    if (dataHolder) {
        var queue = dataHolder.custom.QueuedDocuments || '[]';
        var queueObj = JSON.parse(queue);
        queueObj.push(obj);

        try {
            Transaction.begin();
            dataHolder.custom.QueuedDocuments = JSON.stringify(queueObj);
            Transaction.commit();
        } catch (ex) {
            Utils.log.error(ex.message);
        }
    }
};

/**
 * Get item's last modified date
 * @param {string} itemType - item type
 * @param {string} itemID - item ID
 * @returns {Date} Item's last modified date
 */
Utils.getItemLastModifiedDate = function (itemType, itemID) {
    var item;
    var lastModified;

    switch (itemType) {
    case 'product':
        item = ProductMgr.getProduct(itemID);
        lastModified = item.lastModified;
        break;
    case 'content':
        item = ContentMgr.getContent(itemID);
        lastModified = item.lastModified;
        break;
    case 'category':
        item = CatalogMgr.getCategory(itemID);
        lastModified = item.lastModified;
        break;
    case 'folder':
        item = ContentMgr.getFolder(itemID);
        if (empty(item)) {
            item = ContentMgr.getFolder(ContentMgr.getLibrary(ContentMgr.PRIVATE_LIBRARY), itemID);
        }
        lastModified = item.lastModified;
        break;
    case 'pagedesigner':
        lastModified = pageUtils.getPageLastModified(itemID);
        break;
    case 'component':
        lastModified = pageUtils.getPageComponentLastModified(itemID);
        break;
    }
    return lastModified;
};

/**
 * Get custom object where the item's last updated data is stored
 * @returns {Object} custom object
 */
Utils.getItemLastUpdatedData = function () {
    var customObjectName = Utils.config.checkImportStatus.customObject.name;
    var customObjectInstanceID = Utils.config.checkImportStatus.customObject.instanceid;
    try {
        var dataHolder = CustomObjectMgr.getCustomObject(customObjectName, customObjectInstanceID);
        if (dataHolder == null) {
            Transaction.begin();
            dataHolder = CustomObjectMgr.createCustomObject(customObjectName, customObjectInstanceID);
            Transaction.commit();
        }
        return dataHolder;
    } catch (ex) {
        Utils.log.error(ex.message + ' - custom object found.');
        return null;
    }
};

/**
 * Set item's last modified date in custom object
 * @param {string} projectID - textmaster project ID
 * @param {string} documentID - textmaster document ID
 * @param {string} itemType - item type
 * @param {string} itemID - item ID
 * @param {string} isFirstImport - first time import or not
 */
Utils.setItemLastUpdatedData = function (projectID, documentID, itemType, itemID, isFirstImport) {
    var dataHolder = Utils.getItemLastUpdatedData();

    if (dataHolder) {
        var lastModified = Utils.getItemLastModifiedDate(itemType, itemID);
        var queue = dataHolder.custom.QueuedDocuments || '[]';
        var queueObj = JSON.parse(queue);
        queueObj.push({
            projectID: projectID,
            documentID: documentID,
            itemType: itemType,
            itemID: itemID,
            lastModified: lastModified,
            isFirstImport: isFirstImport
        });
        try {
            Transaction.begin();
            dataHolder.custom.QueuedDocuments = JSON.stringify(queueObj);
            Transaction.commit();
        } catch (ex) {
            Utils.log.error(ex.message + ' - Item last modified date is not saved.');
        }
    }
};

/*
 * Makes single digit number into 2 digit string for date formatting Eg:- 8 to 08
 */
Utils.make2digits = function (inputNumber) {
    var inputString = inputNumber.toString();
    var twoDigitString = inputString.length === 1 ? ('0' + inputString) : inputString;

    return twoDigitString;
};

/**
 * Masked sensitive data
 * @param {Object} data - requestObject
 * @returns {Object} masked data
 */
Utils.filterLogData = function (data) {
    if (data === null) {
        return Resource.msg('data.empty', 'textmaster', null);
    }

    var result = '\n';
    var value = '';

    if (!empty(data)) {
        var credentialsObject = JSON.parse(data);

        for (var key in credentialsObject) {
            value = credentialsObject[key];

            if (key === 'client_id' || key === 'access_token') {
                value = '*****';
            }
            result += decodeURIComponent(key + '=' + value) + '\n';
        }
    }
    return result;
};

/**
 * Gets PageDesigner Object from storefront
 * @param {string} pageID - pageID
 * @returns {Object} returns page object
 */
Utils.getPageObject = function (pageID) {
    var pageObject;
    var endPoint = '/TMPageDesignersImpex-GetPage?pageid=' + pageID;

    pageObject = Utils.storefrontCall('GET', endPoint, null, null);

    return pageObject;
};

/*
 * Gets variation attributes
 * @param {Object} product
 * @returns {Object} list of attributes
 * */
Utils.getVariationAttributes = function (product) {
    var productVariationAttributes;

    if (product.master || product.variant || product.variationGroup) {
        var variationModel = product.variationModel;
        productVariationAttributes = variationModel.productVariationAttributes;
    }

    return productVariationAttributes;
};

/**
 * Replaces host name in storefront controllers like callback URLs with external alias in the custom site preference
 * @param {string} endPointUrl - Storefront URL
 * @param {string} sfProtectionURLpart - Storefront protection username and password combination in storefront URL
 * @returns {string} - Modified Storefront URL
 * */
Utils.replaceHostnameWithExternalAlias = function (endPointUrl, sfProtectionURLpart) {
    var exteralAlias = Utils.config.tmExternalAliasHostName;

    if (exteralAlias) {
        exteralAlias = exteralAlias.replace('https://', '');
        var modifiedEndPointUrl = endPointUrl.replace('https://', '');
        modifiedEndPointUrl = modifiedEndPointUrl.replace(sfProtectionURLpart, '');
        modifiedEndPointUrl = modifiedEndPointUrl.substring(modifiedEndPointUrl.indexOf('/') + 1);
        modifiedEndPointUrl = 'https://' + sfProtectionURLpart + exteralAlias + modifiedEndPointUrl;

        return modifiedEndPointUrl;
    }

    return endPointUrl;
};

module.exports = Utils;
