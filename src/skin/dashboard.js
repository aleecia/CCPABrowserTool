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
                            const sortedDomain = Array.from(data).sort();
                            for (const [index, domain] of sortedDomain.entries()) {
                                $('#exception_list').append('<p class="mb-2"><a class="remove_from_list" id=' + index + '><i class="fas fa-trash-alt mr-2"></i></a>' +
                                    domain + '</p>');
                            }

                            $('a[class="remove_from_list"]').on('click', function () {
                                // console.log(this.id);
                            })

                        });

                    $('input[type="radio"][name="allow-sell-radio-group"]').change(function () {
                        setDefaultPreference(this.value);
                    })
                });
        });
};