/* global jQuery */
/* eslint-disable wrap-iife */
/* eslint-disable no-nested-ternary */
/* eslint-disable no-else-return */
/* eslint-disable consistent-return */
/* eslint-disable no-param-reassign */
/* eslint-disable new-cap */
/* eslint-disable no-shadow */
/* eslint-disable no-alert, no-confirm */

(function ($) {
    $ = $.noConflict();
    var compApp = {
        init: function () {
            if ($('.new-translation').length) {
                this.newTranslation();
            }
        },
        urls: {
        	translationItemList: 'TMComponents-ItemList',
        	checkContentXMLExists: 'TMComponents-CheckContentXMLExists',
        	getPageDesigners: 'TMComponents-GetPageDesigners'
        },
        newTranslation: function () {
            $('#load-page-designer').on('click', function () {
            	var loaderImgSrc = $('.ajax-loader img').attr('src');
            	var loaderImg = '<img src="' + loaderImgSrc + '" width="30px">';
            	$('.field-holder.page-designer-list').html(loaderImg);
            	var postData = {
                    itemType: $('select[name=item-type]').val()
                };

            	$.post(compApp.urls.translationItemList, postData, function (data) {
            		if (data) {
            			$('.field-holder.page-designer-list').html(data);
            		} else {
            			checkIfComponentContentXMLReady();
            		}
                });
            });
            
            var contentCheckCount = 0;

            var checkIfComponentContentXMLReady = function () {
            	setTimeout(checkComponentContentXMLExists, 1000);
            }
            
            var checkComponentContentXMLExists = function () {
            	contentCheckCount++;

            	$.post(compApp.urls.checkContentXMLExists, {}, function (data) {
                    if (data.fileFound) {
                    	getComponentPageDesigners();
                    } else {
                    	if (contentCheckCount < 15) {
                    		setTimeout(checkComponentContentXMLExists, 1000);
                    	} else {
                    		$('.field-holder.page-designer-list').html('Something went wrong. Please check log');
                    	}
                    }
                });
            }
            
            var getComponentPageDesigners = function () {
            	$.ajax({
            		url: compApp.urls.getPageDesigners + '?itemType=component',
            		async: false,
            		success: function (data) {
            			$('.field-holder.page-designer-list').html(data);
                    }
            	});
            }
            
            function componentAttrAdd(componentID, checkbox) {
            	if (!$('.attributes-main ul#attributes-' + componentID).length) {
            		var componentName = checkbox.closest('tr').find('td:nth-of-type(3) label').text();
	            	var attrString = checkbox.parent().find('input.item-attribute').val();
	                var attrs = JSON.parse(attrString);
	                var attrHTML = '<ul class="attributes-holder show-all" id="attributes-' + componentID + '"><h2>' + componentName + ' <span>(' + componentID + ')</span></h2>';
	                for (var i = 0; i < attrs.length; i++) {
	                	attrHTML += '<li><input type="checkbox" id="attribute-' + componentID + '-' + attrs[i] + '" value="' + componentID + '|' + attrs[i] + '|' + componentName + '" name="attribute[]"><label class="checkbox-label" for="attribute-' + componentID + '-' + attrs[i] + '">' + attrs[i] + '</label></li>';
	                }
	                attrHTML += '</ul>';
	                $('.attributes-main').append(attrHTML);
            	}
            }
            
            function componentAttrRemove(componentID) {
            	$('.attributes-main ul#attributes-' + componentID).remove();
            }
            
            $('#items-holder').on('click', 'input[type="checkbox"][name="item[]"]', function () {
                if ($('select[name=item-type]').val() === 'component') {
                	var componentID = $(this).val();
                	if ($(this).prop('checked')) {
                		componentAttrAdd(componentID, $(this));
                	} else {
                		componentAttrRemove(componentID);
                	}
                }
            });
            
            $('#button-select-all').on('click', function () {
            	if ($('select[name=item-type]').val() === 'component') {
            		$('input[type="checkbox"][name="item[]"]').each(function () {
            			var componentID = $(this).val();
                		componentAttrAdd(componentID, $(this));
                    });
            	}
            });

            $('#button-deselect-all').on('click', function () {
            	if ($('select[name=item-type]').val() === 'component') {
            		$('input[type="checkbox"][name="item[]"]').each(function () {
            			var componentID = $(this).val();
            			componentAttrRemove(componentID);
                    });
            	}
            });
            
            $('#filter-search').on('click', function () {
            	if ($('select[name=item-type]').val() === 'component') {
            		$('.attributes-main').html('');
            	}
            });
            
            $('.attributes-main').on('click', 'input[name="attribute[]"]', function(){
            	$(this).closest('.attributes-holder').find('h2').removeClass('error');
            });
        }
    };

    $(document).ready(function () {
        compApp.init();
    });
})(jQuery);
