'use strict';

/**
 * Controller that provides ajax features for translation pages
 * @module controllers/TMComponents
 */

/* global request */

/* API Includes */
var ISML = require('dw/template/ISML');

/* Script Includes */
var utils = require('*/cartridge/scripts/utils/tmUtils');
var pageUtils = require('*/cartridge/scripts/utils/tmPageUtils');
var r = require('*/cartridge/scripts/utils/response');
var followUpList = require('~/cartridge/scripts/translation/getFollowUpList');

/**
 * Gives the navigation catalog ID of the current site
 * @returns {string} Id of storefront catalog
 */
function getSiteCatalog() {
    var siteCatalog = require('dw/catalog/CatalogMgr').siteCatalog;
    return siteCatalog.ID;
}

/**
 * Form to show filter options for translation
 */
function attributeList() {
    var attributes = require('~/cartridge/scripts/translation/getAttributeList');
    var input = {
        itemType: request.httpParameterMap.get('itemType').stringValue
    };

    var output = attributes.output(input);

    ISML.renderTemplate('translation/attributelist', output);
}

/**
 * Gets category dropdown options of a catalog
 */
function categoryDropdown() {
    var categories = require('~/cartridge/scripts/translation/getCategoryList');
    var input = {
        ItemType: request.httpParameterMap.get('itemType').stringValue
    };
    input.CatalogID = getSiteCatalog();

    var output = categories.output(input);

    ISML.renderTemplate('translation/categorydropdown', output);
}

/**
 * Get 'language to' list
 */
function getLanguageToList() {
    var toLanguages = require('~/cartridge/scripts/translation/getLanguageToList');
    var input = {
        LanguageFrom: request.httpParameterMap.get('languageFrom').stringValue
    };

    var output = toLanguages.output(input);

    ISML.renderTemplate('translation/languagetolist', output);
}

/**
 * Gets item list in ajax call
 */
function itemList() {
    var items = require('~/cartridge/scripts/translation/getItemList');

    var input = {
        Category: request.httpParameterMap.get('category').stringValue,
        ItemType: request.httpParameterMap.get('itemType').stringValue,
        ProductIDs: request.httpParameterMap.get('pids').stringValue,
        Date: request.httpParameterMap.get('date').stringValue
    };
    var output = items.output(input);
    var languages = utils.getTranslationLanguages();
    var productTypes = [];

    if (output.Type === 'product') {
        var productTypesObj = utils.productTypes;

        // eslint-disable-next-line
        for (var key in productTypesObj) {
            productTypes.push(productTypesObj[key]);
        }
    }

    if (output.Type === 'pagedesigner' || output.Type === 'component') {
        ISML.renderTemplate('translation/emptytemplate', output);
    } else {
        ISML.renderTemplate('translation/itemlist', {
            Type: output.Type,
            ItemList: output.ItemList,
            CategoryList: output.CategoryList,
            Languages: languages,
            ProductTypes: productTypes,
            Utils: utils
        });
    }
}

/**
 * Gets template response from TextMaster
 */
function getTemplatesResponse() {
    var templatesResponse = require('~/cartridge/scripts/translation/getTemplatesResponse');
    var output = templatesResponse.output();

    r.renderJSON(output);
}

/**
 * Create translation document in TextMaster
 */
function createTranslation() {
    var translationCreation = require('~/cartridge/scripts/translation/createTranslation');

    var input = {
        ProjectID: request.httpParameterMap.get('projectID').stringValue,
        LocaleFrom: request.httpParameterMap.get('localeFrom').stringValue,
        LocaleTo: request.httpParameterMap.get('localeTo').stringValue,
        ItemType: request.httpParameterMap.get('itemType').stringValue,
        CatalogID: request.httpParameterMap.get('catalogID').stringValue,
        Attributes: request.httpParameterMap.get('attributes').stringValue,
        PageID: request.httpParameterMap.get('pageID').stringValue,
        Items: request.httpParameterMap.get('items').stringValue
    };

    var output = translationCreation.output(input);

    r.renderJSON(output);
}

/**
 * Save default attribute settings
 */
function saveDefaultAttributes() {
    var defaultAttributes = require('~/cartridge/scripts/translation/saveDefaultAttributes');

    var input = {
        ItemType: request.httpParameterMap.get('itemType').stringValue,
        Attributes: request.httpParameterMap.get('attributes[]').values
    };
    var output = defaultAttributes.output(input);

    r.renderJSON(output);
}

/**
 * Save API Configurations
 */
function saveAPIConfigurations() {
    var apiConfig = require('~/cartridge/scripts/translation/setAPIConfigurations');

    var input = {
        APICategory: request.httpParameterMap.get('apiCategory').stringValue,
        APICatalogID: request.httpParameterMap.get('catalogID').stringValue,
        APIEnv: request.httpParameterMap.get('apiEnv').stringValue,
        APICache: request.httpParameterMap.get('apiCache').stringValue,
        TMPageSize: request.httpParameterMap.get('tmPageSize').intValue,
        TMSFpassword: request.httpParameterMap.get('tmSFpassword').stringValue,
        tmApiBaseUrlDemo: request.httpParameterMap.get('tmApiBaseUrlDemo').stringValue,
        tmApiBaseUrlLive: request.httpParameterMap.get('tmApiBaseUrlLive').stringValue,
        tmBackofficeBaseUrlLive: request.httpParameterMap.get('tmBackofficeBaseUrlLive').stringValue,
        tmBackofficeBaseUrlDemo: request.httpParameterMap.get('tmBackofficeBaseUrlDemo').stringValue,
        tmApiVersionUrlLive: request.httpParameterMap.get('tmApiVersionUrlLive').stringValue,
        tmApiVersionUrlDemo: request.httpParameterMap.get('tmApiVersionUrlDemo').stringValue
    };
    apiConfig.output(input);
}

/**
 * If the project is autoLaunch enabled then finalize it; Else send Quote
 */
function handleAutoLaunch() {
    var autoLaunch = require('~/cartridge/scripts/translation/handleAutoLaunch');
    var input = {
        ProjectID: request.httpParameterMap.get('projectID').stringValue,
        AutoLaunch: request.httpParameterMap.get('autoLaunch').stringValue
    };
    var output = autoLaunch.output(input);

    r.renderJSON(output);
}

/**
 * Loads first row of dashboard data table
 */
function dashboardFirstRow() {
    var project = request.httpParameterMap.get('project').stringValue;

    ISML.renderTemplate('translation/followuptablerow', {
        Project: JSON.parse(project)
    });
}

/**
 * Loads first row of document dashboard data table
 */
function docDashboardFirstRow() {
    var document = request.httpParameterMap.get('document').stringValue;

    ISML.renderTemplate('translation/docfollowuptablerow', {
        Document: JSON.parse(document)
    });
}

/**
 * Gets Dashboard data for each 'Load more'
 */
function getDashboardData() {
    var input = {
        projectPageNumber: request.httpParameterMap.get('projectPageNumber').intValue
    };

    var output = followUpList.output(input);

    r.renderJSON(output);
}

/**
 * Gets Documents Dashboard data for each 'Load more'
 */
function getDocDashboardData() {
    var input = {
        projectID: request.httpParameterMap.get('projectID').stringValue,
        documentPageNumber: request.httpParameterMap.get('documentPageNumber').intValue
    };

    var output = followUpList.getDocsOutput(input);

    r.renderJSON(output);
}

/**
 * Clears cache
 */
function clearCache() {
    utils.resetLanguageCache();
}

/**
 * Launches the project if the translate button is clicked
 */
function launchProject() {
    var launch = require('~/cartridge/scripts/translation/launchProject');
    var input = {
        projectID: request.httpParameterMap.get('projectID').stringValue
    };

    var output = launch.output(input);

    r.renderJSON(output);
}

/**
 * Completes a project if the validate button is clicked
 */
function documentComplete() {
    var complete = require('~/cartridge/scripts/translation/documentComplete');
    var input = {
        projectID: request.httpParameterMap.get('projectID').stringValue,
        documentID: request.httpParameterMap.get('documentID').stringValue
    };

    var output = complete.output(input);

    r.renderJSON(output);
}

/**
 * Gets Page Designer list if Content Assets XML file Exists after executing the relevant export job
 */
function getPageDesigners() {
    var itemType = request.httpParameterMap.get('itemType').stringValue;
    var exportDate = request.httpParameterMap.get('exportDate').stringValue;
    var items = pageUtils.getPageItems(exportDate);
    var languages = utils.getTranslationLanguages();

    if (itemType === 'component') {
        ISML.renderTemplate('translation/tmpagedesignersindropdown', {
            ItemList: items
        });
    } else {
        ISML.renderTemplate('translation/itemlist', {
            Type: 'pagedesigner',
            ItemList: items,
            CategoryList: [],
            Languages: languages,
            ProductTypes: [],
            Utils: utils
        });
    }
}

/**
 * Gets page components in ajax call
 */
function getPageComponents() {
    var pageID = request.httpParameterMap.get('pageID').stringValue;
    var exportDate = request.httpParameterMap.get('date').stringValue;
    var items = pageUtils.getPageComponents(pageID, exportDate);
    var languages = utils.getTranslationLanguages();

    ISML.renderTemplate('translation/tmcomponentlist', {
        Type: 'component',
        ItemList: items,
        Languages: languages,
        Utils: utils
    });
}

/**
* Saves values to authentication data in custom cache
**/
function saveAuthData() {
    var input = {
        clientID: request.httpParameterMap.get('clientID').stringValue || '',
        clientSecret: request.httpParameterMap.get('clientSecret').stringValue || '',
        redirectURI: request.httpParameterMap.get('redirectURI').stringValue || ''
    };

    var saveData = require('*/cartridge/scripts/translation/tmSaveAuthData');
    saveData.execute(input);

    r.renderJSON({ success: true });
}

/**
 * Generates token for API communications
 **/
function generateToken() {
    var result = utils.generateToken();

    if (result) {
        var saveData = require('*/cartridge/scripts/translation/tmSaveAuthData');
        saveData.execute(result);
    }

    r.renderJSON(result);
}

/**
* Deletes existing access token and authentication code
**/
function clearToken() {
    var customCache = require('*/cartridge/scripts/utils/customCacheWebdav');
    customCache.setCache(utils.config.cache.url.authentication, {});

    r.renderJSON({ success: true });
}

/*
 * Web exposed methods
 */
/**
 * Calls ajax features for translation pages
 */
attributeList.public = true;
categoryDropdown.public = true;
getLanguageToList.public = true;
itemList.public = true;
getTemplatesResponse.public = true;
createTranslation.public = true;
saveDefaultAttributes.public = true;
saveAPIConfigurations.public = true;
handleAutoLaunch.public = true;
getDashboardData.public = true;
dashboardFirstRow.public = true;
docDashboardFirstRow.public = true;
clearCache.public = true;
launchProject.public = true;
getDocDashboardData.public = true;
documentComplete.public = true;
getPageDesigners.public = true;
getPageComponents.public = true;
saveAuthData.public = true;
generateToken.public = true;
clearToken.public = true;

exports.AttributeList = attributeList;
exports.CategoryDropdown = categoryDropdown;
exports.GetLanguageToList = getLanguageToList;
exports.ItemList = itemList;
exports.GetTemplatesResponse = getTemplatesResponse;
exports.CreateTranslation = createTranslation;
exports.SaveDefaultAttributes = saveDefaultAttributes;
exports.SaveAPIConfigurations = saveAPIConfigurations;
exports.HandleAutoLaunch = handleAutoLaunch;
exports.DashboardData = getDashboardData;
exports.DashboardFirstRow = dashboardFirstRow;
exports.DocDashboardFirstRow = docDashboardFirstRow;
exports.ClearCache = clearCache;
exports.LaunchProject = launchProject;
exports.DocDashboardData = getDocDashboardData;
exports.DocumentComplete = documentComplete;
exports.GetPageDesigners = getPageDesigners;
exports.GetPageComponents = getPageComponents;
exports.SaveAuthData = saveAuthData;
exports.GenerateToken = generateToken;
exports.ClearToken = clearToken;
