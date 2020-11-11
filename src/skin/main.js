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
            if (!data) {
                // TODO: ADD SOMETHING ELSE
                return;
            }
            defaultPreference = data.default;
            if (defaultPreference == 0) {
                $('#default-setting').html('Allow selling my information');
            }
            var origin;

            chrome.tabs.query({
                active: true,
                currentWindow: true
            }, function (tabs) {
                var tab = tabs[0];
                var url = new URL(tab.url);
                origin = url.origin;
                $('.current-website').html('&bull;&nbsp; ' + origin);
            });

            checkCustomPreference()
                .then(data => {
                    customPreference = data;
                    if ((defaultPreference == 0 && customPreference == 0) || (defaultPreference == 1 && customPreference == 1)) {
                        allowSell = true;
                    }

                    getUserDOB().then(data => {
                        var birthday = moment(data.userDOB);
                        // console.log('birthday:', birthday)
                        var today = moment();
                        age = today.diff(birthday, 'years');
                        if (age < 13) {
                            $('#switch-exception').html('Children under age 13 are by default enroll do not sell personal information for');
                        }

                        /*
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
                                'refresh': true
                            })
                        });
                        */
                    });

                });
        });
});