'use strict';

$(document).ready(function () {
    var allowSell;
    chrome.storage.sync.get(['do_not_sell_data'], function (result) {
        if (result.do_not_sell_data == undefined) {
            allowSell = false;
        } else if (result.do_not_sell_data == "1") {
            allowSell = false;
        } else {
            allowSell = true;
        }
    });

    if (allowSell == true) {
        $('#off').show();
        $('#off').addClass('active');
        $('#on').addClass('inactive');

    } else {
        $('#on').show();
        $('#on').addClass('active');
        $('#off').addClass('inactive');
    }

    chrome.tabs.query({
        active: true,
        currentWindow: true
    }, function (tabs) {
        var tab = tabs[0];
        var url = new URL(tab.url);
        var origin = url.origin;
        $('#exception').append("<label class='text-info' id='origin'>" + origin + "</label>");
    });

    $('#exception').click(function () {
        var activeStatus = $('.status.active');
        var inactiveStatus = $('.status.inactive');
        activeStatus.hide();
        inactiveStatus.show();
        activeStatus.removeClass('active');
        activeStatus.addClass('inactive');
        inactiveStatus.removeClass('inactive');
        inactiveStatus.addClass('active');

        if ($('#exception').html() == 'Switch back to default preference') {
            var origin;

            chrome.tabs.query({
                active: true,
                currentWindow: true
            }, function (tabs) {
                var tab = tabs[0];
                var url = new URL(tab.url);
                origin = url.origin;

                $('#exception').html("Create exception for <a class='text-primary ml-1'\
                href='/skin/dashboard.html#introduction' target='_blank' id='exception-question'> \
                <i class='far fa-question-circle'></i></a><br /> \
                <label class='text-info' id='origin'>" + origin + "</label>");
            });

            setCustomPreference().then().catch(error => console.error(error));
            checkCustomPreference()
                .then(data => { // custom preference does exist for the current tab
                    var customPreferences = data.preference;
                    console.log('custom1: ', customPreferences);
                }).catch(val => {
                    console.error('does not exist1' + val);
                });
        } else {
            setCustomPreference();
            checkCustomPreference()
                .then(data => { // custom preference does exist for the current tab
                    var customPreferences = data.preference;
                    console.log('custom2: ', customPreferences);
                }).catch(val => {
                    console.log('does not exist2' + val);
                });
            $('#exception').html('Switch back to default preference');
        }
    });

    $('#exception').hover(function () {
        $('#origin').removeClass('text-info');
        $('#exception-question').removeClass('text-primary');
        $('#exception-question').addClass('text-light');
    }, function () {
        $('#origin').addClass('text-info');
        $('#exception-question').removeClass('text-light');
        $('#exception-question').addClass('text-primary');
    });

    $('#sendrequest').on("click", function () {
        // get my data
        var r1 = "u";
        // delete my data
        var r2 = "u";
        if ($("#get").get(0).checked) {
            r1 = "1";
        }
        if ($("#delete").get(0).checked) {
            r2 = "1";
        }
        chrome.storage.sync.get(['do_not_sell_data'], function (result) {
            // do not sell my data
            var r3, allowAllToSell;
            if (result.do_not_sell_data == undefined) {
                allowAllToSell = false;
                r3 = "u";
            } else if (result.do_not_sell_data == "1") {
                allowAllToSell = false;
                r3 = "1";
            } else {
                allowAllToSell = true;
                r3 = "0";
            }
            chrome.runtime.sendMessage({
                r3: r3
            });
            chrome.runtime.sendMessage({
                result: result
            });
            chrome.runtime.sendMessage({
                allowAllToSellFlag: allowAllToSell
            });
        });
        chrome.runtime.sendMessage({
            r1: r1
        });
        chrome.runtime.sendMessage({
            r2: r2
        });
    });
});