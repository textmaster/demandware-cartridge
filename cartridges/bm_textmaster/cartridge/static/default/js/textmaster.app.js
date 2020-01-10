(function($){
	var $ = $.noConflict();
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
					this.registration.init();
				}

				if($('.followup').length){
					this.followup.init();
				}

				if($('.language-mapping').length){
					this.languageMapping.init();
				}
			},
			urls:{
				apiKeyTest: "TMComponents-APIKeyTest",
				attributeList: "TMComponents-AttributeList",
				categoryDropdown: "TMComponents-CategoryDropdown",
				createTranslation: "TMComponents-CreateTranslation",
				getLanguageToList: "TMComponents-GetLanguageToList",
				getTemplatesResponse: "TMComponents-GetTemplatesResponse",
				handleAutoLaunch: "TMComponents-HandleAutoLaunch",
				saveAPIConfigurations: "TMComponents-SaveAPIConfigurations",
				saveDefaultAttributes: "TMComponents-SaveDefaultAttributes",
				translationItemList: "TMComponents-ItemList",
				dashboardData: "TMComponents-DashboardData",
				dashboardFirstRow: "TMComponents-DashboardFirstRow",
				newMappingRow:"TMLanguageMapping-NewMappingRow",
				saveLanguageMapping:"TMLanguageMapping-SaveLanguageMapping",
				deleteRowMapping: "TMLanguageMapping-DeleteLanguageMappingRow"
			},
			newTranslation: function(){
				var localeFrom, itemType, catalog, url, postData, items = [], itemID, errorTimeID,
					itemsLimit = $('#itemsLimit').val();
				
				itemsLimit = parseInt(itemsLimit, 10);
				
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

						if($('select[name="catalog"]').val() != ""){
							$('select[name="catalog"]').trigger('change');
						}
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
					itemType = $('select[name=item-type]').val();
					$('ul.select-category').html('');
					$('.common-error.search').removeClass('show');
					
					if(catalog != ""){
						url = app.urls.categoryDropdown + "?catalog=" + catalog + "&itemType=" + itemType;
						$.get(url, function(data){
							$('.input-holder.category').html(data);
						});
						$(this).removeClass('error-field');
					}
				});
				
				$('.input-holder.category').on('click', '#category-select-all', function(){
					$('input[name="category[]"]').prop("checked", $(this).is(':checked'));
				}).on('click', 'input[name="category[]"]', function(){
					var parentLi = $(this).closest('li');
					
					parentLi.find('ul li input[name="category[]"]').prop("checked", $(this).is(':checked'));
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
						$('.common-error.search').text(itemType == "" ? "Select Item type" : (catalog == "" ? "Select Catalog" : "Select Categories"));
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
				
				$('#items-holder').on('click','input[type="checkbox"][name="item[]"]',function(){
					itemID = $(this).val();
					
					if($(this).prop("checked")){
						var itemAdded = addItem(itemID);
						if(!itemAdded){
							$(this).prop("checked", false);
						}
					}
					else{
						removeItem(itemID);
					}
				});
				
				var addItem = function(itemID){
					if(items.length < itemsLimit){
						if(items.indexOf(itemID) < 0){
							items.push(itemID);
						}
						return true;
					}
					else{
						$('.items-limit-error').addClass('show');
						clearTimeout(errorTimeID);
						errorTimeID = setTimeout(function(){
							$('.items-limit-error').removeClass('show');
						}, 4000);
						return false;
					}
				};
				
				var removeItem = function(itemID){
					var index = items.indexOf(itemID);
					$('.items-limit-error').removeClass('show');
					
					if(index > -1){
						items.splice(index, 1);
					}
				};
				
				$('#button-select-all').on('click',function(){
					var itemAdded;
					
					$('input[type="checkbox"][name="item[]"]').each(function(){
						itemID = $(this).val();
						itemAdded = addItem(itemID);
						
						if(itemAdded){
							$(this).prop("checked", true);
						}
						else{
							return false;
						}
					});
				});
				
				$('#button-deselect-all').on('click',function(){
					$('input[type="checkbox"][name="item[]"]').prop("checked",false);
					
					$('input[type="checkbox"][name="item[]"]').each(function(){
						itemID = $(this).val();
						removeItem(itemID);
					});
				});
				
				$('#filter-item-form').on('submit',function(){
					var errors = ["Fix following errors"], ul = $('<ul>'), itemType;
					
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
					
					if(items.length == 0){
						errors.push("- Select item(s)");
					}
					
					if(errors.length > 1){
						errors.forEach(function(error){
							ul.append('<li>'+ error +'</li>');
						});
						
						$('.submit-error').html(ul);
						return false;
					}
					
					$('input[name=items]').val(items.join(","));
					$('.submit-error').html("");
					$('#filter-item-submit').prop("disabled",true).val("Please wait...");
				});
				
				if($('select[name=locale-from] option').length == 1){
					//Populate To Language List if only one language is on From Language list
					$('select[name=locale-from]').trigger('change');
				}
			},
			placeOrder: function(){
				var result, transParams, localeFrom, localeTo, templateSelect, templates, listHolder, select, count, autoLaunchCount, noAutoLaunchCount;
				
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
							transParams.localeTo[count].template = {
								id: templateSelect.val(),
								name: templateSelect.find("option:selected").text()
							};
							transParams.localeTo[count].autoLaunch = false;
							
							if(templateSelect.find("option:selected").attr('data-auto-launch') == "true"){
								autoLaunchCount++;
								transParams.localeTo[count].autoLaunch = true;
							}
							else{
								noAutoLaunchCount++;
							}
						}
						
						transParams.projectIDs = [];
						transParams.projectID = "";
						transParams.itemLimit = $('input#itemrequestlimit').val();
						transParams.itemLimit = isNaN(transParams.itemLimit) ? 20 : transParams.itemLimit;
						transParams.itemProgress = 0;
						transParams.localeCount = 0;
						transParams.itemCount = 0;
						transParams.autoLaunchCount = autoLaunchCount;
						transParams.noAutoLaunchCount = noAutoLaunchCount
						
						app.triggerExportRequest(transParams);
						$('#progress-holder').show();
					}
				});
				
				$('#reload-templates').trigger("click");
			},
			triggerExportRequest: function(transParams){
				var localeTo, items, postData;
				
				if(transParams.itemCount == transParams.items.length){
					localeTo = transParams.localeTo[transParams.localeCount];
					postData = {
						projectID: transParams.projectID,
						autoLaunch: localeTo.autoLaunch
					};
					
					$.ajax({
						type: 'POST',
						url: app.urls.handleAutoLaunch,
						data: postData,
						success: function(output){
							//no actions
						}
					});
					
					transParams.localeCount++;
					transParams.itemCount = 0;
					transParams.projectID = "";
				}
				
				if(transParams.itemProgress >= transParams.items.length * transParams.localeTo.length){
					$('input[name=autoLaunchCount]').val(transParams.autoLaunchCount);
					$('input[name=noAutoLaunchCount]').val(transParams.noAutoLaunchCount);
					$('input[name=projectID]').val(transParams.projectIDs.length == 1 ? transParams.projectIDs[0] : "");
					$('#notification-form').submit();
				}
				else{
					localeTo = transParams.localeTo[transParams.localeCount];
					
					items = transParams.items.slice(transParams.itemCount, (transParams.itemCount + transParams.itemLimit));
					transParams.itemCount += items.length;
					postData = {
						projectID: transParams.projectID,
						localeFrom: transParams.localeFrom.id,
						localeTo: JSON.stringify(localeTo),
						itemType: transParams.itemType,
						catalogID: transParams.catalogID,
						attributes: JSON.stringify(transParams.attributes),
						items: JSON.stringify(items),
						autoLaunch: localeTo.autoLaunch
					};

					transParams.itemProgress += items.length;
					var itemsSize = transParams.items.length * transParams.localeTo.length;
					
					$.ajax({
						type: 'POST',
						url: app.urls.createTranslation,
						data: postData,
						success: function(output){
							transParams.projectID = output;
							
							if(transParams.projectIDs.indexOf(output) < 0){
								transParams.projectIDs.push(output);
							}
							
							var itemsSize = transParams.items.length * transParams.localeTo.length;
							app.updateTranslationProgress(itemsSize, transParams.itemProgress);
							
							setTimeout(function(){
								app.triggerExportRequest(transParams);
							}, 1500);
						}
					});
				}
			},
			updateTranslationProgress: function(itemsSize, itemProgress){
				var percent = (itemProgress / itemsSize) * 100;
				
				$('#progress-holder .progress-bar').css("width", percent + "%");
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
			registration: {
				data: {},
				saveButton: {},
				saveButtonLabel: "",
				init: function(){
					var reg = this;
					
					$('.api-config-save').on("click",function(){
						$('.error').html('');
						reg.saveButton = $('input.api-config-save');
						reg.saveButton.prop('disabled', true);
						reg.saveButtonLabel = reg.saveButton.val();
						reg.saveButton.val('Please wait...');
						
						reg.setData();
						
						if(reg.validate()){
							reg.saveData();
						}
						else{
							reg.saveButton.val(reg.saveButtonLabel);
							reg.saveButton.prop('disabled', false);
						}
					});
					
					$('a#reg-link').on('click',function(){
						$('.error').html('');
						var apiEnv = $('select[name=api-env]').val();
						var backOfficeLink = $('input[name=backoffice-base' + apiEnv + 'url]').val();

						if ($.trim(backOfficeLink) === '') {
							$('.error').html('Backoffice Base URL (' + app.utils.firstLetterCapital(apiEnv) + ') is required');
							return false;
						}	
						
						var signinLink = $(this).data('signin-link');
						$(this).attr('href', backOfficeLink + signinLink);
					});
				},
				setData: function(){
					var data = this.data;
					data.apiKey = $('input[name=api-key]').val().trim();
					data.apiSecret = $('input[name=api-secret]').val().trim();
					data.apiCategory = $('select[name=api-category]').val();
					data.catalogID = $('input[name=api-catalog-id]').val().trim();
					data.apiEnv = $('select[name=api-env]').val();
					data.apiCache = $('select[name=api-cache]').val();
					data.tmPageSize = $('input[name=api-page-size]').val().trim();
					data.tmSFpassword = $('input[name=sf-password]').val();
					data.tmApiBaseUrlDemo = $('input[name=api-basedemourl]').val();
					data.tmApiBaseUrlLive = $('input[name=api-baseliveurl]').val();
					data.tmBackofficeBaseUrlLive = $('input[name=backoffice-baseliveurl]').val();
					data.tmBackofficeBaseUrlDemo = $('input[name=backoffice-basedemourl]').val();
					data.tmApiVersionUrlDemo = $('input[name=api-versiondemourl]').val();
					data.tmApiVersionUrlLive = $('input[name=api-versionliveurl]').val();
				},
				validate: function(){
					var errorMessages = [],
						data = this.data;
					
					if(data.apiKey == ""){
						errorMessages.push("API Key is required");
					}
					
					if(data.apiSecret == ""){
						errorMessages.push("API Secret is required");
					}
					
					if(data.apiCategory == "" && $('select[name=api-category] option').length > 1){
						errorMessages.push("Store Category is required");
					}
					
					if(data.catalogID == ""){
						errorMessages.push("Master Catalog ID is required");
					}
					
					if(data.tmPageSize == ""){
						errorMessages.push("Dashboard Data Size is required");
					}
					else if(isNaN(data.tmPageSize)){
						errorMessages.push("Dashboard Page Size must be a number");
					}
					else if(parseInt(data.tmPageSize, 10) < 10){
						errorMessages.push("Dashboard Page Size minimum value is 10");
					}
					
					if(data.tmApiBaseUrlDemo == ""){
						errorMessages.push("API Base URL (Demo) is required");
					}
					
					if(data.tmApiVersionUrlDemo == ""){
						errorMessages.push("API Version (Demo) is required");
					}

					if(data.tmBackofficeBaseUrlDemo == ""){
						errorMessages.push("Backoffice Base URL (Demo) is required");
					}
					
					if(data.tmApiBaseUrlLive == ""){
						errorMessages.push("API Base URL (Live) is required");
					}

					if(data.tmApiVersionUrlLive == ""){
						errorMessages.push("API Version (Live) is required");
					}
					
					if(data.tmBackofficeBaseUrlLive == ""){
						errorMessages.push("Backoffice Base URL (Live) is required");
					}
					
					if(errorMessages.length == 0){
						//Check if API Key and Secret are valid in the API environment
						$.ajax({
							type: 'POST',
							url: app.urls.apiKeyTest,
							data: data,
							async: false,
							success: function(output){
								if(output.toLowerCase() != "success"){
									errorMessages.push('API Key OR Secret OR Base URL (' + app.utils.firstLetterCapital(data.apiEnv) + ') is invalid');
								}
							}
						});
					}
					
					app.registration.showErrorMessages(errorMessages);
					
					return errorMessages.length === 0; //true | false
				},
				showErrorMessages: function(errorMessages) {
					if(errorMessages.length > 0){
						var htmlMessage = "";
						errorMessages.forEach(function(message){
							htmlMessage += message + '<br>';
						});
						$('.error').html(htmlMessage);
					}
				},
				saveData: function(){
					var reg = this;
					
					reg.saveButton.prop('disabled', true);
					reg.saveButton.val('Please wait...');
					
					$.post(app.urls.saveAPIConfigurations, reg.data, function(){
						$('.success-message').addClass('show');
						reg.saveButton.val(reg.saveButtonLabel);
						reg.saveButton.prop('disabled', false);

						setTimeout(function(){
							$('.success-message').removeClass('show');
						}, 3000);
					});
				}
			},
			followup:{
				dataTable: {},
				config: {
					projectPageNumber: 0,
			   		docPageNumber: 0,
			   		projectCountInPage: 0,
			   		docCountInPage: 0,
			   		showMore: true,
			   		lastPage: 0
				},
				statusValues: {
					creation: 0,
					progress: 0,
					review: 0,
					completed: 0
				},
				init: function(){
					var tooltip;
					
					$('.status-diagram').insertAfter('.followup h1');
					
					$('.followup').on("mousedown","a.review-link", function(){
						tooltip = $(this).attr("title");
						$(this).closest('li').append('<span class="tooltip">'+ tooltip +'</span>');
					})
					.on("mouseup","a.review-link", function(){
						$('span.tooltip').remove();
					});
					
					this.loadData(true);
				},
				loadData: function(initialLoad){
					var follow = this,
						button = $('.followup .load-more input[type=button]');
					
					button.prop('disabled', true);
					button.val('Loading...');
					
					$.post(app.urls.dashboardData, follow.config, function(data){
						try{
							var output = JSON.parse(data),
								documents = output.Documents,
								firstDocument;
							
							follow.config.docCountInPage = output.DocCountInPage;
							follow.config.docPageNumber = output.DocPageNumber;
							follow.config.projectCountInPage = output.ProjectCountInPage;
							follow.config.projectPageNumber = output.ProjectPageNumber;
							follow.config.showMore = output.ShowMore;
							
							if(initialLoad && documents.length){
								firstDocument = documents[0];
								//load DataTables with one row
								$.post(app.urls.dashboardFirstRow, {document: JSON.stringify(firstDocument)}, function(data){
									$('#filtertableProjects tbody').html(data);
									
									var retry = true;
									
									while(retry){
										if(window.dataTablesLoaded){
											follow.dataTable = window.tmjdt("#filtertableProjects").DataTable( {
										        "order": [[ 1, "desc" ]]
										    } );
											
											retry = false;
										}
									}
									//remove the only one row and add all the rows
									follow.dataTable.row(':eq(0)').remove().draw();
									follow.populateMoreData(documents);
									follow.showMoreButton();
									follow.customEvents();
								});
							}
							else if(documents.length){
								follow.config.lastPage = parseInt($('#filtertableProjects_paginate span a.paginate_button:last-of-type').text(), 10);
								follow.populateMoreData(documents);
							}
							else {
								$('#filtertableProjects .ajax-loader').text("No records").css('padding-top','40px');
							}
						}
						catch(err){
							alert("Error on loading data: "+ err.message);
						}
					});
				},
				
				populateMoreData: function(documents){
					var docTitle, createdAt, datePart, timePart, hour, minute, docDate, itemID, itemName, itemType, docLocale, docStatus, actions,
						follow = this;
						
					documents.forEach(function(document){
						docTitle = document.project_name + document.project_launch_date;
						createdAt = document.created_at.full;
						datePart = createdAt && createdAt.indexOf(' ') > -1 ? createdAt.split(' ')[0] : '';
						timePart = createdAt && createdAt.indexOf(' ') > -1 ? createdAt.split(' ')[1] : '';
						hour = timePart ? timePart.split(':')[0] : '00';
						minute = timePart ? timePart.split(':')[1] : '00';
						docDate = datePart + " " + hour + ":" + minute;
						itemID = document.custom_data.item && document.custom_data.item.id ? document.custom_data.item.id : "";
						itemName = document.custom_data && document.custom_data.item && document.custom_data.item.name ? document.custom_data.item.name : "";
						itemType = document.item_type ? document.item_type : "";
						docLocale = document.locale;
						docStatus = document.status;
						
						actions = '<ul>';
						document.actions.forEach(function(action){
							actions += '<li><a ' + (action.link ? 'href="'+ action.link +'" target="_blank"' : '') +' class="review-link" title="'+ (action.title ? action.title : '') + '">' + action.text +'</a></li>';
						});
						actions += '</ul>';
						
						follow.dataTable.row.add([docTitle, docDate, itemID, itemName, itemType, docLocale, docStatus, actions]).draw();
						
						if(docStatus){
							switch(docStatus.toLowerCase()){
								case "in_creation":
									follow.statusValues.creation++;
									break;
								case "in_progress":
								case "incomplete":
									follow.statusValues.progress++;
									break;
								case "in_review":
									follow.statusValues.review++;
									break;
								case "completed":
									follow.statusValues.completed++;
									break;
							}
						}
					});
					//show first page in next set of loaded data
					var lastPage = parseInt($('#filtertableProjects_paginate span a.paginate_button:last-of-type').text(), 10);
					follow.dataTable.page(follow.config.lastPage == lastPage ? (follow.config.lastPage - 1) : follow.config.lastPage).draw(false);
					follow.populateStatusDiagram();
				},
				populateStatusDiagram: function(){
					var follow = this,
						statusObj = follow.statusValues,
						total = statusObj.creation + statusObj.progress + statusObj.review + statusObj.completed;
					
					for(var key in statusObj){
						$('.status-diagram table td.' + key + ' .count').text(statusObj[key]);
						$('.status-diagram table td.' + key + ' .percent').text(Math.round(statusObj[key] / total * 100) + '%');
					}
				},
				customEvents: function(){
					var follow = this;
					
					follow.dataTable.on('draw', function(){
						follow.showMoreButton();
					});
					
					$('.followup .load-more input[type=button]').on('click', function(){
						follow.loadData(false);
					});
				},
				showMoreButton: function(){
					if($('#filtertableProjects_paginate span a.paginate_button:last-of-type').hasClass('current')
							&& $('#filtertableProjects_filter input[type=search]').val() == ""
								&& this.config.showMore){
						$('.followup .load-more').addClass('show');
						$('.followup .load-more input[type=button]').prop('disabled', false);
						$('.followup .load-more input[type=button]').val($('.followup .load-more input[type=button]').attr('title'));
					}
					else{
						$('.followup .load-more').removeClass('show');
					}
				}
			},
			languageMapping: {
				rowData : '',
				init: function() {
					/* Add new mapping */
					$('.add-mapping').on ("click",function() {
						app.languageMapping.rowData = '';
						var buttonLabel = $(this).val();
						$(this).attr("disabled", true);
						$(this).val('Please wait...');
						$('.no-data-message').addClass('hidden');
						$('#mappingList').removeClass('hidden');
						$('#mappingList tbody').append('<tr><td colspan="3" class="center s">Please wait...</td></tr>');
						$('#mappingList').addClass('form-mode');
						var langMapping = {
							currDwLangCode: '',
							currTmLangCode: ''
						};
						
						$.post(app.urls.newMappingRow, langMapping, function(data) {
							$('#mappingList tbody tr:last-child').html(data);
							$('.add-mapping').val(buttonLabel);
						});
					});

					/* Save button */
					$('.language-mapping').on ('click', '#saveMapping', function() {
						var saveButton = $(this);
						var dwLangCode = $( "#dwlanguageSelect option:selected" ).val();
						var tmLangCode = $( "#tmlanguageSelect option:selected" ).val();

						if (dwLangCode && tmLangCode) {
							saveButton.prop('disabled', true);
							$('#cancelMapping').prop('disabled', true);
							saveButton.val('Please wait...');

							var dwLangName = $( "#dwlanguageSelect option:selected" ).text();
							var tmLangName = $( "#tmlanguageSelect option:selected" ).text();
							var langCodesStr = saveButton.closest('td').attr('data-langs');
							var langCodes = langCodesStr.split('|');

							var newLanguageMappingData = {
								dwLangName: dwLangName,
								tmLangName: tmLangName,
								dwLangCode: dwLangCode,
								tmLangCode: tmLangCode,
								currDwLangCode: langCodes[0],
								currTmLangCode: langCodes[1]
							};

							$.post(app.urls.saveLanguageMapping, newLanguageMappingData, function(responseHTML) {
								saveButton.closest('tr').html(responseHTML);
								$('.add-mapping').attr("disabled",false);
								$('#mappingList').removeClass('form-mode');
							});
						}
					});

					/* Cancel button */
					$('.language-mapping').on ('click', '#cancelMapping', function() {
						if (app.languageMapping.rowData === '') { // Cancelling add new mapping
							$(this).closest('tr').remove();
						} else { // Cancelling edit
							$(this).closest('tr').html(app.languageMapping.rowData);
						}

						if ($('#mappingList tr').length === 1) {
							$('#mappingList').addClass('hidden');
							$('.no-data-message').removeClass('hidden');
						}

						$('.add-mapping').attr("disabled",false);
						$('#mappingList').removeClass('form-mode');
					});

					/* Delete button */
					$('.language-mapping').on('click', '.actions .delete', function() {
						if (!$('#mappingList').hasClass('form-mode') && confirm('Are you sure you want to delete this mapping?')) {
							$(this).closest('tr').remove();
							var langCodesStr = $(this).closest('td').attr('data-langs');
							var langCodes = langCodesStr.split('|');
							var langMapping = {dwLangCode: langCodes[0], tmLangCode: langCodes[1]};

							if ($('#mappingList tr').length === 1) {
								$('#mappingList').addClass('hidden');
								$('.no-data-message').removeClass('hidden');
							}

							$.post(app.urls.deleteRowMapping, langMapping, function(){});
						}
					});

					/* Edit button */
					$('.language-mapping').on ('click', '.actions .edit', function() {
						if (!$('#mappingList').hasClass('form-mode')) {
							var parentTR = $(this).closest('tr');
							app.languageMapping.rowData = parentTR.html();
							var langCodesStr = $(this).parent('td').attr('data-langs');
							var langCodes = langCodesStr.split('|');
							var langMapping = {
								currDwLangCode: langCodes[0],
								currTmLangCode: langCodes[1]
							};
							parentTR.html('<td colspan="3" class="center s">Please wait...</td>');
							$('.add-mapping').attr("disabled", true);
							$('#mappingList').addClass('form-mode');

							$.post(app.urls.newMappingRow, langMapping, function(data) {
								parentTR.html(data);
							});
						}
					});
				}
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