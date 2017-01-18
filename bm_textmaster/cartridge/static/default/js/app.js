(function($){
	var app = {
			init: function(){
				if($('.new-translation').length){
					this.newTranslation();
				}
				
				if($('.place-order').length){
					this.placeOrder();
				}
			},
			urls:{
				categoryDropdown: "Components-CategoryDropdown",
				translationItemList: "Components-ItemList",
				attributeList: "Components-AttributeList",
				getTemplatesResponse: "Components-GetTemplatesResponse",
				createTranslation: "Components-CreateTranslation"
			},
			newTranslation: function(){
				var localeFrom, itemType, catalog, url, postData;
				
				$('select[name=locale-from]').on('change',function(){
					localeFrom = $(this).val();
					$('input[name="locale-to[]"]').prop("disabled",false);
					$('#locale-to-' + localeFrom).prop("checked",false);
					$('#locale-to-' + localeFrom).prop("disabled",true);
				});
				
				$('select[name=item-type]').on('change',function(){
					itemType = this.value;
					if($(this).val() == "product" || $(this).val() == "category"){
						$('.field-holder.catalog-list').addClass("show");
						$('.filter-items .category').removeClass('hide');
					}
					else{
						$('.field-holder.catalog-list').removeClass("show");
						$("select[name=catalog] option[value='']").prop("selected",true);
						$('.filter-items .category').addClass('hide');
					}
					
					if($(this).val() == "category"){
						$('.filter-items .search-status').addClass('hide');
					}
					else{
						$('.filter-items .search-status').removeClass('hide');
					}
					
					postData = {itemType: app.utils.firstLetterCapital(itemType)};
					$('.attributes-main').html("");
					$.post(app.urls.attributeList, postData, function(data){
						$('.attributes-main').html(data);
						
						if($('input[type=checkbox][name="attribute[]"]:checked').length == 0){
							$('.attributes-holder').addClass("show-all");
						}
						else{
							$('.attributes-holder').removeClass("show-all");
						}
					});
					
					$(this).removeClass('error-field');
					$('#items-holder').html('');
				});
				
				$('select[name=catalog]').on('change',function(){
					catalog = $(this).val();
					url = app.urls.categoryDropdown + "?catalog=" + catalog;
					$.get(url, function(data){
						$('select[name=filter-category]').html(data);
					});
					$(this).removeClass('error-field');
				});
				
				$('select[name=filter-category]').on('change',function(){
					$(this).removeClass('error-field');
				});
				
				$('.new-translation').on('click', '.show-all-attributes input[type=button]', function(){
					$('.attributes-holder').addClass("show-all");
					$('.show-default-attributes').addClass("show");
				});
				
				$('.new-translation').on("click", '.show-default-attributes input[type=button]', function(){
					$('.attributes-holder').removeClass("show-all");
					$('.show-default-attributes').removeClass("show");
					$('.attributes-holder > li:not(.default) input[type=checkbox]:checked').prop("checked", false);
				});
				
				$('#filter-search').on("click", function(){
					var searchText = $(this).val(),
						itemType = $('select[name=item-type]').val(),
						catalog = $('select[name=catalog]').val(),
						onlineFlag = $('select[name=filter-online-flag]').val(),
						searchStatus = $('select[name=filter-search-status]').val(),
						category = $('select[name=filter-category]').val(),
						translatedFlag = $('select[name=filter-translated]').val(),
						error = false,
						postData = {
							itemType: itemType,
							catalog: catalog,
							onlineFlag: onlineFlag,
							searchStatus: searchStatus,
							category: category,
							translatedFlag: translatedFlag
						};
					
					if(itemType == ""){
						$('select[name=item-type]').addClass('error-field');
						error = true;
					}
					else if(itemType != "content" && catalog == ""){
						$('select[name=catalog]').addClass('error-field');
						$('select[name=filter-category]').addClass('error-field');
						error = true;
					}
					
					if(error){
						$('.common-error.search').addClass('show');
						return false;
					}
					
					$('.common-error.search').removeClass('show');
					$(this).prop("disabled",true).val("Please wait...");
					$.post(app.urls.translationItemList, postData, function(data){
						$('#items-holder').html(data);
						$('#filter-search').prop("disabled",false).val(searchText);
					});
				});
				
				$('#button-select-all').on('click',function(){
					$('input[type="checkbox"][name="item[]"]').prop("checked",true);
				});
				
				$('#button-deselect-all').on('click',function(){
					$('input[type="checkbox"][name="item[]"]').prop("checked",false);
				});
				
				$('#filter-item-form').on('submit',function(){
					var errors = ["Fix following errors"], message = "", ul = $('<ul>'), itemType;
					
					if($('select[name=locale-from]').val() == ""){
						errors.push("- Select source language");
					}
					
					itemType = $('select[name=item-type]').val();
					if(itemType == ""){
						errors.push("- Select item type");
					}
					
					if($('input[name="locale-to[]"]:checked').length == 0){
						errors.push("- Select target language(s)");
					}
					
					if(itemType != "" && $('input[type="checkbox"][name="attribute[]"]:checked').length == 0){
						errors.push("- Select attribute(s)");
					}
					
					if($('input[type="checkbox"][name="item[]"]:checked').length == 0){
						errors.push("- Select item(s)");
					}
					
					if(errors.length > 1){
						errors.forEach(function(error){
							ul.append('<li>'+ error +'</li>');
						});
						
						$('.submit-error').html(ul);
						return false;
					}
					
					$('.submit-error').html("");
					$('#filter-item-submit').prop("disabled",true).val("Please wait...");
				});
			},
			placeOrder: function(){
				var result, transParams, localeFrom, localeTo, templates, listHolder, postData, select, count, autoLaunchCount, noAutoLaunchCount;
				
				transParams = JSON.parse($('#hidden-values').text());
				
				$('#reload-templates').on('click',function(){
					$.get(app.urls.getTemplatesResponse, function(data){
						result = JSON.parse(data);
						$('.template-list-holder').each(function(){
							listHolder = $(this);
							templates = [];
							localeFrom = $(this).attr('data-locale-from');
							localeTo = $(this).attr('data-locale-to');
							
							if(result.api_templates != undefined && result.api_templates.length > 0){
								result.api_templates.forEach(function(temp){
									if(temp.language_from == localeFrom && temp.language_to == localeTo){
										templates.push({
											id: temp.id,
											name: temp.name,
											autoLaunch: temp.auto_launch
										});
									}
								});
							}
							
							if(templates.length > 0){
								select = $('<select multiple></select>');
								
								templates.forEach(function(temp) {
									select.append($('<option value="'+ temp.id +'" data-auto-launch="'+ temp.autoLaunch +'">'+ temp.name +'</option>'));
								});
								
								listHolder.append(select);
							}
						});
					});
				});
				
				$('#place-order').on("click", function(){
					var error = "";
					
					if($('.template-list-holder select').length == 0){
						error = "Templates could not be found";
					}
					else{
						$('.template-list-holder select').each(function(){
							if($(this).find('option:selected').length == 0){
								error = "Select template";
							}
						});
					}
					
					if(error != ""){
						$('.submit-error').text("Error: " + error);
					}
					else{
						$(this).prop("disabled", true);
						$(this).val("Please wait...");
						
						$('.submit-error').text("");
						autoLaunchCount = 0;
						noAutoLaunchCount = 0;
						
						for(count = 0;count < transParams.localeTo.length; count++){
							localeTo = transParams.localeTo[count];
							templates = [];
							
							$('#template-list-holder-'+ transParams.localeFrom.id +'-'+ localeTo.id).find('select option:selected').each(function(){
								templates.push($(this).val());
								if($(this).attr('data-auto-launch') == "true"){
									autoLaunchCount++;
								}
								else{
									noAutoLaunchCount++;
								}
							});
							
							transParams.localeTo[count].templates = templates;
						}
						
						postData = {
							localeFrom: JSON.stringify(JSON.stringify(transParams.localeFrom)),
							localeTo: JSON.stringify(transParams.localeTo),
							itemType: transParams.itemType,
							attributes: JSON.stringify(transParams.attributes),
							items: JSON.stringify(transParams.items)
						};
						
						$.post(app.urls.createTranslation, postData, function(data){
							$('input[name=autoLaunchCount]').val(autoLaunchCount);
							$('input[name=noAutoLaunchCount]').val(noAutoLaunchCount);
							$('#notification-form').submit();
						});
					}
				});
				
				$('#reload-templates').trigger("click");
			},
			utils: {
				firstLetterCapital: function(str){
					return str.charAt(0).toUpperCase() + str.slice(1);
				}
			}
	};
	
	$(document).ready(function(){
		app.init();
	});
})(jQuery);