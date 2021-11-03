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
            if ($('.docs-followup').length) {
                this.docsFollowup.init();
            }
        },
        urls: {
            docDashboardData: 'TMComponents-DocDashboardData',
            docDashboardFirstRow: 'TMComponents-DocDashboardFirstRow',
            documentComplete: 'TMComponents-DocumentComplete'
        },
        docsFollowup: {
            dataTable: {},
            config: {
                documentPageNumber: 1,
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
            temporaryDocumentStatus : {
                validated: 0
            },
            getParams : function () {
                var params = {};
                window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
                    params[key] = value;
                });
                return params;
            },
            init: function () {
                var docsFollowup = this;
                docsFollowup.loadDocData(true);

                $('#filterTableDocuments').on('click', '.actions-validate', function () {
                    if (window.confirm(Resources.SWITCH_TO_COMPLETED)) {
                        var $validateButton = $(this)
                        var vars = docsFollowup.getParams();
                        var projectID = vars['projectID'];
                        var documentID = $validateButton.val();
                        $validateButton.attr('disabled', true);
                        $validateButton.text('Please wait...');

                        $.post(app.urls.documentComplete, {
                            projectID: projectID,
                            documentID: documentID
                        }, function (response) {
                            if (response) {
                                $validateButton.closest('tr').children('td:eq(4)').text(Resources.VALIDATED);
                                $validateButton.remove();

                                app.showSuccessMessage(Resources.VALIDATED_SUCCESS_MESSAGE);

                                docsFollowup.statusValues.review--;
                                docsFollowup.temporaryDocumentStatus.validated++;
                                docsFollowup.populateDocStatusDiagram();
                            }
                        });
                    }
                });
            },
            loadDocData: function (initialLoad) {
                var loadingText = 'Loading...';
                var docFollow = this;
                var button = $('.docs-followup .load-more input[type=button]');

                button.prop('disabled', true);
                button.val(loadingText);
                var vars = docFollow.getParams();
                var itemType = $('input[name=itemtype]').val();

                if (initialLoad && itemType === 'component') {
                    $('.page-details').find('.value').text(loadingText);
                    $('.page-details').removeClass('hide');
                }

                $.post(app.urls.docDashboardData, {
                    projectID: vars['projectID'],
                    documentPageNumber: docFollow.config.documentPageNumber
                }, function (output) {
                    try {
                        var documents = output.Documents;
                        var firstDocument;
                        docFollow.config.documentPageNumber++;
                        docFollow.config.showMore = output.ShowMore;

                        if (initialLoad && documents.length) {
                            if (itemType === 'component') {
                                $('.page-details').find('.value').text(output.PageName);
                            }

                            firstDocument = documents[0];
                            // load DataTables with one row
                            $.post(app.urls.docDashboardFirstRow, {
                                document: JSON.stringify(firstDocument)
                            }, function (data) {
                                $('#filterTableDocuments tbody').html(data);

                                var retry = true;

                                while (retry) {
                                    if (window.dataTablesLoaded) {
                                        docFollow.dataTable = window.tmjdt('#filterTableDocuments').DataTable({
                                            order: [
                                                [3, 'desc']
                                            ]
                                        });
                                        retry = false;
                                    }
                                }
                                // remove the only one row and add all the rows
                                docFollow.dataTable.row(':eq(0)').remove().draw();
                                docFollow.populateMoreDocData(documents);
                                docFollow.showMoreButton();
                                docFollow.customEvents();
                            });
                        } else if (documents.length) {
                            docFollow.config.lastPage = parseInt($('#filterTableDocuments_paginate span a.paginate_button:last-of-type').text(), 10);
                            docFollow.populateMoreDocData(documents);
                        } else {
                            $('#filterTableDocuments .ajax-loader').text('No records (Check error logs also)').css('padding-top', '40px');
                        }
                    } catch (err) {
                        alert('Error on loading data: ' + err.message);
                    }
                });
            },
            populateMoreDocData: function (documents) {
                var docFollow = this;
                documents.forEach(function (document) {
                    if (document) {
                        var itemID =  document.custom_data.item ? document.custom_data.item.id : '';
                        var pageID =  document.custom_data.item ? document.custom_data.item.page_id : '';
                        var itemName =  document.custom_data.item ? (document.custom_data.item.name ? document.custom_data.item.name : itemID) : '';
                        var words =  document.word_count ? document.word_count : '';
                        var updatedAt = document.updated_at ? document.updated_at.full : document.created_at.full;
                        var datePart = updatedAt && updatedAt.indexOf(' ') > -1 ? updatedAt.split(' ')[0] : '';
                        var timePart = updatedAt && updatedAt.indexOf(' ') > -1 ? updatedAt.split(' ')[1] : '';
                        var hour = timePart ? timePart.split(':')[0] : '00';
                        var minute = timePart ? timePart.split(':')[1] : '00';
                        var documentDate = datePart + ' ' + hour + ':' + minute;
                        var documentStatus = document.status ? document.status : '';
                        var storeURL = $('input[name=storeurl]').val();
                        var itemType = $('input[name=itemtype]').val();
                        var documentLink = $('input[name=documentlink]').val();
                        documentLink = documentLink.replace('<<documentid>>', document.id);
                        var storeLinkID = itemType === 'component' ? pageID : itemID;
                        storeURL = storeURL ? (storeURL + storeLinkID) : '';
                        var previewLink = storeURL ? '<a class="doc-link" href="' + storeURL + '" target="_blank">' + Resources.PREVIEW_LINK_LABEL + '</a><br/>' : '';
                        var reviewLink = documentLink ? '<a class="doc-link" href="' + documentLink + '" target="_blank">' + Resources.REVIEW_LINK_LABEL + '</a><br/>' : '';
                        var validateAction = '<button class="dashboard-action-button actions-validate" value=' + document.id + '>' + Resources.VALIDATE_ACTION + '</button>';
                        var links = documentStatus === Resources.IN_EXTRA_REVIEW || documentStatus === Resources.IN_REVIEW ? (previewLink + reviewLink) : '';
                        var actions = documentStatus === Resources.IN_REVIEW ? validateAction : '';

                        docFollow.dataTable.row.add([itemID, itemName, words, documentDate, documentStatus, links, actions]).draw();

                        if (documentStatus) {
                            switch (documentStatus) { // eslint-disable-line default-case
                            case Resources.IN_CREATION:
                                docFollow.statusValues.creation++;
                                break;
                            case Resources.COUNTING:
                                docFollow.statusValues.counting_words++;
                                break;
                            case Resources.IN_PROGRESS:
                            case Resources.INCOMPLETE:
                                docFollow.statusValues.progress++;
                                break;
                            case Resources.IN_EXTRA_REVIEW:
                            case Resources.IN_REVIEW:
                                docFollow.statusValues.review++;
                                break;
                            case Resources.COMPLETED:
                                docFollow.statusValues.completed++;
                                break;
                            }
                        }
                        // show first page in next set of loaded data
                        var lastPage = parseInt($('#filtertableProjects_paginate span a.paginate_button:last-of-type').text(), 10);
                        docFollow.dataTable.page(docFollow.config.lastPage === lastPage ? (docFollow.config.lastPage - 1) : docFollow.config.lastPage).draw(false);
                        docFollow.populateDocStatusDiagram();
                    }
                });
            },
            populateDocStatusDiagram: function () {
                var docFollow = this;
                var statusObj = docFollow.statusValues;
                var tempStatusObj = docFollow.temporaryDocumentStatus
                var total = statusObj.creation + statusObj.counting_words + statusObj.progress + statusObj.review + statusObj.completed + tempStatusObj.validated;

                // eslint-disable-next-line
                for (var key in statusObj) {
                    var statusPercent = Math.round((statusObj[key] / total) * 100);
                    statusPercent = isNaN(statusPercent) ? 0 : statusPercent;
                    $('.status-diagram table td.' + key + ' .count').text(statusObj[key]);
                    $('.status-diagram table td.' + key + ' .percent').text(statusPercent + '%');
                }
            },
            customEvents: function () {
                var docFollow = this;

                docFollow.dataTable.on('draw', function () {
                    docFollow.showMoreButton();
                });

                $('.docs-followup .load-more input[type=button]').on('click', function () {
                    docFollow.loadDocData(false);
                });
            },
            showMoreButton: function () {
                if ($('#filterTableDocuments_paginate span a.paginate_button:last-of-type').hasClass('current') &&
                    $('#filterTableDocuments_filter input[type=search]').val() === '' &&
                    this.config.showMore) {
                    $('.docs-followup .load-more').addClass('show');
                    $('.docs-followup .load-more input[type=button]').prop('disabled', false);
                    $('.docs-followup .load-more input[type=button]').val($('.followup .load-more input[type=button]').attr('title'));
                } else {
                    $('.docs-followup .load-more').removeClass('show');
                }
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
