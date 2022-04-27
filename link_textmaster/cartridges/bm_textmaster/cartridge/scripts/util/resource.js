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
            general: {
                DEMO: Resource.msg('register.environment.demo', 'textmaster', null),
                LIVE: Resource.msg('register.environment.live', 'textmaster', null)
            },
            labels: {
                CLEAR_AUTHENTICATION: Resource.msg('authentication.clear.confirm', 'textmaster', null),
                IN_CREATION: Resource.msg('status.in_creation', 'textmaster', null),
                IN_PROGRESS: Resource.msg('status.in_progress', 'textmaster', null),
                IN_EXTRA_REVIEW: Resource.msg('status.in_extra_review', 'textmaster', null),
                IN_REVIEW: Resource.msg('status.in_review', 'textmaster', null),
                COMPLETED: Resource.msg('status.completed', 'textmaster', null),
                COUNTING: Resource.msg('status.counting', 'textmaster', null),
                INCOMPLETE: Resource.msg('status.incomplete', 'textmaster', null),
                VALIDATED: Resource.msg('status.validated', 'textmaster', null),
                PREVIEW_LINK: Resource.msg('follow.preview.link.label', 'textmaster', null),
                REVIEW_LINK: Resource.msg('follow.review.link.label', 'textmaster', null),
                REVIEW_BUTTON: Resource.msg('follow.review.button.label', 'textmaster', null),
                TRANSLATE_ACTION: Resource.msg('follow.translate.action', 'textmaster', null),
                VALIDATE_ACTION: Resource.msg('follow.validate.action', 'textmaster', null),
                SWITCH_TO_COMPLETED: Resource.msg('follow.document.switch.to.completed', 'textmaster', null)
            },
            errors: {
                TRANSLATE_ACTION: Resource.msg('follow.translate.action.error', 'textmaster', null),
                STORE_CATEGORY: Resource.msg('register.store.category.error', 'textmaster', null),
                MASTER_CATALOG_ID: Resource.msg('register.master.catalog.id.error', 'textmaster', null),
                DASHBOARD_DATA_SIZE: Resource.msg('register.dashboard.data.size.error', 'textmaster', null),
                DASHBOARD_PAGE_SIZE: Resource.msg('register.dashboard.page.size.error', 'textmaster', null),
                DASHBOARD_PAGE_SIZE_MIN: Resource.msg('register.dashboard.page.size.min.error', 'textmaster', null),
                API_BASE_URL: Resource.msg('register.api.base.url.error', 'textmaster', null),
                API_VERSION: Resource.msg('register.api.version.error', 'textmaster', null),
                BACKOFFICE_BASE_URL: Resource.msg('register.backoffice.base.url.error', 'textmaster', null),
                SELECT_ATTRIBUTE: Resource.msg('attributes.select.error', 'textmaster', null),
                SELECT_PROJECT_NAME_ENTRY:Resource.msg('project.name.entry.select.error', 'textmaster', null),
                ENTER_PROJECT_NAME:Resource.msg('project.name.enter.error', 'textmaster', null),
                CHANGE_SELECT_ATTRIBUTE: Resource.msg('attributes.change.selection.error', 'textmaster', null),
                APPLICATION_ID: Resource.msg('authentication.application.id.error', 'textmaster', null),
                GO_APISETUP: Resource.msg('authentication.go.apisetup.error', 'textmaster', null),
                APPLICATION_SECRET: Resource.msg('authentication.application.secret.error', 'textmaster', null),
                GENERATE_TOKEN: Resource.msg('authentication.generate.token.error', 'textmaster', null),
                AUTHENTICATION: Resource.msg('authentication.error', 'textmaster', null),
                SELECT_CATEGORIES: Resource.msg('translation.select.categories.error', 'textmaster', null),
                ENTER_PRODUCT_ID: Resource.msg('translation.enter.pid.error', 'textmaster', null),
                SELECT_PAGE_DESIGNER: Resource.msg('translation.select.page.designer.error', 'textmaster', null),
                SELECT_ITEM_TYPE: Resource.msg('translation.select.item.type.error', 'textmaster', null),
                SELECT_SOURCE_LANGUAGE: Resource.msg('translation.select.source.language.error', 'textmaster', null),
                SELECT_TARGET_LANGUAGE: Resource.msg('translation.select.target.language.error', 'textmaster', null),
                SELECT_ATTRIBUTES: Resource.msg('translation.select.attributes.error', 'textmaster', null),
                SELECT_ITEM: Resource.msg('translation.select.item.error', 'textmaster', null),
                SELECT_ATTRIBUTES_COMPONENTS: Resource.msg('translation.select.attributes.components.error', 'textmaster', null),
                FIX_FOLLOWING: Resource.msg('translation.fix.following.error', 'textmaster', null),
                LOADING: Resource.msg('follow.loading.error', 'textmaster', null),
                NO_RECORDS: Resource.msg('follow.no.records.error', 'textmaster', null),
                TEMPLATE_NOT_FOUND: Resource.msg('order.template.not.found.error', 'textmaster', null),
                SELECT_TEMPLATE: Resource.msg('order.select.template.error', 'textmaster', null)
            },
            messages: {
                TRANSLATED_SUCCESS: Resource.msg('follow.translated.success.message', 'textmaster', null),
                VALIDATED_SUCCESS: Resource.msg('follow.validated.success.message', 'textmaster', null),
                WAITING: Resource.msg('general.waiting', 'textmaster', null),
                LOADING: Resource.msg('follow.loading', 'textmaster', null),
                CONFIRM_DELETE: Resource.msg('mapping.confirm.delete', 'textmaster', null)
            }
        };

        return resources;
    }
};

module.exports = resourceHelper;
