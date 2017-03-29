'use strict';

/**
 * Controller that provides functions for importing translated data from TextMaster
 * @module controllers/Translation
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
	apiConfig = require('~/cartridge/scripts/translation/GetAPIConfigurations'),
	transParams = require('~/cartridge/scripts/translation/SetupTranslationParameters'),
	followUpList = require('~/cartridge/scripts/translation/GetFollowUpList');

/* Global variables */
var log = logUtils.getLogger("Translation Controller");

/**
* Form to show filter options for translation
*/
function newTranslation(){
	var registered = loginCheck();
	
	if(registered){
		app.getView().render('translation/filtertranslationitems');
	}
}

/**
* 
*/
function followUp(){
	var registered = loginCheck(),
		output;
	
	if(registered){
		output = followUpList.output;
		app.getView(output).render('translation/followupontranslation');
	}
}

/**
* Regitration link to TextMaster
*/
function register(){
	var config = apiConfig.output;
	
	app.getView(config).render('translation/entertextmaster');
}

/**
* function 'newTranslation' posts data to this function
*/
function placeOrder(){
	var input = {
			LocaleFrom: request.httpParameterMap.get("locale-from").stringValue,
			ItemType: request.httpParameterMap.get("item-type").stringValue,
			CatalogID: request.httpParameterMap.get("catalog").stringValue,
			LocaleTo: request.httpParameterMap.get("locale-to[]").values.toArray(),
			Attributes: request.httpParameterMap.get("attribute[]").values.toArray(),
			Items: request.httpParameterMap.get("item[]").values.toArray()
		},
		output;
	
	output = transParams.output(input);
	app.getView(output).render('translation/placeorder');
}

/**
* Notification page on project creation
*/
function notification(){
	var input = {
			autoLaunchCount: request.httpParameterMap.get("autoLaunchCount").intValue,
			noAutoLaunchCount: request.httpParameterMap.get("noAutoLaunchCount").intValue,
			projectID: request.httpParameterMap.get("projectID").stringValue
		};
	
	app.getView(input).render('translation/notification');
}

/**
* Default attributes settings
*/
function defaultAttributes(){
	app.getView().render('translation/defaultattributessettings');
}

/**
* Check API key and API secret entered in Site Preference
*/
function loginCheck(){
	var APIKey = Site.current.getCustomPreferenceValue("TMApiKey") || "",
		APISecret = Site.current.getCustomPreferenceValue("TMApiSecret") || "";
	
	if(APIKey == "" || APISecret == ""){
		register();
		
		return false;
	}
	
	return true;
}

/*
* Web exposed methods
*/
/**
* Calls export functionalities
*/
exports.New = guard.ensure(['get'], newTranslation);
exports.FollowUp = guard.ensure(['get'], followUp);
exports.PlaceOrder = guard.ensure(['post'], placeOrder);
exports.Notification = guard.ensure(['post'], notification);
exports.DefaultAttributes = guard.ensure(['get'], defaultAttributes);
