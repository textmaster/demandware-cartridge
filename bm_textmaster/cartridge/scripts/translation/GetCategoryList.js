/**
*	Gets category dropdown list of a catalog
*
*	@input CatalogID: String
*	@input ItemType: String
*
*	@output CategoryList: Array
*
*/

// API Includes
var CatalogMgr 		= require('dw/catalog/CatalogMgr');
	
// Lib Includes
var LogUtils = require('~/cartridge/scripts/utils/LogUtils'),
	Utils = require('~/cartridge/scripts/utils/Utils');

// Global variables
var log;

function execute( pdict : PipelineDictionary ) : Number {
	var input = {
		CatalogID: pdict.CatalogID,
		ItemType: pdict.ItemType
	},
	output;
	
	output = getOutput(input);
	pdict.CategoryList = output.CategoryList;
	
	return PIPELET_NEXT;
}

function getOutput(input){
	var catalog, rootCategory, subCategories = [];
	
	log = LogUtils.getLogger("GetCategoryList");
	
	if(input.CatalogID){
		catalog = CatalogMgr.getCatalog(input.CatalogID);
		rootCategory = catalog.getRoot();
		subCategories = Utils.getAllSubCategoriesHierarchy(rootCategory, input.ItemType);
	}
	
	return {
		CategoryList: subCategories
	};
}

module.exports = {
	output: function(input){
		return getOutput(input);
	}
}
