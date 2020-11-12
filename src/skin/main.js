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
                defaultPreference = 2;
                $('#exception-section').prop('hidden', true);
            } else {
                defaultPreference = data.default;
            }
            if (defaultPreference == 0) {
                $('#default-setting').html('Allow selling my information');
            } else if (defaultPreference == 1) {
                $('#default-setting').html('Do not sell my information');
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

                /*
                getLastRequest(origin)
                    .then(data => {
                        console.log('history', data);
                    })
                    */
                // $('#most-recent-history')
            });

            checkCustomPreference()
                .then(data => {
                    customPreference = data;
                    if (customPreference == 1) {
                        $('#ex-for-current-website').prop("checked", true);
                        console.log('custom for current website');
                    } else {
                        $('#ex-for-current-website').prop("checked", false);
                        console.log('not custom for current website');
                    }

                    $('#ex-for-current-website').on('click', function () {
                        if ($(this).is(':checked')) {
                            setCustomPreference().catch(error => console.error(error));
                        } else {
                            deleteCustomPreference().catch(error => console.error(error));
                        }
                    })

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



                        $('#get-for-current-website').on("click", function () {
                            chrome.runtime.sendMessage({
                                firstParty_get: true
                            });
                        });
                        $('#delete-for-current-website').on("click", function () {
                            chrome.runtime.sendMessage({
                                firstParty_delete: true
                            });
                        });
                        $('#get-for-third-parties').on("click", function () {
                            chrome.runtime.sendMessage({
                                thirdParty_get: true
                            });
                        });
                        $('#delete-for-third-parties').on("click", function () {
                            chrome.runtime.sendMessage({
                                thirdParty_delete: true
                            });
                        });


                        /*

                        $('#go-select').on('click', function () {
                            chrome.storage.local.get("thirdPartyList", data => {
                                const thirdPartyListRes = data.thirdPartyList;
                                console.log(thirdPartyListRes);
                                for (const [index, thirdParty] of thirdPartyListRes.entries()) {
                                    $('#select-content').append(thirdParty + '<br />');

                                }

                                resetThirdPartyList().catch(error => console.error(error));
                                
                            });

                            $('#main-page').prop('hidden', true);
                            $('#go-back').prop('hidden', false);
                            $('#select-third-party').prop('hidden', false);
                        });
                        */



                        chrome.runtime.onMessage.addListener((request) => {
                            if (request.getMessage) {
                                window.close();
                                chrome.runtime.sendMessage({
                                    refresh: true
                                });
                            }
                        })
                    });


                });
        });
});