/* global jQuery, localStorage, textMasterGeneralApp, clearTimeout, setTimeout, document */

(function ($) {
    $ = $.noConflict();
    var textMasterTranslationApp = {
        init: function () {
            if ($('.new-translation').length) {
                this.newTranslation();
            }
        },
        newTranslation: function () {
            var items = [];
            var postData;
            var errorTimeID;
            var searchText;
            var pageID;
            var itemsLimit = $('#itemsLimit').val();
            var exportDate = '';

            itemsLimit = parseInt(itemsLimit, 10);

            $('select[name=locale-from]').on('change', function () {
                var localeFrom = $(this).val();
                $('ul.select-locale-to').html('<span>' + Resources.messages.WAITING + '</span>');

                $.post(textMasterGeneralApp.urls.getLanguageToList, {
                    languageFrom: localeFrom
                }, function (data) {
                    $('.input-holder.locale-to').html(data);
                });
            });

            $('select[name=item-type]').on('change', function () {
                var itemType = this.value;

                if (itemType === 'component') {
                	$('.form-holder.page-designer').addClass('show');
                	var loaderImgSrc = $('.ajax-loader img').attr('src');
                	var loaderImg = '<img src="' + loaderImgSrc + '" width="30px">';
                	$('.field-holder.page-designer-list').html(loaderImg);

                	getComponentPageDesigners();
                } else {
                	$('.form-holder.page-designer').removeClass('show');
                }

                if (itemType === 'product') {
                    $('.search-by').removeClass('hide');
                    var searchType = textMasterGeneralApp.utils.getCookie('searchType');
                    if (searchType) {
                        $('select[name=search-type] option[value=' + searchType + ']').attr('selected', 'selected')
                    }
                    $('select[name=search-type]').on('change', function() {
                        if ($(this).val() === 'category') {
                            $('.category').addClass('show');
                            $('.product-id').addClass('hide');
                            $('ul.select-category').html('<span>' + Resources.messages.WAITING + '</span>');
                            $('.common-error.search').removeClass('show');

                            var url = textMasterGeneralApp.urls.categoryDropdown + '?itemType=' + itemType;
                            $.get(url, function (data) {
                                $('.input-holder.category').html(data);
                            });
                            $('select[name=item-type]').removeClass('error-field');
                            textMasterGeneralApp.utils.setCookie('searchType', 'category', 0);
                        } else {
                            $('.category').removeClass('show');
                            $('.product-id').removeClass('hide');
                            $('textarea[name=product-ids]').val('');
                            textMasterGeneralApp.utils.setCookie('searchType', 'productid', 0);
                        }
                    });
                    $('select[name=search-type]').change();
                } else if (itemType === 'category') {
                    $('.search-by').addClass('hide');
                    $('.product-id').addClass('hide');
                    $('.category').addClass('show');
                    $('ul.select-category').html('<span>' + Resources.messages.WAITING + '</span>');
                    $('.common-error.search').removeClass('show');

                    var url = textMasterGeneralApp.urls.categoryDropdown + '?itemType=' + itemType;
                    $.get(url, function (data) {
                        $('.input-holder.category').html(data);
                    });
                    $(this).removeClass('error-field');
                } else {
                    $('.search-by').addClass('hide');
                    $('.product-id').addClass('hide');
                    $('.category').removeClass('show');
                }

                $('.attributes-main').html('');
                $('.submit-error').html('');
                items = [];

                if (itemType !== 'component') { // No attributes need to be fetched for page components here
	                postData = {
	                    itemType: textMasterGeneralApp.utils.firstLetterCapital(itemType)
	                };
	                
	                $.post(textMasterGeneralApp.urls.attributeList, postData, function (data) {
	                    $('.attributes-main').html(data);
	
	                    if ($('input[type=checkbox][name="attribute[]"]:checked').length === 0) {
	                        $('.attributes-holder').addClass('show-all');
	                    } else {
	                        $('.attributes-holder').removeClass('show-all');
	                    }
	                });
                }

                $(this).removeClass('error-field');
                $('.common-error.search').removeClass('show');
                $('#items-holder').html('');
            });

            $('.input-holder.category').on('click', '#category-select-all', function () {
                $('input[name="category[]"]').prop('checked', $(this).is(':checked'));
            }).on('click', 'input[name="category[]"]', function () {
                var parentLi = $(this).closest('li');

                parentLi.find('ul li input[name="category[]"]').prop('checked', $(this).is(':checked'));
            });

            $('.new-translation').on('click', '.show-all-attributes input[type=button]', function () {
                $('.attributes-holder').addClass('show-all');
                $('.show-default-attributes').addClass('show');
            });

            $('.new-translation').on('click', '.show-default-attributes input[type=button]', function () {
                $('.attributes-holder').removeClass('show-all');
                $('.show-default-attributes').removeClass('show');
                $('.attributes-holder > li:not(.default) input[type=checkbox]:checked').prop('checked', false);
            });

            $('#filter-search').on('click', function () {
                var date = new Date($('#date-input').val());

                if (Object.prototype.toString.call(date) === "[object Date]") {
                    if (isNaN(date)) {
                        date = '';
                    } else {
                        date = date.toISOString().substr(0, 10);
                    }
                }
                
                exportDate = date;

                searchText = $(this).val();
                var itemType = $('select[name=item-type]').val();
                var searchBy = $('select[name=search-type]').val();
                var category = [];
                var pids = $('textarea[name=product-ids]').val();
                var error = false;
                var errorText = '';
                pageID = $('select[name=page-designer]').val();

                $('input[type="checkbox"][name="category[]"]:checked').each(function () {
                    category.push($(this).val());
                });

                if (itemType === '') {
                    $('select[name=item-type]').addClass('error-field');
                    error = true;
                    errorText = Resources.errors.SELECT_ITEM_TYPE;
                } else if (itemType === 'product') {
                    if (searchBy === 'category' && category.length === 0) {
                        error = true;
                        errorText = Resources.errors.SELECT_CATEGORIES;
                    } else if (searchBy === 'productid' && pids.length === 0) {
                        error = true;
                        errorText = Resources.errors.ENTER_PRODUCT_ID;
                    }
                } else if (itemType === 'category' && category.length === 0) {
                    error = true;
                    errorText = Resources.errors.SELECT_CATEGORIES;
                } else if (itemType === 'component') {
                	if (!pageID) {
                		error = true;
                        errorText = Resources.errors.SELECT_PAGE_DESIGNER;
                	}
                }

                if (error) {
                    $('.common-error.search').text(errorText);
                    $('.common-error.search').addClass('show');
                    return false;
                }

                $('.items .ajax-loader').addClass('show');
                $('.common-error.search').removeClass('show');
                $(this).prop('disabled', true).val(Resources.messages.WAITING);

                if (itemType === 'pagedesigner') {
                    getPageDesigners();
                } else if (itemType === 'component') {
                	getPageComponents();
                } else {
                	postData = {
                        itemType: itemType,
                        category: searchBy === 'category' ? category.join(',') : '',
                        pids: searchBy === 'productid' ? pids : '',
                        date: exportDate
                    };
                	$.post(textMasterGeneralApp.urls.translationItemList, postData, function (data) {
                        $('#items-holder').html(data);
                        if (itemType !== 'pagedesigner') {
                        	$('#filter-search').prop('disabled', false).val(searchText);
                        	$('.items .ajax-loader').removeClass('show');
                        }
                    });
                }
            });

            var addItem = function (itemID) {
                if (items.length < itemsLimit) {
                    if (items.indexOf(itemID) < 0) {
                        items.push(itemID);
                    }
                    return true;
                } else {
                    $('.items-limit-error').addClass('show');
                    clearTimeout(errorTimeID);
                    errorTimeID = setTimeout(function () {
                        $('.items-limit-error').removeClass('show');
                    }, 4000);
                    return false;
                }
            };

            var removeItem = function (itemID) {
                var index = items.indexOf(itemID);
                $('.items-limit-error').removeClass('show');

                if (index > -1) {
                    items.splice(index, 1);
                }
            };

            var getPageDesigners = function () {
            	$.ajax({
            		url: textMasterGeneralApp.urls.getPageDesigners + '?exportDate=' + exportDate,
            		async: false,
            		success: function (data) {
                		$('#items-holder').html(data);
                		$('#filter-search').prop('disabled', false).val(searchText || 'Search');
                    	$('.items .ajax-loader').removeClass('show');
                    }
            	});
            };

            var getComponentPageDesigners = function () {
            	$.ajax({
            		url: textMasterGeneralApp.urls.getPageDesigners + '?itemType=component',
            		async: false,
            		success: function (data) {
            			$('.field-holder.page-designer-list').html(data);
                    }
            	});
            }

            var getPageComponents = function () {
            	var language = $('select[name=locale-from]').val();
            	var postData = {
                    pageID: pageID,
                    date: exportDate,
                    language: language
                };
                $.post(textMasterGeneralApp.urls.getPageComponents, postData, function (data) {
                    $('#items-holder').html(data);
                    $('#filter-search').prop('disabled', false).val(searchText);
                    $('.items .ajax-loader').removeClass('show');
                });
            };

            $('#items-holder').on('click', 'input[type="checkbox"][name="item[]"]', function () {
                var itemID = $(this).val();

                if ($(this).prop('checked')) {
                    var itemAdded = addItem(itemID);
                    if (!itemAdded) {
                        $(this).prop('checked', false);
                    }
                } else {
                    removeItem(itemID);
                }
            });

            $('#button-select-all').on('click', function () {
                var itemAdded;

                $('input[type="checkbox"][name="item[]"]').each(function () {
                    var itemID = $(this).val();
                    itemAdded = addItem(itemID);

                    if (itemAdded) {
                        $(this).prop('checked', true);
                    } else {
                        return false;
                    }
                });
            });

            $('#button-deselect-all').on('click', function () {
                $('input[type="checkbox"][name="item[]"]').prop('checked', false);

                $('input[type="checkbox"][name="item[]"]').each(function () {
                    var itemID = $(this).val();
                    removeItem(itemID);
                });
            });

            $('select[name=project-name-type]').on('change', function () {
                var projectNameType = $(this).val();
                if (projectNameType === 'manual') {
                    $('.project-name').show();
                } else {
                    $('.project-name').hide();
                }
            });

            $('#filter-item-form').on('submit', function () {
                var errors = [Resources.errors.FIX_FOLLOWING];
                var ul = $('<ul>');

                var itemType = $('select[name=item-type]').val();
                if (itemType === '') {
                    errors.push('- ' + Resources.errors.SELECT_ITEM_TYPE);
                }

                if ($('select[name=locale-from]').val() === '') {
                    errors.push('- ' + Resources.errors.SELECT_SOURCE_LANGUAGE);
                }

                if ($('input[name="locale-to[]"]:checked').length === 0) {
                    errors.push('- ' + Resources.errors.SELECT_TARGET_LANGUAGE);
                }

                if (itemType !== '' && $('input[type="checkbox"][name="attribute[]"]:checked').length === 0) {
                    errors.push('- ' + Resources.errors.SELECT_ATTRIBUTES);
                }

                if (items.length === 0) {
                    errors.push('- ' + Resources.errors.SELECT_ITEM);
                }
                
                if ($('select[name=item-type]').val() === 'component') {
                    $('.attributes-holder').each(function() {
                        if ($(this).find('li input[name="attribute[]"]').length && $(this).find('li input[name="attribute[]"]:checked').length === 0) {
                            $(this).find('h2').addClass('error');
                            errors.push('- ' + Resources.errors.SELECT_ATTRIBUTES_COMPONENTS + $(this).find('h2 span').text());
                        }
                    });
                }

                if ($('select[name=project-name-type]').val() === '') {
                    errors.push('- ' + Resources.errors.SELECT_PROJECT_NAME_ENTRY);
                }

                if ($('select[name=project-name-type]').val() === 'manual' && $('#project-name').val() === '') {
                    errors.push('- ' + Resources.errors.ENTER_PROJECT_NAME);
                }

                if (errors.length > 1) {
                    errors.forEach(function (error) {
                        ul.append('<li>' + error + '</li>');
                    });

                    $('.submit-error').html(ul);
                    return false;
                }

                $('input[name=items]').val(items.join(','));
                $('.submit-error').html('');
                $('#filter-item-submit').prop('disabled', true).val(Resources.messages.WAITING);
            });

            if ($('select[name=locale-from] option').length === 1) {
                // Populate To Language List if only one language is on From Language list
                $('select[name=locale-from]').trigger('change');
            }
        }
    };

    $(document).ready(function () {
        textMasterTranslationApp.init();
    });
})(jQuery);
