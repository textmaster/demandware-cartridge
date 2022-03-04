/* global jQuery, textMasterGeneralApp, setTimeout, document */

(function ($) {
    $ = $.noConflict();
    var textMasterApiSetupApp = {
        init: function () {
            if ($('.registration').length) {
                this.registration.init();
            }
        },
        registration: {
            data: {},
            saveButton: {},
            saveButtonLabel: '',
            init: function () {
                var reg = this;

                $('.api-config-save').on('click', function () {
                    $('.error').html('');
                    reg.saveButton = $('input.api-config-save');
                    reg.saveButton.prop('disabled', true);
                    reg.saveButtonLabel = reg.saveButton.val();
                    reg.saveButton.val(Resources.messages.WAITING);

                    reg.setData();

                    if (reg.validate()) {
                        reg.saveData();
                    } else {
                        reg.saveButton.val(reg.saveButtonLabel);
                        reg.saveButton.prop('disabled', false);
                    }
                });

                $('a#reg-link').on('click', function () {
                    $('.error').html('');
                    var apiEnv = $('select[name=api-env]').length ? $('select[name=api-env]').val() : $('input[name=api-env]').val();
                    var backOfficeLink = $('input[name=backoffice-base' + apiEnv + 'url]').val();
                    
                    if ($.trim(backOfficeLink) === '') {
                    	var resourceValue = Resources.errors.BACKOFFICE_BASE_URL.replace('{0}', textMasterGeneralApp.utils.firstLetterCapital(apiEnv))
                        
                        $('.error').html(resourceValue);
                        return false;
                    }

                    var signinLink = $(this).data('signin-link');
                    $(this).attr('href', backOfficeLink + signinLink);
                });

                $('select[name=api-cache]').on('change', function () {
                    $('input.clear-cache').toggleClass('hidden');
                });

                $('input.clear-cache').on('click', function () {
                    $(this).attr('disabled', true);
                    $.ajax({
                        type: 'POST',
                        url: textMasterGeneralApp.urls.clearCache,
                        success: function () {
                            $('.cache-message').removeClass('hidden');
                        }
                    });
                });
            },
            setData: function () {
                var data = this.data;
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
            validate: function () {
                var errorMessages = [];
                var data = this.data;

                if (data.apiCategory === '' && $('select[name=api-category] option').length > 1) {
                    errorMessages.push(Resources.errors.STORE_CATEGORY);
                }

                if (data.catalogID === '') {
                    errorMessages.push(Resources.errors.MASTER_CATALOG_ID);
                }

                if (data.tmPageSize === '') {
                    errorMessages.push(Resources.errors.DASHBOARD_DATA_SIZE);
                } else if (isNaN(data.tmPageSize)) {
                    errorMessages.push(Resources.errors.DASHBOARD_PAGE_SIZE);
                } else if (parseInt(data.tmPageSize, 10) < 10) {
                    errorMessages.push(Resources.errors.DASHBOARD_PAGE_SIZE_MIN);
                }

                if (data.tmApiBaseUrlDemo === '') {
                    errorMessages.push(Resources.errors.API_BASE_URL.replace('{0}', Resources.general.DEMO));
                }

                if (data.tmApiVersionUrlDemo === '') {
                    errorMessages.push(Resources.errors.API_VERSION.replace('{0}', Resources.general.DEMO));
                }

                if (data.tmBackofficeBaseUrlDemo === '') {
                    errorMessages.push(Resources.errors.BACKOFFICE_BASE_URL.replace('{0}', Resources.general.DEMO));
                }

                if (data.tmApiBaseUrlLive === '') {
                    errorMessages.push(Resources.errors.API_BASE_URL.replace('{0}', Resources.general.LIVE));
                }

                if (data.tmApiVersionUrlLive === '') {
                    errorMessages.push(Resources.errors.API_VERSION.replace('{0}', Resources.general.LIVE));
                }

                if (data.tmBackofficeBaseUrlLive === '') {
                    errorMessages.push(Resources.errors.BACKOFFICE_BASE_URL.replace('{0}', Resources.general.LIVE));
                }

                textMasterApiSetupApp.registration.showErrorMessages(errorMessages);

                return errorMessages.length === 0; // true | false
            },
            showErrorMessages: function (errorMessages) {
                if (errorMessages.length > 0) {
                    var htmlMessage = '';
                    errorMessages.forEach(function (message) {
                        htmlMessage += message + '<br>';
                    });
                    $('.error').html(htmlMessage);
                }
            },
            saveData: function () {
                var reg = this;

                reg.saveButton.prop('disabled', true);
                reg.saveButton.val(Resources.messages.WAITING);

                $.post(textMasterGeneralApp.urls.saveAPIConfigurations, reg.data, function () {
                    $('.success-message').addClass('show');
                    reg.saveButton.val(reg.saveButtonLabel);
                    reg.saveButton.prop('disabled', false);

                    setTimeout(function () {
                        $('.success-message').removeClass('show');
                    }, 3000);
                });
            }
        }
    };

    $(document).ready(function () {
        textMasterApiSetupApp.init();
    });
})(jQuery);
