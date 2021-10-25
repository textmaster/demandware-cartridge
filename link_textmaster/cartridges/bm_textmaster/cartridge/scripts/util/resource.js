/**
 * Resource helper
 *
 */
var resourceHelper = {
    /**
     * Get the client-side resources of a given page
     * @returns {Object} An objects key key-value pairs holding the resources
     */
    getResources: function () {
        var Resource = require('dw/web/Resource');

        var resources = {
            IN_CREATION: Resource.msg('status.in_creation', 'textmaster', null),
            IN_PROGRESS: Resource.msg('status.in_progress', 'textmaster', null),
            IN_REVIEW: Resource.msg('status.in_review', 'textmaster', null),
            COMPLETED: Resource.msg('status.completed', 'textmaster', null),
            COUNTING: Resource.msg('status.counting', 'textmaster', null),
            INCOMPLETE: Resource.msg('status.incomplete', 'textmaster', null),
            TRANSLATE_ACTION_ERROR: Resource.msg('follow.translate.action.error', 'textmaster', null),
            TRANSLATE_ACTION: Resource.msg('follow.translate.action', 'textmaster', null),
            VALIDATE_ACTION: Resource.msg('follow.validate.action', 'textmaster', null),
            VALIDATED: Resource.msg('status.validated', 'textmaster', null),
            SWITCH_TO_COMPLETED: Resource.msg('follow.document.switch.to.completed', 'textmaster', null),
            TRANSLATED_SUCCESS_MESSAGE: Resource.msg('follow.translated.success.message', 'textmaster', null),
            REVIEW_BUTTON_LABEL: Resource.msg('follow.review.button.label', 'textmaster', null),
            VALIDATED_SUCCESS_MESSAGE: Resource.msg('follow.validated.success.message', 'textmaster', null),
            WAITING_MESSAGE: Resource.msg('general.waiting', 'textmaster', null)
        };

        return resources;
    }
};

module.exports = resourceHelper;
