'use strict';

/**
 * Controller that provides ajax features for translation pages
 * @module controllers/Components
 */

/* API Includes */
var Pipelet  = require('dw/system/Pipelet'),
	Site  = require('dw/system/Site'),
 	Resource = require('dw/web/Resource');

/* Script Modules */
var app = require('~/cartridge/scripts/app'),
	guard = require('~/cartridge/scripts/guard'),
	logUtils = require('~/cartridge/scripts/utils/LogUtils'),
	utils = require('~/cartridge/scripts/utils/Utils'),
	attributes = require('~/cartridge/scripts/translation/GetAttributeList'),
	categories = require('~/cartridge/scripts/translation/GetCategoryList'),
	toLanguages = require('~/cartridge/scripts/translation/GetLanguageToList'),
	items = require('~/cartridge/scripts/translation/GetItemList'),
	filterCategories = require('~/cartridge/scripts/translation/GetFilterCategoryList'),
	templatesResponse = require('~/cartridge/scripts/translation/GetTemplatesResponse'),
	translationCreation = require('~/cartridge/scripts/translation/CreateTranslation'),
	defaultAttributes = require('~/cartridge/scripts/translation/SaveDefaultAttributes'),
	apiConfig = require('~/cartridge/scripts/translation/SetAPIConfigurations');

/* Global variables */
var log = logUtils.getLogger("Translation Controller");

/**
* Form to show filter options for translation
*/
function attributeList(){
	var input = {
			itemType: request.httpParameterMap.get("itemType").stringValue
		},
		output;
	
	output = attributes.output(input);
	
	app.getView(output).render('translation/attributelist');
}

/**
* Gets category dropdown options of a catalog
*/
function categoryDropdown(){
	var input = {
			CatalogID: request.httpParameterMap.get("catalog").stringValue
		},
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
		output;
	
	output = toLanguages.output(input);
	
	app.getView(output).render('translation/languagetolist');
}

/**
* Gets item list in ajax call
*/
function itemList(){
	var input1, input2, output, output1, output2;
	
	input1 = {
		Catalog: request.httpParameterMap.get("catalog").stringValue,
		Category: request.httpParameterMap.get("category").stringValue,
		ItemType: request.httpParameterMap.get("itemType").stringValue
	};
	output1 = items.output(input1);
	
	input2 = {
		CatalogID: request.httpParameterMap.get("catalog").stringValue,
		CategoryIDs: request.httpParameterMap.get("category").stringValue,
		ItemType: request.httpParameterMap.get("itemType").stringValue,
		ItemList: output1.ItemList
	};
	output2 = filterCategories.output(input2);
	
	output = utils.mergeObjects(output1, output2);
	
	app.getView(output).render('translation/itemlist');
}

/**
* Gets template response from TextMaster
*/
function getTemplatesResponse(){
	var output = templatesResponse.output;
	
	response.getWriter().println(output);
}

/**
* Create translation document in TextMaster
*/
function createTranslation(){
	var input, output;
	
	input = {
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
	var input, output;
	
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
	var input = {
		APIKey: request.httpParameterMap.get('apiKey').stringValue,
		APISecret: request.httpParameterMap.get('apiSecret').stringValue,
		APICategory: request.httpParameterMap.get('apiCategory').stringValue,
		APICatalogID: request.httpParameterMap.get('catalogID').stringValue
	};
	apiConfig.output(input);
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
