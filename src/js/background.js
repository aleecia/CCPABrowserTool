'use strict';

var originURL;
var ccpa_r1 = "u";
var ccpa_r2 = "u";
var ccpa_r3 = "u";
var hasPreference = false;

var allowAllToSellFlag = false;
var inExceptionList = false;
var currentTabURL = "undefined";
var originURL = "undefined";
var exceptionList = new Set();

// exceptionList.add("https://www.google.com");

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
    if (request.allowAllToSellFlag) {
        allowAllToSellFlag = request.allowAllToSell;
    }
    console.log("receive message");
});

function parseOriginURL(url) {
    return url.match(/^[\w-]+:\/{2,}\[?[\w\.:-]+\]?(?::[0-9]*)?/)[0];
}

async function initialize() {
    setupHeaderModListener();
}

initialize();


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
        console.log(details.requestHeaders);
    },
        { urls: ["<all_urls>"] },
        ['extraHeaders', 'requestHeaders']
    );
}

function isThirdPartyURL(url) {
    if (url === originURL) {
        return false;
    } else {
        return true;
    }
}

function getCurrentURL() {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        var activeTab = tabs[0];
        if (activeTab.url !== undefined && /^https:./.test(activeTab.url)) {
            originURL = parseOriginURL(activeTab.url);
        }
    });
}

function isInExceptionList(url) {
    if (exceptionList.length === 0) {
        return false;
    } else if (exceptionList.has(url)) {
        return true;
    } else {
        return false;
    }
}

function modifyRequestHeaderHandler(details) {
    if(details.initiator !== undefined && details.initiator.startsWith("chrome-extension")) {
        return {};
    }
    
    getCurrentURL();
    var requestOrigin = parseOriginURL(details.url);
    var isThirdParty = isThirdPartyURL(requestOrigin);

    if (isThirdParty == true) {
        console.log("Third party");
        if (isInExceptionList(requestOrigin) == true || allowAllToSellFlag == true) {
            details.requestHeaders.push({ name: "ccpa", value: "uu0" });
        } else {
            details.requestHeaders.push({ name: "ccpa", value: "uu1" });
        }
    } else {
        var ccpa;
        console.log("First party !!!!");
        if (isInExceptionList(requestOrigin) == true) {
            if (hasPreference) {
                ccpa = ccpa_r1 + ccpa_r2 + ccpa_r3;
                if (ccpa_r3 === "1") {
                    exceptionList.delete(requestOrigin);
                }
            } else {
                ccpa = ccpa_r1 + ccpa_r2 + "0";
            }
        } else {
            if (hasPreference) {
                ccpa = ccpa_r1 + ccpa_r2 + ccpa_r3;
                if (ccpa_r3 === "0") {
                    exceptionList.add(requestOrigin);
                }
            } else { // "uuu"
                if (allowAllToSellFlag) {
                    ccpa = ccpa_r1 + ccpa_r2 + "0";
                    exceptionList.add(requestOrigin);
                } else {
                    ccpa = ccpa_r1 + ccpa_r2 + "1";
                    // console.log("Not in exception, not has preference, not allow all to sell");
                }
            }
        }
        details.requestHeaders.push({ name: "ccpa", value: ccpa });
        console.log(exceptionList);
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


// chrome.tabs.onActivated.addListener(tab => {
//     chrome.tabs.get(tab.tabId, current_tab_info => {
//         if(/^https:./.test(current_tab_info.url)) {
//             currentTabURL = current_tab_info.url;
//             originURL = parseOriginURL(currentTabURL);
//         }
//     });
// });