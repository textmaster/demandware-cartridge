/**
*	Gets category checkbox list for item filter 
*
*	@input CatalogID: String
*	@input CategoryIDs: String
*	@input ItemType: String
*	@input ItemList: Array
*
*	@output CategoryList: Array
*
*/

// API Includes
var CatalogMgr = require('dw/catalog/CatalogMgr');
	
// Lib Includes
var LogUtils = require('~/cartridge/scripts/utils/LogUtils'),
	Utils = require('~/cartridge/scripts/utils/Utils');

// Global variables
var log;

function execute( pdict : PipelineDictionary ) : Number {
	var input, output;
	
	input = {
		CatalogID: pdict.CatalogID,
		CategoryIDs: pdict.CategoryIDs,
		ItemType: pdict.ItemType,
		ItemList: pdict.ItemList
	};
	output = getOutput(input);
	pdict.CategoryList = output.CategoryList;
	
	return PIPELET_NEXT;
}

function getOutput(input){
	var catalog, rootCategory, item,
		items = input.ItemList,
		subCategories = [],
		categoryIDs = input.CategoryIDs.split(","),
		categoryID, categories, category;
	
	log = LogUtils.getLogger("GetCategoryList");
	
	if(input.ItemType == "content" || (!input.CatalogID && !input.CategoryIDs)){
		return {
			CategoryList: []
		};
	}
	
	switch(input.ItemType){
		case "product":
			for each(item in items){
				if(!(Utils.isCategoryExistInList(subCategories, item.primaryCategory))){
					subCategories.push(item.primaryCategory);
				}
			}
			break;
		case "category":
			for each(categoryID in categoryIDs){
				rootCategory = CatalogMgr.getCategory(categoryID);
				subCategories.push(rootCategory);
				categories = Utils.getFilterSubCategories(rootCategory);
				
				for each(category in categories){
					if(!(Utils.isCategoryExistInList(subCategories, category))){
						subCategories.push(category);
					}
				}
			}
			break;
	}
	
	return {
		CategoryList: subCategories
	}
}

module.exports = {
	output: function(input){
		return getOutput(input);
	}
}
