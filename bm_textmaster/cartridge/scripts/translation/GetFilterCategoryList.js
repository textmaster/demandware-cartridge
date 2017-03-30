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
	var catalog, rootCategory, item,
		items = pdict.ItemList,
		subCategories = [],
		categoryIDs = pdict.CategoryIDs.split(","),
		categoryID, categories, category;
	
	log = LogUtils.getLogger("GetCategoryList");
	pdict.CategoryList = [];
	
	if(pdict.ItemType == "content" || (!pdict.CatalogID && !pdict.CategoryIDs)){
		return PIPELET_NEXT;
	}
	
	switch(pdict.ItemType){
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
	
	pdict.CategoryList = subCategories;
	
	return PIPELET_NEXT;
}
