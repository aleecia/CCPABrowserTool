'use strict';

// TODO: Watch URL change to determine which tab to show

$(document).ready(function () {

    function validateTabID(tabID) {
        const validTabIDSet = $('.nav-link').map(function getTabId() {
            return $(this).attr('href');
        }).get();
        if (!tabID || !validTabIDSet.includes(tabID)) {
            return '#introduction';
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
        setStorageCookie('active_tab', $activeTab.attr('href'), THIRTY_MINUTES_IN_MILLISECONDS);
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
});
