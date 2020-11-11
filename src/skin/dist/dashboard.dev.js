'use strict'; // TODO: Watch URL change to determine which tab to show

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

$(document).ready(function () {
  function validateTabID(tabID) {
    var validTabIDSet = $('.nav-link').map(function getTabId() {
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
    var $allTabs = $('.nav-link');
    var $allTabPanels = $('.tab');
    $allTabs.removeClass('active');
    $allTabPanels.hide(); // 2. Get active tab to show

    var validTabID = validateTabID(tabID);
    var $activeTab = $(".nav-link[href='".concat(validTabID, "']"));
    $activeTab.addClass('active'); // 3. Store active tab last time - fix refresh -> reset bug

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
  /**
   * Determine general settings status
   */

  getIsParentMode().then(function (data) {
    var isParentMode = data.isParentMode;
    console.log('isParentMode', isParentMode);

    if (isParentMode == true) {
      $('#settings-content').hide();
      $('#wrong-password').hide();
      $('#parent-password-submit').on('click', function () {
        var input_pw = $('#parent-password').val();
        getParentPassword().then(function (data) {
          var pw = data.parentPassword;

          if (input_pw == pw) {
            $('#parent-unlock').hide();
            $('#settings-content').show();
            generalSetting();
          } else {
            $('#wrong-password').show();
          }
        });
      });
    } else {
      $('#parent-unlock').hide();
      generalSetting();
    }
  });
});

function generalSetting() {
  getDefaultPreference().then(function (data) {
    var allowSell = false;
    var defaultPreference = data["default"];
    checkCustomPreference().then(function (data) {
      var customPreference = data;
      /* TEST CONSOLE
      console.log('default? ', defaultPreference);
      console.log('custom? ', customPreference);
      */

      if (defaultPreference == 0 && customPreference == 0 || defaultPreference == 1 && customPreference == 1) {
        allowSell = true;
        $('#disallow-sell').prop("checked", false);
        $('#allow-sell').prop("checked", true);
      }

      getExceptionsList().then(function (data) {
        var sortedDomain = Array.from(data).sort();
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = sortedDomain.entries()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var _step$value = _slicedToArray(_step.value, 2),
                index = _step$value[0],
                domain = _step$value[1];

            $('#exception_list').append('<p class="mb-2"><a class="remove_from_list" id=' + index + '><i class="fas fa-trash-alt mr-2"></i></a>' + domain + '</p>');
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator["return"] != null) {
              _iterator["return"]();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }

        $('a[class="remove_from_list"]').on('click', function () {// console.log(this.id);
        });
      });
      $('input[type="radio"][name="allow-sell-radio-group"]').change(function () {
        setDefaultPreference(this.value);
      });
    });
  });
}

;