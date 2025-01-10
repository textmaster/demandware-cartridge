/* global jQuery, textMasterGeneralApp, document, setTimeout */

(function ($) {
    $ = $.noConflict();
    var textMasterPlaceOrderApp = {
        init: function () {
            if ($('.place-order').length) {
                this.placeOrder();
            }
        },
        placeOrder: function () {
            var transParams = JSON.parse($('#hidden-values').text());

            $('#reload-templates').on('click', function () {
                $.get(textMasterGeneralApp.urls.getTemplatesResponse, function (data) {
                    var result = JSON.parse(data);
                    $('.template-list-holder').each(function () {
                        var listHolder = $(this);
                        var templates = [];
                        var localeFrom = $(this).attr('data-locale-from');
                        var localeTo = $(this).attr('data-locale-to');

                        if (result.api_templates !== undefined && result.api_templates.length > 0) {
                            result.api_templates.forEach(function (temp) {
                                if (temp.language_from === localeFrom && temp.language_to === localeTo) {
                                    templates.push({
                                        id: temp.id,
                                        name: temp.name,
                                        autoLaunch: temp.auto_launch
                                    });
                                }
                            });
                        }

                        if (templates.length > 0) {
                            var select = $('<select></select>');
                            select.append($('<option value="" data-auto-launch=""></option>'));

                            templates.forEach(function (temp) {
                                select.append($('<option value="' + temp.id + '" data-auto-launch="' + temp.autoLaunch + '">' + temp.name + '</option>'));
                            });

                            listHolder.html(select);
                        }
                    });
                });
            });

            $('#place-order').on('click', function () {
                var error = '';

                if ($('.template-list-holder select').length < transParams.mappedLocaleTo.length) {
                    error = Resources.errors.TEMPLATE_NOT_FOUND;
                } else {
                    $('.template-list-holder select').each(function () {
                        if ($(this).val() === '') {
                            error = Resources.errors.SELECT_TEMPLATE;
                        }
                    });
                }

                if (error !== '') {
                    $('.submit-error').text('Error: ' + error);
                } else {
                    $(this).prop('disabled', true);
                    $(this).val(Resources.messages.WAITING);

                    $('.submit-error').text('');
                    var autoLaunchCount = 0;
                    var noAutoLaunchCount = 0;

                    for (var count = 0; count < transParams.mappedLocaleTo.length; count++) {
                        var mappedLocaleTo = transParams.mappedLocaleTo[count];
                        var templateSelect = $('#template-list-holder-' + transParams.mappedLocaleFrom + '-' + mappedLocaleTo).find('select');
                        transParams.localeTo[count].template = {
                            id: templateSelect.val(),
                            name: templateSelect.find('option:selected').text()
                        };
                        transParams.localeTo[count].autoLaunch = false;

                        if (templateSelect.find('option:selected').attr('data-auto-launch') === 'true') {
                            autoLaunchCount++;
                            transParams.localeTo[count].autoLaunch = true;
                        } else {
                            noAutoLaunchCount++;
                        }
                        
                        transParams.localeTo[count].briefing = $('input[name=project-briefing-' + count + ']').val();
                    }

                    transParams.projectIDs = [];
                    transParams.projectID = '';
                    transParams.itemLimit = $('input#itemrequestlimit').val();
                    transParams.itemLimit = isNaN(transParams.itemLimit) ? 20 : transParams.itemLimit;
                    transParams.itemLimit = parseInt(transParams.itemLimit, 10);
                    transParams.itemProgress = 0;
                    transParams.localeCount = 0;
                    transParams.itemCount = 0;
                    transParams.autoLaunchCount = autoLaunchCount;
                    transParams.noAutoLaunchCount = noAutoLaunchCount;

                    textMasterPlaceOrderApp.triggerExportRequest(transParams);
                    $('#progress-holder').show();
                }
            });

            $('#reload-templates').trigger('click');
            
            $('img.project-briefing').on('click', function () {
            	var index = $(this).data('index');
            	$('input[name=project-index]').val(index);
            	var briefing = $('input[name=project-briefing-' + index + ']').val();
            	$('.project-briefing-holder textarea').val(briefing);
            	$('.overlay-holder').addClass('show');
            });
            
            $('.overlay-holder .cancel-button').on('click', function () {
            	$('.overlay-holder').removeClass('show');
            });
            
            $('.overlay-holder .clear-button').on('click', function () {
            	$('.project-briefing-holder textarea').val('');
            	$('.project-briefing-holder textarea').focus();
            });
            
            $('.overlay-holder .apply-button').on('click', function () {
            	var briefing = $('.project-briefing-holder textarea').val().trim();
            	var projectIndex = $('input[name=project-index]').val();
            	$('input[name=project-briefing-' + projectIndex + ']').val(briefing);
            	$('.overlay-holder').removeClass('show');
            	
            	if (briefing) {
            		$('input[name=project-briefing-' + projectIndex + ']').parent().addClass('briefing-added');
            	} else {
            		$('input[name=project-briefing-' + projectIndex + ']').parent().removeClass('briefing-added');
            	}
            });
            
            $('.project-briefing-holder textarea').on('focus', function () {
            	$(this).parent().addClass('focus');
            });
            
            $('.project-briefing-holder textarea').on('blur', function () {
            	$(this).parent().removeClass('focus');
            });
        },

        triggerExportRequest: function (transParams) {
            /* this function is being called from multiple locations */
            var localeTo;
            var items;
            var postData;
            var itemsSize;

            if (transParams.itemCount === transParams.items.length) {
                localeTo = transParams.localeTo[transParams.localeCount];
                postData = {
                    projectID: transParams.projectID,
                    autoLaunch: localeTo.autoLaunch
                };

                $.ajax({
                    type: 'POST',
                    url: textMasterGeneralApp.urls.handleAutoLaunch,
                    data: postData,
                    success: function () {
                        // no actions
                    }
                });

                transParams.localeCount++;
                transParams.itemCount = 0;
                transParams.projectID = '';
            }

            if (transParams.itemProgress >= transParams.items.length * transParams.localeTo.length) {
                $('input[name=autoLaunchCount]').val(transParams.autoLaunchCount);
                $('input[name=noAutoLaunchCount]').val(transParams.noAutoLaunchCount);
                $('input[name=projectID]').val(transParams.projectIDs.length === 1 ? transParams.projectIDs[0] : '');
                $('#notification-form').submit();
            } else {
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
                    projectNameType: transParams.projectNameType,
                    projectName: transParams.projectName
                };

                transParams.itemProgress += items.length;
                itemsSize = transParams.items.length * transParams.localeTo.length;

                $.ajax({
                    type: 'POST',
                    url: textMasterGeneralApp.urls.createTranslation,
                    data: postData,
                    success: function (output) {
                        transParams.projectID = output;

                        if (transParams.projectIDs.indexOf(output) < 0) {
                            transParams.projectIDs.push(output);
                        }

                        itemsSize = transParams.items.length * transParams.localeTo.length;
                        textMasterPlaceOrderApp.updateTranslationProgress(itemsSize, transParams.itemProgress);

                        setTimeout(function () {
                            textMasterPlaceOrderApp.triggerExportRequest(transParams);
                        }, 250);
                    }
                });
            }
        },

        updateTranslationProgress: function (itemsSize, itemProgress) {
            var percent = (itemProgress / itemsSize) * 100;

            $('#progress-holder .progress-bar').css('width', percent + '%');
        }
    };

    $(document).ready(function () {
        textMasterPlaceOrderApp.init();
    });
})(jQuery);
