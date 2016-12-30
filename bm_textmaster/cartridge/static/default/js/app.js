(function($){
	var app = {
			init: function(){
				if($('.new-translation').length){
					this.newTranslation();
				}
			},
			urls:{
				categoryList: "Translation-CategoryList",
				translationItemList: "Translation-ItemList"
			},
			newTranslation: function(){
				var localeFrom, item, catalog, url;
				
				$('select[name=locale-from]').on('change',function(){
					localeFrom = $(this).val();
					$('input[name=locale-to]').prop("disabled",false);
					$('#locale-to-' + localeFrom).prop("checked",false);
					$('#locale-to-' + localeFrom).prop("disabled",true);
				});
				
				$('select[name=item-type]').on('change',function(){
					item = this.value;
					if($(this).val() == "product"){
						$('.field-holder.catalog-list').addClass("show");
					}
					else{
						$('.field-holder.catalog-list').removeClass("show");
						$("select[name=catalog] option[value='']").prop("selected",true);
					}
					$('.attributes-main').removeClass("product").removeClass("category").removeClass("content");
					$('.attributes-main').addClass(item);
				});
				
				$('select[name=catalog]').on('change',function(){
					catalog = $(this).val();
					url = app.urls.categoryList + "?catalog=" + catalog;
					$.get(url, function(data){
						$('select[name=filter-category]').html(data);
					});
				});
				
				$('#filter-search').on("click", function(){
					var searchText = $(this).val(),
						itemType = $('select[name=item-type]').val(),
						catalog = $('select[name=catalog]').val(),
						onlineFlag = $('select[name=filter-online-flag]').val(),
						searchStatus = $('select[name=filter-search-status]').val(),
						category = $('select[name=filter-category]').val(),
						translatedFlag = $('select[name=filter-translated]').val(),
						postData = {
							itemType: itemType,
							catalog: catalog,
							onlineFlag: onlineFlag,
							searchStatus: searchStatus,
							category: category,
							translatedFlag: translatedFlag
						};
					
					$(this).prop("disabled",true).val("Please wait...");
					$.post(app.urls.translationItemList, postData, function(data){
						$('#items-holder').html(data);
						$('#filter-search').prop("disabled",false).val(searchText);
					});
				});
			}
	};
	
	$(document).ready(function(){
		app.init();
	});
})(jQuery);