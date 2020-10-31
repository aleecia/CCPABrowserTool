'use strict';

var ccpa_r1 = "u";
var ccpa_r2 = "u";
var ccpa_r3 = "u";
var hasPreference = false;

var allowAllToSellFlag = false;
var inExceptionList = false;
var originURL = "undefined";


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.r1) {
        ccpa_r1 = request.r1;
        hasPreference = true;
    }
    if (request.r2) {
        ccpa_r2 = request.r2;
        hasPreference = true;
    }
    if (request.r3) {
        ccpa_r3 = request.r3;
        hasPreference = true;
    }
    if (request.allowAllToSellFlag != undefined || request.allowAllToSellFlag == false) {
        allowAllToSellFlag = request.allowAllToSellFlag;
    }

});

function parseOriginURL(url) {
    return url.match(/^[\w-]+:\/{2,}\[?[\w\.:-]+\]?(?::[0-9]*)?/)[0];
}

async function initialize() {
    setupHeaderModListener();
}

initialize();

function storeFirstPartyRequest(r3, r2, r1) {
    return new Promise((resolve, reject) => {
        chrome.tabs.getSelected(null, (tab) => {
            var tablink = new URL(parseOriginURL(tab.url)).hostname;
            chrome.storage.sync.get('firstPartyRequests', data => {
                if (chrome.runtime.lastError) {
                    reject(Error(chrome.runtime.lastError.message))
                } else {
                    var firstPartyRequests = data.firstPartyRequests
                    var now = new Date()
                    var newRequest = {
                        "domain": tablink,
                        "r1": r1,
                        "r2": r2,
                        "r3": r3,
                        "date": {
                            "day": now.getDate(),
                            "month": now.getMonth(),
                            "year": now.getFullYear(),
                            "time": now.getTime()
                        }
                    }
                    if (firstPartyRequests) {
                        firstPartyRequests = firstPartyRequests.filter(p => p.domain !== tablink)
                        firstPartyRequests.push(newRequest)
                    } else {
                        firstPartyRequests = [newRequest]
                    }
                    chrome.storage.sync.set({ firstPartyRequests }, () =>
                        chrome.runtime.lastError ?
                            reject(Error(chrome.runtime.lastError.message)) :
                            resolve()
                    )
                }
            })
        })
    })
}

function storeThirdPartyRequest(r3) {
    return new Promise((resolve, reject) => {
        chrome.tabs.getSelected(null, (tab) => {
            var tablink = new URL(parseOriginURL(tab.url)).hostname;
            if (chrome.runtime.lastError) {
                reject(Error(chrome.runtime.lastError.message))
            } else {
                chrome.storage.sync.get('thirdPartyRequests', data => {
                    if (chrome.runtime.lastError) {
                        return;
                    }
                    var thirdPartyRequests = data.thirdPartyRequests
                    var now = new Date()
                    var newRequest = {
                        "domain": tablink,
                        "r3": r3,
                        "date": {
                            "day": now.getDate(),
                            "month": now.getMonth(),
                            "year": now.getFullYear()
                        }
                    }
                    if (thirdPartyRequests) {
                        thirdPartyRequests = thirdPartyRequests.filter(p => p.domain !== tablink)
                        thirdPartyRequests.push(newRequest)
                    } else {
                        thirdPartyRequests = [newRequest]
                    }
                    chrome.storage.sync.set({
						thirdPartyRequests
					}, () =>
                        chrome.runtime.lastError ?
                        reject(Error(chrome.runtime.lastError.message)) :
                        resolve(thirdPartyRequests)
                    )
                })
            }
        })
    })
}

function isInExceptionListHelper() {
    chrome.tabs.getSelected(null, (tab) => {
        var tablink = new URL(parseOriginURL(tab.url)).origin;
        chrome.storage.sync.get('customPreferences', (data) => {
            var customPreferences = data.customPreferences
            if (customPreferences) {
                var filteredPreference = customPreferences.filter(
                    (p) => p.domain == tablink
                )
                if (filteredPreference.length == 0) {
                    inExceptionList = false
                } else {
                    inExceptionList = true
                }
            } else {
                inExceptionList = false
            }
        })
    })
    return inExceptionList
}

function setupHeaderModListener() {

    let hasRequestHeadersModification = true;

    if (hasRequestHeadersModification) {
        chrome.webRequest.onBeforeSendHeaders.addListener(
            modifyRequestHeaderHandler,
            { urls: ["<all_urls>"] },
            ["blocking", "requestHeaders"]
        );
    }
    chrome.webRequest.onSendHeaders.addListener(details => {
        // console.log(details.requestHeaders);
    },
        { urls: ["<all_urls>"] },
        ['extraHeaders', 'requestHeaders']
    );
}

function isThirdPartyURL(url) {
    if (originURL == "undefined" || url == originURL) {
        return false;
    }
    else {
        return true;
    }
}

function getCurrentURL() {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        var activeTab = tabs[0];
        if (activeTab !== undefined && activeTab.url !== undefined && (/^https:./.test(activeTab.url) || /^http:./.test(activeTab.url))) {
            originURL = parseOriginURL(activeTab.url);
        }
    });
}

function modifyRequestHeaderHandler(details) {
    if (details.initiator !== undefined && details.initiator.startsWith("chrome-extension")) {
        return {};
    }

    getCurrentURL();
    var requestOrigin = parseOriginURL(details.url);
    var isThirdParty = isThirdPartyURL(requestOrigin);

    if (isThirdParty == true) {
        if (isInExceptionListHelper() == true || allowAllToSellFlag == true) {
            details.requestHeaders.push({ name: "ccpa1", value: "uu0" });
            // storeThirdPartyRequest(0).then(data => console.log(data)).catch();
            console.log("Third party, in list, or allow all to sell, should be uu0");
        } else {
            details.requestHeaders.push({ name: "ccpa1", value: "uu1" });
            // storeThirdPartyRequest(1).then().catch();
            console.log("Third party, NOT in list, NOT allow all, should be uu1");
        }

    } else {
        var ccpa;
        if (isInExceptionListHelper() == true) {
            ccpa = ccpa_r1 + ccpa_r2 + "0";
            // storeFirstPartyRequest(0, ccpa_r2, ccpa_r1).then().catch();

            console.log("First party, In list, should be rr0");

        } else {
            ccpa = ccpa_r1 + ccpa_r2 + "1";
            // storeFirstPartyRequest(1, ccpa_r2, ccpa_r1).then().catch();
            console.log("First party, NOT in list, should be rr1");
        }

        details.requestHeaders.push({ name: "ccpa1", value: ccpa });
    }
    return { requestHeaders: details.requestHeaders };
}


chrome.runtime.onInstalled.addListener(function (details) {
    if (details.reason == "install") {
        chrome.tabs.create({
            url: chrome.extension.getURL("skin/welcome.html")
        }, function (tab) {
            console.log("First installation welcome");
        });
    } else if (details.reason == "update") {
        var thisVersion = chrome.runtime.getManifest().version;
        console.log("Updated from " + details.previousVersion + " to " + thisVersion + "!");
    }
});