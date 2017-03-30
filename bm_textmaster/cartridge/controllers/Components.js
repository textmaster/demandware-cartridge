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
	toLanguages = require('~/cartridge/scripts/translation/GetLanguageToList');

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

/*
* Web exposed methods
*/
/**
* Calls ajax features for translation pages
*/
exports.AttributeList = guard.ensure(['post'], attributeList);
exports.CategoryDropdown = guard.ensure(['get'], categoryDropdown);
exports.GetLanguageToList = guard.ensure(['post'], getLanguageToList);
