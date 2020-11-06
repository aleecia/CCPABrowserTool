'use strict';

$(document).ready(function () {
    var allowSell = false;
    var age;
    var defaultPreference;
    var customPreference;

    /**
     * 1. Get default preference, 1 => do not sell my data; 0 => allow selling my data.
     * 2. Check if the custom flag has been set, 1 => custom set (opposite to default), 0 => no custom set for this site
     * 3. Get user DOB to determine whether he can change the setting or not.
     * 4. According to these information, render the tool page.
     * 5. Handle onClick callbacks.
     */

    getDefaultPreference()
        .then(data => {
            if(!data) {
                return;
            }
            defaultPreference = data.default;

            checkCustomPreference()
                .then(data => {
                    customPreference = data;
                    if ((defaultPreference == 0 && customPreference == 0) || (defaultPreference == 1 && customPreference == 1)) {
                        allowSell = true;
                    }

                    getUserDOB().then(data => {
                        var birthday = moment(data.userDOB);
                        console.log('birthday:', birthday)
                        var today = moment();
                        age = today.diff(birthday, 'years');
                        if (age < 13) {
                            $('#switch_exception').html('Children under age 13 are by default enroll do not sell personal information for');
                        }

                        if (allowSell == true) {
                            $('#off').show();
                            $('#off').addClass('active');
                            $('#on').addClass('inactive');

                        } else {
                            $('#on').show();
                            $('#on').addClass('active');
                            $('#off').addClass('inactive');
                        }

                        if (customPreference == 1) {
                            $('#switch_exception').html('Switch back to default preference');
                            $('#switch_exception').removeClass('default');
                            $('#switch_exception').addClass('exception');
                        } else {
                            chrome.tabs.query({
                                active: true,
                                currentWindow: true
                            }, function (tabs) {
                                var tab = tabs[0];
                                var url = new URL(tab.url);
                                var origin = url.origin;
                                $('#switch_exception').append("<label class='text-info' id='origin'>" + origin + "</label>");
                            });
                        }

                        $('#switch_exception').click(function () {
                            if (age < 13) {
                                return;
                            }
                            var activeStatus = $('.status.active');
                            var inactiveStatus = $('.status.inactive');
                            activeStatus.hide();
                            inactiveStatus.show();
                            activeStatus.removeClass('active');
                            activeStatus.addClass('inactive');
                            inactiveStatus.removeClass('inactive');
                            inactiveStatus.addClass('active');

                            if ($('#switch_exception').hasClass('exception')) {
                                var origin;

                                chrome.tabs.query({
                                    active: true,
                                    currentWindow: true
                                }, function (tabs) {
                                    var tab = tabs[0];
                                    var url = new URL(tab.url);
                                    origin = url.origin;

                                    $('#switch_exception').html("Create exception for <a class='text-primary ml-1'\
                            href='/skin/dashboard.html#introduction' target='_blank' id='exception-question'> \
                            <i class='far fa-question-circle'></i></a><br /> \
                            <label class='text-info' id='origin'>" + origin + "</label>");
                                });

                                deleteCustomPreference().then(

                                    () => {
                                        $('#switch_exception').removeClass('exception');
                                        $('#switch_exception').addClass('default');
                                    }

                                ).catch(error => console.error(error));
                            } else {
                                setCustomPreference().then(
                                    () => {
                                        $('#switch_exception').removeClass('default');
                                        $('#switch_exception').addClass('exception');
                                        $('#switch_exception').html('Switch back to default preference');

                                    }).catch(error => console.error(error));;
                            }
                        });

                        $('#switch_exception').hover(function () {
                            if (age < 13) {
                                return;
                            }
                            $('#origin').removeClass('text-info');
                            $('#exception-question').removeClass('text-primary');
                            $('#exception-question').addClass('text-light');
                        }, function () {
                            if (age < 13) {
                                return;
                            }
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
                            chrome.runtime.sendMessage({
                                r1: r1
                            });
                            chrome.runtime.sendMessage({
                                r2: r2
                            });
                            window.close();
                            chrome.runtime.sendMessage({
                                'refresh' : true
                            })
                        });
                    });

                });
        });
});