'use strict';

$(document).ready(function () {
    $('#on').show();
    $('#on').addClass('active');
    $('#off').addClass('inactive');

    chrome.tabs.query({
        active: true,
        currentWindow: true
    }, function (tabs) {
        var tab = tabs[0];
        var url = new URL(tab.url);
        var domain = url.hostname;
        $('#exception').append("<label class='text-info' id='origin'>" + domain + "</label>");
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
            $('#exception').html("Create exception for <a class='text-primary ml-1' href='/skin/dashboard.html#introduction' target='_blank' id='exception-question'><i class='far fa-question-circle'></i></a><br />");
            chrome.tabs.query({
                active: true,
                currentWindow: true
            }, function (tabs) {
                var tab = tabs[0];
                var url = new URL(tab.url);
                var domain = url.hostname;
                $('#exception').append("<label class='text-info' id='origin'>" + domain + "</label>");
            });

        } else {
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

});