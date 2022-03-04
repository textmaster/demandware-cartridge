/* global jQuery, textMasterGeneralApp, setTimeout, document */

(function ($) {
    $ = $.noConflict();
    var textMasterAuthenticationApp = {
        init: function () {
            if ($('.registration').length) {
                this.registration.init();
            }
        },
        registration: {
            init: function () {
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

                $('input[name=authorize]').on('click', function () {
                    var clientID = $('input[name=client-id]').val();
                    var clientSecret = $('input[name=client-secret]').val();

                    if (clientID === '') {
                    	$('.error-id').html(Resources.errors.APPLICATION_ID);
                    } else {
                        var apiEnv = $('input[name=api-env]').val();
                        var backOfficeLink = $('input[name=backoffice-base' + apiEnv + 'url]').val();

                        if ($.trim(backOfficeLink) === '') {
                        	var resValue = Resources.errors.GO_APISETUP .replace('{0}', textMasterGeneralApp.utils.firstLetterCapital(apiEnv))
                            
                            $('.error').html(resValue);
                        } else {
                        	$('.error-id').html('');
                        	this.value = Resources.messages.WAITING;
                        	$(this).prop('disabled', true);
                        	var authoriseLink = $(this).data('authorise-link');
                        	var redirectURI = $('input[name=redirect-uri]').val();
                        	var responseType = $('input[name=response-type]').val();
                        	var scope = $('input[name=scope]').val();
                        	var authURL = backOfficeLink + authoriseLink + '?client_id=' + clientID + '&redirect_uri=' + redirectURI + '&response_type=' + responseType + '&scope=' + scope;
                        	var postData = {
                        		clientID: clientID,
                        		clientSecret: clientSecret,
                        		redirectURI: redirectURI
                        	};
                        	
                        	$.post(textMasterGeneralApp.urls.saveAuthData, postData, function () {
                                window.location.href = authURL;
                            });
                        }
                    }
                });
                
                $('input[name=generate-token]').on('click', function () {
                    var clientSecret = $('input[name=client-secret]').val();

                    if (clientSecret === '') {
                    	$('.error-secret').html(Resources.errors.APPLICATION_SECRET);
                    } else {
                    	$('.error-secret').html('');
                    	this.value = Resources.messages.WAITING;
                    	$(this).prop('disabled', true);

                    	var postData = {
                    		clientSecret: clientSecret
                    	};

                    	$.post(textMasterGeneralApp.urls.saveAuthData, postData, function() {
                    		$.post(textMasterGeneralApp.urls.generateToken, {}, function(result){
                    			if (result) {
                    				var redirectURI = $('input[name=redirect-uri]').val();
                    				window.location.href = redirectURI;
                    			} else {
                    				$('.error-secret').html(Resources.errors.GENERATE_TOKEN);
                    			}
                        	});
                    	});
                    }
                });

                $('input[name=clear-authentication]').on('click', function () {
                	if (window.confirm(Resources.labels.CLEAR_AUTHENTICATION)) {
                		this.value = Resources.messages.WAITING;
                    	$(this).prop('disabled', true);

                		$.post(textMasterGeneralApp.urls.clearToken, {}, function(result){
                			if (result) {
                				var redirectURI = $('input[name=redirect-uri]').val();
                				window.location.href = redirectURI;
                			} else {
                				$('.error-secret').html(Resources.errors.AUTHENTICATION);
                			}
                    	});
                	}
                });
            }
        }
    };

    $(document).ready(function () {
        textMasterAuthenticationApp.init();
    });
})(jQuery);
