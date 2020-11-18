'use strict';

// TODO: Watch URL change to determine which tab to show

$(document).ready(function () {

    function validateTabID(tabID) {
        const validTabIDSet = $('.nav-link').map(function getTabId() {
            return $(this).attr('href');
        }).get();
        if (!tabID || !validTabIDSet.includes(tabID)) {
            return '#information';
        }
        return tabID;
    }

    function activateTabOnRefresh() {
        var url = document.location.toString();
        if (url.match('#')) {
            switchToTab('#' + url.split('#')[1]);
        }
    }

    function switchToTab(tabID) {
        // 1. Hide all tabs first
        const $allTabs = $('.nav-link');
        const $allTabPanels = $('.tab');
        $allTabs.removeClass('active');
        $allTabPanels.hide();

        // 2. Get active tab to show
        const validTabID = validateTabID(tabID);
        const $activeTab = $(`.nav-link[href='${validTabID}']`);
        $activeTab.addClass('active');

        // 3. Store active tab last time - fix refresh -> reset bug
        $($activeTab.attr('href')).show();
    }

    /**
     * Below are scripts that get executed once mounted
     */
    activateTabOnRefresh();

    /**
     * Bind callbacks
     */
    $('.nav-link').on('click', function switchTab() {
        const tabID = $(this).attr('href');
        switchToTab(tabID);
    });

    /**
     * Determine general settings status
     */
    getIsParentMode()
        .then(data => {
            const isParentMode = data.isParentMode;
            console.log('isParentMode', isParentMode);
            if (isParentMode == true) {
                $('#settings-content').hide();
                $('#wrong-password').hide();

                $('#parent-password-submit').on('click', function () {
                    const input_pw = $('#parent-password').val();
                    getParentPassword()
                        .then(data => {
                            const pw = data.parentPassword;

                            if (input_pw == pw) {
                                $('#parent-unlock').hide();
                                $('#settings-content').show();
                                generalSetting();
                            } else {
                                $('#wrong-password').show();
                            }
                        })
                });
            } else {
                $('#parent-unlock').hide();
                generalSetting();
            }
        })

    getAllRecords()
        .then(data => {
            if (!data || data.length == 0) {
                $('#display-history').hide();
            } else {
                $('#no-history').hide();
                const history = Array.from(data);
                if (history.filter(p => p.r1 == 1).length > 0) {
                    for (const [index, detail] of history.filter(p => p.r1 == 1).entries()) {
                        const time = new Date(parseInt(detail.date.time, 10));
                        $('#request-info-history').append("<tr><td style='width: 400px'>" + detail.domain + "</td><td>" + time.toLocaleDateString("en-US") + " " + time.toLocaleTimeString("en-US") + "</td></tr>");
                    }
                } else {
                    $('#request-info-history').hide();
                    $('#request-header').hide();
                }
                if (history.filter(p => p.r2 == 1).length > 0) {
                    for (const [index, detail] of history.filter(p => p.r2 == 1).entries()) {
                        const time = new Date(parseInt(detail.date.time, 10));
                        $('#delete-info-history').append("<tr><td style='width: 400px'>" + detail.domain + "</td><td>" + time.toLocaleDateString("en-US") + " " + time.toLocaleTimeString("en-US") + "</td></tr>");
                    }
                    //console.log('history', history);
                } else {
                    $('#delete-info-history').hide();
                    $('#delete-header').hide();
                }
            }
        })

    getDoNotSaleCount()
        .then(doNotSaleCount => {
            getAllowSaleCount()
                .then(allowSaleCount => {
                    if (doNotSaleCount != 0 || allowSaleCount != 0) {
                        $('#no-statistics').hide();
                        $('#statistics-content').append("We have sent out " + doNotSaleCount + " times 'do not sell my information' requests for you! <br/>");
                        $('#statistics-content').append("We have sent out " + allowSaleCount + " times 'allow selling my information' requests for you!");
                    }
                }) 
        })
});

function generalSetting() {
    getDefaultPreference()
        .then(data => {
            var allowSell = false;
            var defaultPreference = data.default;

            checkCustomPreference()
                .then(data => {
                    var customPreference = data;
                    /* TEST CONSOLE
                    console.log('default? ', defaultPreference);
                    console.log('custom? ', customPreference);
                    */
                    if ((defaultPreference == 0 && customPreference == 0) || (defaultPreference == 1 && customPreference == 1)) {
                        allowSell = true;
                        $('#disallow-sell').prop("checked", false);
                        $('#allow-sell').prop("checked", true);
                    }

                    getExceptionsList()
                        .then(data => {
                            if (allowSell) {
                                $("#list_explain").append('<p>Your default setting allow websites to sell your information. This exception list contains the websites you do not want them to sell your data</p>')

                            } else {
                                $("#list_explain").append('<p>Your default setting ask not to sell your information. This exception list contains the websites that you allow to sell your data</p>')

                            }

                            const sortedDomain = Array.from(data).sort();
                            for (const [index, domain] of sortedDomain.entries()) {
                                $('#exception_list').append('<p class="mb-2"><a class="remove_from_list" id=' + index + '><i class="fas fa-trash-alt mr-2"></i></a>' +
                                    domain + '</p>');
                            }

                            $("#submiturl").on("click", function () {
                                const input = $("#input_url").val();
                                if (/^https:./.test(input) || /^http:./.test(input)) {
                                    try {
                                        const domain = new URL(input).hostname;
                                        addURLtoCustomList(domain)
                                            .then(() => {
                                                $('#invalid-url').prop("hidden", true);
                                                location.reload()
                                            })
                                    } catch (error) {
                                        $('#invalid-url').prop("hidden", false);
                                    };
                                } else {
                                    $('#invalid-url').prop("hidden", false);
                                }

                            })

                            $('a[class="remove_from_list"]').on('click', function () {

                                var index = $(this).attr("id")
                                var domain = sortedDomain[index]
                                removeURLfromCustomList(domain)
                                    .then(() => {
                                        location.reload()
                                    })
                            })

                        });
                    $("#save").on('click', function () {
                        var sell = document.querySelector('input[name="allow-sell-radio-group"]:checked').value;
                        setDefaultPreference(sell);
                        location.reload()
                    })
                });
        });
};