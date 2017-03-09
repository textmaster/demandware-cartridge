(function($){
	var app = {
			init: function(){
				if($('.new-translation').length){
					this.newTranslation();
				}
				
				if($('.place-order').length){
					this.placeOrder();
				}
				
				if($('.default-attributes').length){
					this.setDefaultAttributes();
				}
				
				if($('.registration').length){
					this.registration();
				}
				
				if($('.followup').length){
					this.followup();
				}
			},
			urls:{
				getLanguageToList: "Components-GetLanguageToList",
				categoryDropdown: "Components-CategoryDropdown",
				translationItemList: "Components-ItemList",
				attributeList: "Components-AttributeList",
				getTemplatesResponse: "Components-GetTemplatesResponse",
				createTranslation: "Components-CreateTranslation",
				saveDefaultAttributes: "Components-SaveDefaultAttributes",
				saveAPIConfigurations: "Components-SaveAPIConfigurations"
			},
			newTranslation: function(){
				var localeFrom, itemType, catalog, url, postData;
				
				$('select[name=locale-from]').on('change',function(){
					localeFrom = $(this).val();
					$('ul.select-locale-to').html('');
					
					$.post(app.urls.getLanguageToList, {languageFrom:localeFrom}, function(data){
						$('.input-holder.locale-to').html(data);
					});
				});
				
				$('select[name=item-type]').on('change',function(){
					itemType = this.value;
					if($(this).val() == "product" || $(this).val() == "category"){
						$('.field-holder.catalog-list').addClass("show");
						$('.category').addClass('show');
					}
					else{
						$('.field-holder.catalog-list').removeClass("show");
						$("select[name=catalog] option[value='']").prop("selected",true);
						$('ul.select-category').html('');
						$('.category').removeClass('show');
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
					$('.common-error.search').removeClass('show');
					$('#items-holder').html('');
				});
				
				$('select[name="catalog"]').on('change',function(){
					catalog = $(this).val();
					$('ul.select-category').html('');
					$('.common-error.search').removeClass('show');
					url = app.urls.categoryDropdown + "?catalog=" + catalog;
					$.get(url, function(data){
						$('.input-holder.category').html(data);
					});
					$(this).removeClass('error-field');
				});
				
				$('.input-holder.category').on('click', '#category-select-all', function(){
					if($(this).is(':checked')){
						$('input[name="category[]"]').prop("checked",true);
					}
					else{
						$('input[name="category[]"]').prop("checked",false);
					}
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
						category = [],
						error = false,
						postData;
					
					$('input[type="checkbox"][name="category[]"]:checked').each(function(){
						category.push($(this).val());
					});
					
					postData = {
						itemType: itemType,
						catalog: catalog,
						category: category.join(",")
					};
					
					if(itemType == ""){
						$('select[name=item-type]').addClass('error-field');
						error = true;
					}
					else if(itemType != "content"){
						if(catalog == ""){
							$('select[name=catalog]').addClass('error-field');
							error = true;
						}
						if(category.length == 0){
							error = true;
						}
					}
					
					if(error){
						$('.common-error.search').addClass('show');
						return false;
					}
					
					$('.items .ajax-loader').addClass('show');
					$('.common-error.search').removeClass('show');
					$(this).prop("disabled",true).val("Please wait...");
					$.post(app.urls.translationItemList, postData, function(data){
						$('#items-holder').html(data);
						$('#filter-search').prop("disabled",false).val(searchText);
						$('.items .ajax-loader').removeClass('show');
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
					
					itemType = $('select[name=item-type]').val();
					if(itemType == ""){
						errors.push("- Select item type");
					}
					
					if($('select[name=locale-from]').val() == ""){
						errors.push("- Select source language");
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
				var result, transParams, localeFrom, localeTo, templateSelect, templates, listHolder, postData, select, count, autoLaunchCount, noAutoLaunchCount;
				
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
								select = $('<select></select>');
								select.append($('<option value="" data-auto-launch=""></option>'));
								
								templates.forEach(function(temp) {
									select.append($('<option value="'+ temp.id +'" data-auto-launch="'+ temp.autoLaunch +'">'+ temp.name +'</option>'));
								});
								
								listHolder.html(select);
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
							if($(this).val() == ""){
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
							templateSelect = $('#template-list-holder-'+ transParams.localeFrom.id +'-'+ localeTo.id).find("select");
							transParams.localeTo[count].template = templateSelect.val();
							transParams.localeTo[count].autoLaunch = false;
							
							if(templateSelect.find("option:selected").attr('data-auto-launch') == "true"){
								autoLaunchCount++;
								transParams.localeTo[count].autoLaunch = true;
							}
							else{
								noAutoLaunchCount++;
							}
						}
						
						postData = {
							localeFrom: JSON.stringify(JSON.stringify(transParams.localeFrom)),
							localeTo: JSON.stringify(transParams.localeTo),
							itemType: transParams.itemType,
							catalogID: transParams.catalogID,
							attributes: JSON.stringify(transParams.attributes),
							items: JSON.stringify(transParams.items)
						};
						
						$.post(app.urls.createTranslation, postData, function(data){
							$('input[name=autoLaunchCount]').val(autoLaunchCount);
							$('input[name=noAutoLaunchCount]').val(noAutoLaunchCount);
							$('input[name=projectID]').val(data);
							$('#notification-form').submit();
						});
					}
				});
				
				$('#reload-templates').trigger("click");
			},
			setDefaultAttributes: function(){
				$('select[name=attribute-item-type]').on('change',function(){
					itemType = this.value;
					
					postData = {itemType: app.utils.firstLetterCapital(itemType)};
					$('.attributes-main').html("");
					$.post(app.urls.attributeList, postData, function(data){
						$('.attributes-main').html(data);
					});
					
					$(this).removeClass('error-field');
					$('.submit-error').text("");
				});
				
				$('#attributes-save').on('click', function(){
					var error = "", postData = {}, attributes = [], defaultValueString = "", checkedValueString = "",
						errorHolder = $('.submit-error'),
						button = $(this),
						buttonCaption = button.val();
					
					if($('input[name="attribute[]"]:checked').length == 0){
						error = "Select attributes";
					}
					else{
						$('li.default input[name="attribute[]"]').each(function(){
							defaultValueString += this.value.split("|")[0];
						});
						
						$('input[name="attribute[]"]:checked').each(function(){
							checkedValueString += this.value.split("|")[0];
						});
						
						if(defaultValueString == checkedValueString){
							error = "Change attribute selection";
						}
					}
					
					errorHolder.text(error);
					
					if(error == ""){
						button.val("Please wait...");
						button.prop("disabled", true);
						
						$('input[name="attribute[]"]:checked').each(function(){
							attributes.push(this.value);
						});
						
						postData.itemType = $('select[name=attribute-item-type]').val();
						postData.attributes = attributes;
						
						$.post(app.urls.saveDefaultAttributes, postData, function(data){
							$('.success-message').addClass('show');
							$('.attributes-holder li.default').removeClass('default');
							$('input[name="attribute[]"]:checked').closest('li').addClass('default');
							button.val(buttonCaption);
							button.prop("disabled", false);
							
							setTimeout(function(){
								$('.success-message').removeClass('show');
							}, 3000);
						});
					}
				});
			},
			registration: function(){
				$('#api-config-save').on("click",function(){
					var apiKey = $('input[name=api-key]').val().trim(),
						apiSecret = $('input[name=api-secret]').val().trim(),
						apiCategory = $('select[name=api-category]').val(),
						postData;
					
					if(apiKey == "" || apiSecret == "" || apiCategory == ""){
						$('.error').text("All fields are required");
						return false;
					}
					
					$('.error').text("");
					postData = {
						apiKey: apiKey,
						apiSecret: apiSecret,
						apiCategory: apiCategory
					};
					$.post(app.urls.saveAPIConfigurations, postData, function(data){
						$('.success-message').addClass('show');
						
						setTimeout(function(){
							$('.success-message').removeClass('show');
						}, 3000);
					});
				});
			},
			followup: function(){
				$('.status-diagram').insertAfter('.followup h1');
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