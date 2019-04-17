'use strict';

/**
 * Controller that provides ajax features for translation pages
 * @module controllers/TMComponents
 */

/* API Includes */
var ISML = require('dw/template/ISML');

/* Script Modules */
var logUtils = require('~/cartridge/scripts/utils/LogUtils');

/* Global variables */
var log = logUtils.getLogger("Translation Controller");

/**
* Form to show filter options for translation
*/
function attributeList(){
	var input = {
			itemType: request.httpParameterMap.get("itemType").stringValue
		},
		attributes = require('~/cartridge/scripts/translation/GetAttributeList'),
		output;
	
	output = attributes.output(input);
	
	ISML.renderTemplate('translation/attributelist', output);
}

/**
* Gets category dropdown options of a catalog
*/
function categoryDropdown(){
	var input = {
			CatalogID: request.httpParameterMap.get("catalog").stringValue,
			ItemType: request.httpParameterMap.get("itemType").stringValue
		},
		categories = require('~/cartridge/scripts/translation/GetCategoryList'),
		output;
	
	output = categories.output(input);
	
	ISML.renderTemplate('translation/categorydropdown', output);
}

/**
* Get 'language to' list
*/
function getLanguageToList(){
	var input = {
			LanguageFrom: request.httpParameterMap.get("languageFrom").stringValue
		},
		toLanguages = require('~/cartridge/scripts/translation/GetLanguageToList'),
		output;
	
	output = toLanguages.output(input);
	
	ISML.renderTemplate('translation/languagetolist', output);
}

/**
* Gets item list in ajax call
*/
function itemList(){
	var items = require('~/cartridge/scripts/translation/GetItemList'),
		input, output;
	
	input = {
		Catalog: request.httpParameterMap.get("catalog").stringValue,
		Category: request.httpParameterMap.get("category").stringValue,
		ItemType: request.httpParameterMap.get("itemType").stringValue
	};
	output = items.output(input);
	
	ISML.renderTemplate('translation/itemlist', output);
}

/**
* Gets template response from TextMaster
*/
function getTemplatesResponse(){
	var templatesResponse = require('~/cartridge/scripts/translation/GetTemplatesResponse'),
		output = templatesResponse.output;
	
	response.getWriter().println(output);
}

/**
* Create translation document in TextMaster
*/
function createTranslation(){
	var translationCreation = require('~/cartridge/scripts/translation/CreateTranslation'),
		input, output;
	
	input = {
		ProjectID: request.httpParameterMap.get("projectID").stringValue,
		LocaleFrom: request.httpParameterMap.get("localeFrom").stringValue,
		LocaleTo: request.httpParameterMap.get("localeTo").stringValue,
		ItemType: request.httpParameterMap.get("itemType").stringValue,
		CatalogID: request.httpParameterMap.get("catalogID").stringValue,
		Attributes: request.httpParameterMap.get("attributes").stringValue,
		Items: request.httpParameterMap.get("items").stringValue,
		AutoLaunch: request.httpParameterMap.get('autoLaunch').stringValue
	};
	output = translationCreation.output(input);
	
	response.getWriter().println(output);
}

/**
* Save default attribute settings
*/
function saveDefaultAttributes(){
	var defaultAttributes = require('~/cartridge/scripts/translation/SaveDefaultAttributes'),
		input, output;
	
	input = {
		ItemType: request.httpParameterMap.get('itemType').stringValue,
		Attributes: request.httpParameterMap.get('attributes[]').values
	};
	output = defaultAttributes.output(input);
	
	response.getWriter().println(output);
}

/**
* Save API Configurations
*/
function saveAPIConfigurations(){
	var apiConfig = require('~/cartridge/scripts/translation/SetAPIConfigurations'),
		input = {
			APIKey: request.httpParameterMap.get('apiKey').stringValue,
			APISecret: request.httpParameterMap.get('apiSecret').stringValue,
			APICategory: request.httpParameterMap.get('apiCategory').stringValue,
			APICatalogID: request.httpParameterMap.get('catalogID').stringValue,
			APIEnv: request.httpParameterMap.get('apiEnv').stringValue,
			APICache: request.httpParameterMap.get('apiCache').stringValue,
			TMPageSize: request.httpParameterMap.get('tmPageSize').intValue,
			TMSFpassword: request.httpParameterMap.get('tmSFpassword').stringValue
		};
	apiConfig.output(input);
}

/*
 * If the project is autoLaunch enabled then finalize it; Else send Quote
 **/
function handleAutoLaunch(){
	var autoLaunch = require('~/cartridge/scripts/translation/HandleAutoLaunch'),
		input = {
			ProjectID: request.httpParameterMap.get('projectID').stringValue,
			AutoLaunch: request.httpParameterMap.get('autoLaunch').stringValue
		};
	autoLaunch.output(input);
}

/*
 * Loads first row of dashboard data table
 * */
function dashboardFirstRow(){
	var document = request.httpParameterMap.get('document').stringValue;
	
	ISML.renderTemplate('translation/followuptablerow', {Document: JSON.parse(document)});
}

/*
 * Gets Dashboard data for each 'Load more'
 * */
function getDashboardData(){
	var input = {
		projectPageNumber: request.httpParameterMap.get('projectPageNumber').intValue,
		docPageNumber: request.httpParameterMap.get('docPageNumber').intValue,
		projectCountInPage: request.httpParameterMap.get('projectCountInPage').intValue,
		docCountInPage: request.httpParameterMap.get('docCountInPage').intValue
	},
	followUpList, output;
	
	followUpList = require('~/cartridge/scripts/translation/GetFollowUpList')
	output = followUpList.output(input);
	
	response.getWriter().print(JSON.stringify(output));
}

/*
 * Check if API Key and Secret are valid in the API environment
 * */
function apiKeyTest(){
	var input = {
			apiKey: request.httpParameterMap.get('apiKey').stringValue,
			apiSecret: request.httpParameterMap.get('apiSecret').stringValue,
			apiEnv: request.httpParameterMap.get('apiEnv').stringValue
		},
		apiTest = require('~/cartridge/scripts/translation/APIKeyTest'),
		output = apiTest.output(input);
	
	response.getWriter().print(output);
}

/*
* Web exposed methods
*/
/**
* Calls ajax features for translation pages
*/
apiKeyTest.public = true;
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


exports.APIKeyTest = apiKeyTest;
exports.AttributeList = attributeList;
exports.CategoryDropdown =categoryDropdown;
exports.GetLanguageToList = getLanguageToList;
exports.ItemList = itemList;
exports.GetTemplatesResponse = getTemplatesResponse;
exports.CreateTranslation = createTranslation;
exports.SaveDefaultAttributes = saveDefaultAttributes;
exports.SaveAPIConfigurations = saveAPIConfigurations;
exports.HandleAutoLaunch = handleAutoLaunch;
exports.DashboardData = getDashboardData;
exports.DashboardFirstRow =dashboardFirstRow;
