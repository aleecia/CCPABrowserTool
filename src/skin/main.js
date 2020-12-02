'use strict';

$(document).ready(function () {
    /**
     * 1. Get default preference, 1 => do not sell my data; 0 => allow selling my data.
     * 2. Check if the custom flag has been set, 1 => custom set (opposite to default), 0 => no custom set for this site
     * 3. Get user DOB to determine whether he can change the setting or not.
     * 4. According to these information, render the tool page.
     * 5. Handle onClick callbacks.
     */

    getIsParentMode()
        .then(data => {
            if (data != undefined && data != null && data.isParentMode == true) {
                getParentAccessExpireTime()
                    .then(data => {
                        const currentTimestamp = new Date().getTime();
                        if (data.parentAccessExpireTime != undefined && data.parentAccessExpireTime != null && data.parentAccessExpireTime != 0 && currentTimestamp < data.parentAccessExpireTime) {
                            showMain();
                        } else {
                            $('#main-page').hide();
                            $('body').css('min-height', '260px');
                            $('#parent-unlock').show();
                            $('#wrong-password').hide();

                            $('#parent-password-submit').on('click', function () {
                                const input_pw = $('#parent-password').val();
                                getParentPassword()
                                    .then(data => {
                                        const password = data.parentPassword.password;
                                        const key = data.parentPassword.key;
                                        const pw = sjcl.decrypt(key, password)
                                        if (input_pw == pw) {
                                            const currentTime = new Date();
                                            const expireTime = moment(currentTime).add(15, 'm').toDate();
                                            setParentAccessExpireTime(expireTime.getTime());
                                            showMain();
                                        } else {
                                            $('#wrong-password').show();
                                        }
                                    })

                            });
                        }

                    });
            } else {
                showMain();
            }
        })
});

function showMain() {
    var age;
    var defaultPreference = 2;
    var customPreference = 0;

    $('#parent-unlock').hide();
    $('#main-page').show();
    $('body').css('min-height', '380px');
    getDefaultPreference()
        .then(data => {
            if (!data) {
                // TODO: ADD SOMETHING ELSE
                $('#exception-section').prop('hidden', true);
            } else {
                defaultPreference = data.default;
            }
            if (defaultPreference == 0) {
                $('#default-setting').html('Allow selling my information');
                $('#default-setting-2').html('allow selling my information');
            } else if (defaultPreference == 1) {
                $('#default-setting').html('Do not sell my information');
                $('#default-setting-2').html('do not sell my information');
            }
            var origin;

            chrome.tabs.query({
                active: true,
                currentWindow: true
            }, function (tabs) {
                if (tabs != undefined && tabs != null) {
                    console.log("1");
                    var tab = tabs[0];
                    var url = new URL(tab.url);
                    origin = url.origin;
                    $('.current-website').html('&bull;&nbsp; ' + origin);

                    if (url != undefined && url != null) {
                        getLastRequest(url.hostname)
                            .then(data => {
                                if (data != undefined && data != null) {
                                    const requestType = data.r1 == 1 ? "getting information" : "deleting information";
                                    const time = new Date(parseInt(data.date.time, 10));
                                    $('#most-recent-history').html("Last request for " + requestType + " was sent: " + time.toLocaleDateString("en-US") + " " + time.toLocaleTimeString("en-US"))
                                } else {
                                    $('#most-recent-history').html("No get or delete information requests have been sent for current website!");
                                }
                            })
                            .catch(err => console.log(err));
                    }
                }
            });

            checkCustomPreference()
                .then(data => {
                    if (!data) {
                        customPreference = 0;
                    } else {
                        customPreference = data;
                    }
                    if (customPreference == 1) {
                        $('#ex-for-current-website').prop("checked", true);
                    } else {
                        $('#ex-for-current-website').prop("checked", false);
                    }

                    checkStopSendingForThirdParty()
                        .then(data => {
                            if (data) {
                                blockThirdParty = true;
                                $('#stop-for-third-parties').prop("checked", true);
                            } else {
                                $('#stop-for-third-parties').prop("checked", false);
                            }

                            $('#ex-for-current-website').on('click', function () {
                                if ($(this).is(':checked')) {
                                    setCustomPreference().catch(error => console.error(error));
                                } else {
                                    deleteCustomPreference().catch(error => console.error(error));
                                }
                            })

                            $('#stop-for-third-parties').on('click', function () {
                                if ($(this).is(':checked')) {
                                    setStopSendingForThirdParty().catch(error => console.error(error));
                                } else {
                                    deleteStopSendingForThirdParty().catch(error => console.error(error));
                                }
                            })

                            getUserDOB().then(data => {
                                var birthday = moment(data.userDOB);
                                var today = moment();
                                age = today.diff(birthday, 'years');
                                if (age < 13 && age > 0) {
                                    $('#switch-exception').html('Children under age 13 are by default enroll do not sell personal information for');
                                    $('#create-ex-switch').hide();
                                } else {
                                    $('#switch-exception').html('Create exception for: <a class="text-primary ml-1" href="/skin/dashboard.html#information" target="_blank" id="exception-question"><i class="far fa-question-circle"></i></a>');
                                    $('#create-ex-switch').show();
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
                        })
                        .catch(err => console.log(err));
                })
                .catch(err => console.log(err));
        }).catch(err => console.log(err));
}