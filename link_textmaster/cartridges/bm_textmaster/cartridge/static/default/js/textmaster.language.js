/* global jQuery, document, confirm, textMasterGeneralApp */

(function ($) {
    $ = $.noConflict();
    var textMasterLanguageApp = {
        init: function () {
            if ($('.language-mapping').length) {
                this.languageMapping.init();
            }
        },
        languageMapping: {
            rowData: '',
            init: function () {
                /* Add new mapping */
                $('.add-mapping').on('click', function () {
                    textMasterLanguageApp.languageMapping.rowData = '';
                    var buttonLabel = $(this).val();
                    $(this).attr('disabled', true);
                    $(this).val(Resources.messages.WAITING);
                    $('.no-data-message').addClass('hidden');
                    $('#mappingList').removeClass('hidden');
                    $('#mappingList tbody').append('<tr><td colspan="3" class="center s">' + Resources.messages.WAITING + '</td></tr>');
                    $('#mappingList').addClass('form-mode');
                    var langMapping = {
                        currDwLangCode: '',
                        currTmLangCode: ''
                    };

                    $.post(textMasterGeneralApp.urls.newMappingRow, langMapping, function (data) {
                        $('#mappingList tbody tr:last-child').html(data);
                        $('.add-mapping').val(buttonLabel);
                    });
                });

                /* Save button */
                $('.language-mapping').on('click', '#saveMapping', function () {
                    var saveButton = $(this);
                    var dwLangCode = $('#dwlanguageSelect option:selected').val();
                    var tmLangCode = $('#tmlanguageSelect option:selected').val();

                    if (dwLangCode && tmLangCode) {
                    	if (dwLangCode !== tmLangCode) {
	                        saveButton.prop('disabled', true);
	                        $('#cancelMapping').prop('disabled', true);
	                        saveButton.val(Resources.messages.WAITING);
	
	                        var dwLangName = $('#dwlanguageSelect option:selected').text();
	                        var tmLangName = $('#tmlanguageSelect option:selected').text();
	                        var langCodesStr = saveButton.closest('td').attr('data-langs');
	                        var langCodes = langCodesStr.split('|');
	
	                        var newLanguageMappingData = {
	                            dwLangName: dwLangName.replace('* ', ''),
	                            tmLangName: tmLangName,
	                            dwLangCode: dwLangCode,
	                            tmLangCode: tmLangCode,
	                            currDwLangCode: langCodes[0],
	                            currTmLangCode: langCodes[1]
	                        };
	
	                        $.post(textMasterGeneralApp.urls.saveLanguageMapping, newLanguageMappingData, function (responseHTML) {
	                            saveButton.closest('tr').html(responseHTML);
	                            $('.add-mapping').attr('disabled', false);
	                            $('#mappingList').removeClass('form-mode');
	                        });
	                        $.ajax({
	                            type: 'POST',
	                            url: textMasterGeneralApp.urls.clearCache,
	                            success: function () {
	                                console.log("Language cache cleared");
	                            }
	                        });
                    	} else {
                    		alert("Mapping between same language code is not required. For more details please read the description under the heading of this page.");
                    	}
                    }
                });

                /* Cancel button */
                $('.language-mapping').on('click', '#cancelMapping', function () {
                    if (textMasterLanguageApp.languageMapping.rowData === '') { // Cancelling add new mapping
                        $(this).closest('tr').remove();
                    } else { // Cancelling edit
                        $(this).closest('tr').html(textMasterLanguageApp.languageMapping.rowData);
                    }

                    if ($('#mappingList tr').length === 1) {
                        $('#mappingList').addClass('hidden');
                        $('.no-data-message').removeClass('hidden');
                    }

                    $('.add-mapping').attr('disabled', false);
                    $('#mappingList').removeClass('form-mode');
                });

                /* Delete button */
                $('.language-mapping').on('click', '.actions .delete', function () {
                    if (!$('#mappingList').hasClass('form-mode') && confirm(Resources.messages.CONFIRM_DELETE)) {
                        $(this).closest('tr').remove();
                        var langCodesStr = $(this).closest('td').attr('data-langs');
                        var langCodes = langCodesStr.split('|');
                        var langMapping = {
                            dwLangCode: langCodes[0],
                            tmLangCode: langCodes[1]
                        };

                        if ($('#mappingList tr').length === 1) {
                            $('#mappingList').addClass('hidden');
                            $('.no-data-message').removeClass('hidden');
                        }

                        $.post(textMasterGeneralApp.urls.deleteRowMapping, langMapping, function () {});
                        $.ajax({
                            type: 'POST',
                            url: textMasterGeneralApp.urls.clearCache,
                            success: function () {
                            	console.log("Language cache cleared");
                            }
                        });
                    }
                });

                /* Edit button */
                $('.language-mapping').on('click', '.actions .edit', function () {
                    if (!$('#mappingList').hasClass('form-mode')) {
                        var parentTR = $(this).closest('tr');
                        textMasterLanguageApp.languageMapping.rowData = parentTR.html();
                        var langCodesStr = $(this).parent('td').attr('data-langs');
                        var langCodes = langCodesStr.split('|');
                        var langMapping = {
                            currDwLangCode: langCodes[0],
                            currTmLangCode: langCodes[1]
                        };
                        parentTR.html('<td colspan="3" class="center s">' + Resources.messages.WAITING + '</td>');
                        $('.add-mapping').attr('disabled', true);
                        $('#mappingList').addClass('form-mode');

                        $.post(textMasterGeneralApp.urls.newMappingRow, langMapping, function (data) {
                            parentTR.html(data);
                        });
                    }
                });
            }
        }
    };

    $(document).ready(function () {
        textMasterLanguageApp.init();
    });
})(jQuery);
