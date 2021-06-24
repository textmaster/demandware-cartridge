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
    var app = {
        init: function () {
            if ($('.primary-dashboard').length) {
                this.followup.init();
            }
        },
        urls: {
            dashboardData: 'TMComponents-DashboardData',
            dashboardFirstRow: 'TMComponents-DashboardFirstRow',
            launchProject: 'TMComponents-LaunchProject',
            documentFollowUp: 'TMTranslation-DocumentsFollowUp'
        },
        followup: {
            dataTable: {},
            config: {
                projectPageNumber: 1,
                showMore: true,
                lastPage: 0
            },
            statusValues: {
                creation: 0,
                counting_words: 0,
                progress: 0,
                review: 0,
                completed: 0
            },
            init: function () {
                var tooltip;
                var followUp = this;

                $('.followup').on('mousedown', 'a.review-link', function () {
                    tooltip = $(this).attr('title');
                    $(this).closest('li').append('<span class="tooltip">' + tooltip + '</span>');
                })
                    .on('mouseup', 'a.review-link', function () {
                        $('span.tooltip').remove();
                    });

                followUp.loadData(true);

                $('#filtertableProjects').on('click', '.actions-translate', function () {
                    var $button = $(this);
                    var buttonLabel = $button.text();
                    var projectID = $button.val();
                    var data = {projectID: projectID};
                    $button.attr('disabled', true);
                    $button.text('Please wait...');

                    $.post(app.urls.launchProject, data, function (response) {
                        if (response) {
                            $button.closest('tr').children('td:eq(6)').text(Resources.IN_PROGRESS);
                            $button.remove();

                            app.showSuccessMessage(Resources.TRANSLATED_SUCCESS_MESSAGE);

                            followUp.statusValues.creation--;
                            followUp.statusValues.progress++;
                            followUp.populateStatusDiagram();
                        } else {
                            $button.attr('disabled', false);
                            $button.text(buttonLabel);
                            $button.parent().append($('<div class="translate-action-error"></div>').text(Resources.TRANSLATE_ACTION_ERROR));
                        }
                    });
                });
            },
            loadData: function (initialLoad) {
                var follow = this;
                var button = $('.followup .load-more input[type=button]');

                button.prop('disabled', true);
                button.val('Loading...');
                $.post(app.urls.dashboardData, follow.config, function (data) {
                    try {
                        var output = data;
                        var projects = output.Projects;
                        var firstProject;
                        follow.config.projectPageNumber++;
                        follow.config.showMore = output.ShowMore;

                        if (initialLoad && projects.length) {
                            firstProject = projects[0];
                            // load DataTables with one row
                            $.post(app.urls.dashboardFirstRow, {
                                project: JSON.stringify(firstProject)
                            }, function (data) {
                                $('#filtertableProjects tbody').html(data);

                                var retry = true;

                                while (retry) {
                                    if (window.dataTablesLoaded) {
                                        follow.dataTable = window.tmjdt('#filtertableProjects').DataTable({
                                            order: [
                                                [5, 'desc']
                                            ]
                                        });

                                        retry = false;
                                    }
                                }
                                // remove the only one row and add all the rows
                                follow.dataTable.row(':eq(0)').remove().draw();
                                follow.populateMoreData(projects);
                                follow.showMoreButton();
                                follow.customEvents();
                            });
                        } else if (projects.length) {
                            follow.config.lastPage = parseInt($('#filtertableProjects_paginate span a.paginate_button:last-of-type').text(), 10);
                            follow.populateMoreData(projects);
                        } else {
                            $('#filtertableProjects .ajax-loader').text('No records').css('padding-top', '40px');
                        }
                    } catch (err) {
                        alert('Error on loading data: ' + err.message);
                    }
                });
            },
            populateMoreData: function (projects) {
                var follow = this;
                projects.forEach(function (project) {
                    if (project.name) {
                        var docsCount = project.documentsCount ? project.documentsCount : 0;
                        var updatedAt = project.updated_at ? project.updated_at.full : project.created_at.full;
                        var datePart = updatedAt && updatedAt.indexOf(' ') > -1 ? updatedAt.split(' ')[0] : '';
                        var timePart = updatedAt && updatedAt.indexOf(' ') > -1 ? updatedAt.split(' ')[1] : '';
                        var hour = timePart ? timePart.split(':')[0] : '00';
                        var minute = timePart ? timePart.split(':')[1] : '00';
                        var projectDate = datePart + ' ' + hour + ':' + minute;
                        var itemType = project.custom_data.itemType ? project.custom_data.itemType : '';
                        var itemTypeFormatted = app.utils.firstLetterCapital(itemType);
                        var projectLocale = project.locale ? project.locale : '';
                        var projectStatus = project.status;
                        var translateAction = '<button class="dashboard-action-button actions-translate" value=' + project.id + '>' + Resources.TRANSLATE_ACTION + '</button>';
                        var actions = projectStatus === Resources.IN_CREATION ? translateAction : '';
                        var price = project.currency;
                        var createdAt = project.created_at.full;
                        var creationDate = createdAt && createdAt.indexOf(' ') > -1 ? createdAt.split(' ')[0] : '';
                        var projectName = encodeURIComponent(project.name.trim());
                        var sourceLanguage = project && project.custom_data && project.custom_data.sfccLanguageFrom ? project.custom_data.sfccLanguageFrom : project.language_from;
                        var queryParam = '?projectID=' + project.id + '&projName=' + projectName + '&projRef=' + project.reference + '&sourceLang=' + sourceLanguage + '&targetLang=' + project.localeID
                        + '&creationDate=' + creationDate + '&lastUpdatedDate=' + datePart + '&itemType=' + itemType;
                        var projectTitle = '<a href='+ app.urls.documentFollowUp + queryParam + ' target="_blank" class ="doc-link"> '+ project.name +'</a>';

                        follow.dataTable.row.add([projectTitle, docsCount, itemTypeFormatted, projectLocale, price, projectDate, projectStatus, actions]).draw();

                        if (projectStatus) {
                            switch (projectStatus) { // eslint-disable-line default-case
                            case Resources.IN_CREATION:
                                follow.statusValues.creation++;
                                break;
                            case Resources.COUNTING:
                                follow.statusValues.counting_words++;
                                break;
                            case Resources.IN_PROGRESS:
                            case Resources.INCOMPLETE:
                                follow.statusValues.progress++;
                                break;
                            case Resources.IN_REVIEW:
                                follow.statusValues.review++;
                                break;
                            case Resources.COMPLETED:
                                follow.statusValues.completed++;
                                break;
                            }
                        }
                    }
                });
                // show first page in next set of loaded data
                var lastPage = parseInt($('#filtertableProjects_paginate span a.paginate_button:last-of-type').text(), 10);
                follow.dataTable.page(follow.config.lastPage === lastPage ? (follow.config.lastPage - 1) : follow.config.lastPage).draw(false);
                follow.populateStatusDiagram();
            },
            populateStatusDiagram: function () {
                var follow = this;
                var statusObj = follow.statusValues;
                var total = statusObj.creation + statusObj.counting_words + statusObj.progress + statusObj.review + statusObj.completed;

                // eslint-disable-next-line
                for (var key in statusObj) {
                    $('.status-diagram table td.' + key + ' .count').text(statusObj[key]);
                    $('.status-diagram table td.' + key + ' .percent').text(Math.round((statusObj[key] / total) * 100) + '%');
                }
            },
            customEvents: function () {
                var follow = this;

                follow.dataTable.on('draw', function () {
                    follow.showMoreButton();
                });

                $('.followup .load-more input[type=button]').on('click', function () {
                    follow.loadData(false);
                });
            },
            showMoreButton: function () {
                if ($('#filtertableProjects_paginate span a.paginate_button:last-of-type').hasClass('current') &&
                    $('#filtertableProjects_filter input[type=search]').val() === '' &&
                    this.config.showMore) {
                    $('.followup .load-more').addClass('show');
                    $('.followup .load-more input[type=button]').prop('disabled', false);
                    $('.followup .load-more input[type=button]').val($('.followup .load-more input[type=button]').attr('title'));
                } else {
                    $('.followup .load-more').removeClass('show');
                }
            }
        },
        utils: {
            firstLetterCapital: function (str) {
                return str.charAt(0).toUpperCase() + str.slice(1);
            }
        },
        showSuccessMessage: function (message) {
            var windowViewTop = $(window).scrollTop();
            var targetTop = $('.followup table.dataTable thead').offset().top;
            var headerHeight = $('.header.header--Sandbox').height();

            if ((windowViewTop + headerHeight + 30) > targetTop) {
                $('.success-message').addClass('sticky');
                $('.success-message').css('top', (headerHeight + 5) + 'px');
            }

            $('.success-message').text(message);
            $('.success-message').addClass('show');

            setTimeout(function () {
                $('.success-message').removeClass('show');
                $('.success-message').removeClass('sticky');
            }, 3000);
        }
    };

    $(document).ready(function () {
        app.init();
    });
})(jQuery);
