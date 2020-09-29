'use strict';

var THIRTY_MINUTES_IN_MILLISECONDS = 1800000; // TODO: Watch URL change to determine which tab to show

$(document).ready(function () {
  function validateTabID(tabID) {
    var validTabIDSet = $('.nav-link').map(function getTabId() {
      return $(this).attr('href');
    }).get();

    if (!tabID || !validTabIDSet.includes(tabID)) {
      return '#introduction';
    }

    return tabID;
  }

  function activateTabOnRefresh() {
    var activeTabID = getStorageCookie('active_tab');

    if (activeTabID == undefined) {
      switchToTab("#introduction");
      return;
    }

    switchToTab(activeTabID);
  }

  function switchToTab(tabID) {
    // 1. Hide all tabs first
    var $allTabs = $('.nav-link');
    var $allTabPanels = $('.tab');
    $allTabs.removeClass('active');
    $allTabPanels.hide(); // 2. Get active tab to show

    var validTabID = validateTabID(tabID);
    var $activeTab = $(".nav-link[href='".concat(validTabID, "']"));
    $activeTab.addClass('active'); // 3. Store active tab last time - fix refresh -> reset bug

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
    var tabID = $(this).attr('href');
    switchToTab(tabID);
  });
});