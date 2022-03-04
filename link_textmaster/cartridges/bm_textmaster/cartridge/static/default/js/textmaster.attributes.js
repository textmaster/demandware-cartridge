/* global jQuery, document, setTimeout, textMasterGeneralApp */

(function ($) {
    $ = $.noConflict();
    var textMasterAttributesApp = {
        init: function () {
            if ($('.default-attributes').length) {
                this.setDefaultAttributes();
            }
        },
        setDefaultAttributes: function () {
            $('select[name=attribute-item-type]').on('change', function () {
                var itemType = this.value;

                var postData = {
                    itemType: textMasterGeneralApp.utils.firstLetterCapital(itemType)
                };
                $('.attributes-main').html('');
                $.post(textMasterGeneralApp.urls.attributeList, postData, function (data) {
                    $('.attributes-main').html(data);
                });

                $(this).removeClass('error-field');
                $('.submit-error').text('');
            });

            $('#attributes-save').on('click', function () {
                var error = '';
                var postData = {};
                var attributes = [];
                var defaultValueString = '';
                var checkedValueString = '';
                var errorHolder = $('.submit-error');
                var button = $(this);
                var buttonCaption = button.val();

                if ($('input[name="attribute[]"]:checked').length === 0) {
                    error = Resources.errors.SELECT_ATTRIBUTE;
                } else {
                    $('li.default input[name="attribute[]"]').each(function () {
                        defaultValueString += this.value.split('|')[0];
                    });

                    $('input[name="attribute[]"]:checked').each(function () {
                        checkedValueString += this.value.split('|')[0];
                    });

                    if (defaultValueString === checkedValueString) {
                        error = Resources.errors.CHANGE_SELECT_ATTRIBUTE;
                    }
                }

                errorHolder.text(error);

                if (error === '') {
                    button.val(Resources.messages.WAITING);
                    button.prop('disabled', true);

                    $('input[name="attribute[]"]:checked').each(function () {
                        attributes.push(this.value);
                    });

                    postData.itemType = $('select[name=attribute-item-type]').val();
                    postData.attributes = attributes;

                    $.post(textMasterGeneralApp.urls.saveDefaultAttributes, postData, function () {
                        $('.success-message').addClass('show');
                        $('.attributes-holder li.default').removeClass('default');
                        $('input[name="attribute[]"]:checked').closest('li').addClass('default');
                        button.val(buttonCaption);
                        button.prop('disabled', false);

                        setTimeout(function () {
                            $('.success-message').removeClass('show');
                        }, 3000);
                    });
                }
            });
        }
    };

    $(document).ready(function () {
        textMasterAttributesApp.init();
    });
})(jQuery);
