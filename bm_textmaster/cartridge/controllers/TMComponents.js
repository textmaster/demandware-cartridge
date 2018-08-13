'use strict';

/**
 * Controller that provides ajax features for translation pages
 * @module controllers/TMComponents
 */

/* API Includes */
var Pipelet  = require('dw/system/Pipelet'),
	Site  = require('dw/system/Site'),
 	Resource = require('dw/web/Resource'),
 	SGContCartridge = Site.current.getCustomPreferenceValue("TMSGController") || "";

/* Script Modules */
var app = require(SGContCartridge + '/cartridge/scripts/app'),
	guard = require(SGContCartridge + '/cartridge/scripts/guard'),
	logUtils = require('~/cartridge/scripts/utils/LogUtils'),
	utils = require('~/cartridge/scripts/utils/Utils');

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
	
	app.getView(output).render('translation/attributelist');
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
	
	app.getView(output).render('translation/categorydropdown');
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
	
	app.getView(output).render('translation/languagetolist');
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
	
	app.getView(output).render('translation/itemlist');
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
		Items: request.httpParameterMap.get("items").stringValue
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
			APICatalogID: request.httpParameterMap.get('catalogID').stringValue
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
* Web exposed methods
*/
/**
* Calls ajax features for translation pages
*/
exports.AttributeList = guard.ensure(['post'], attributeList);
exports.CategoryDropdown = guard.ensure(['get'], categoryDropdown);
exports.GetLanguageToList = guard.ensure(['post'], getLanguageToList);
exports.ItemList = guard.ensure(['post'], itemList);
exports.GetTemplatesResponse = guard.ensure(['get'], getTemplatesResponse);
exports.CreateTranslation = guard.ensure(['post'], createTranslation);
exports.SaveDefaultAttributes = guard.ensure(['post'], saveDefaultAttributes);
exports.SaveAPIConfigurations = guard.ensure(['post'], saveAPIConfigurations);
exports.HandleAutoLaunch = guard.ensure(['post'], handleAutoLaunch);
