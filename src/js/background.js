'use strict';

var ccpa_r1 = "u";
var ccpa_r2 = "u";
var ccpa_r3 = "u";
var ccpa1 = "undefined";
var allowAllToSellFlag = false;
var originHostName = "undefined";

chrome.runtime.onMessage.addListener((request) => {
    if (request.r1) {
        ccpa_r1 = request.r1;
    }
    if (request.r2) {
        ccpa_r2 = request.r2;
    }
    if (request.r3) {
        ccpa_r3 = request.r3;
    }
    if(request.refresh) {
        refreshPage();
    }
});

function parseOriginURL(url) {
    if(url != null) {
        return url.match(/^[\w-]+:\/{2,}\[?[\w\.:-]+\]?(?::[0-9]*)?/)[0];
    }
    return null;
}


function setInitialCCPARule() {
    getDefaultPreference().then( data => {
        console.log(data);
        if(!data) {
            return;
        } else {
            var defaultPreference = data.default;
            if(defaultPreference == 0) {
                allowAllToSellFlag = true;  
                ccpa1 = "uu0";
            } else {
                allowAllToSellFlag = false;
                ccpa1 = "uu1";
            }
        }
    });
}

async function initialize() {
    setupHeaderModListener();
    setInitialCCPARule();   
}

initialize();

function storeFirstPartyRequest(r3, r2, r1) {
    return new Promise((resolve, reject) => {
        chrome.tabs.getSelected(null, (tab) => {
            var tablink = new URL(parseOriginURL(tab.url)).hostname;
            chrome.storage.local.get('firstPartyRequests', data => {
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
                    chrome.storage.local.set({ firstPartyRequests }, () =>
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
                chrome.storage.local.get('thirdPartyRequests', data => {
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
                    chrome.storage.local.set({
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



function isThirdPartyURL(requestURL) {
    return new Promise((resolve, reject) => {
        var requestHostName = new URL(parseOriginURL(requestURL)).hostname;
        chrome.tabs.getSelected(null, (tab) => {
            if(/^https:./.test(tab.url) || /^http:./.test(tab.url)) {
                originHostName = new URL(parseOriginURL(tab.url)).hostname;
                if(requestHostName == originHostName) {
                    return resolve(originHostName);
                } else {
                    return resolve(requestHostName);
                }
            }
        })
    })
    
}

function getDefaultPreference() {
	return new Promise((resolve, reject) =>
		chrome.storage.local.get('defaultPreference', (result) =>
			chrome.runtime.lastError ?
			reject(Error(chrome.runtime.lastError.message)) :
			resolve(result.defaultPreference)
		)
	)
}

function setAllowAllToSell(defaultPreference) {
    if(!defaultPreference) {
        return;
    }
    if(defaultPreference.default == 0) {
        allowAllToSellFlag = true;
    } else {
        allowAllToSellFlag = false;
    }
}

function sendRequestToThirdParty(isInExceptionList) {
    return new Promise(resolve => {
        var ccpa;
        if(isInExceptionList || allowAllToSellFlag == true) {
            ccpa = "uu0";
            console.log("Third party, in list, or allow all to sell, should be uu0");
            storeThirdPartyRequest(0).then().catch();
        } else {
            ccpa = "uu1";
            console.log("Third party, NOT in list, NOT allow all, should be uu1");
            storeThirdPartyRequest(1).then().catch();
        }
        return resolve(ccpa);
    })
    
}

function sendRequestToFirstParty(isInExceptionList) {
    return new Promise(resolve => {
        var ccpa;
        if(isInExceptionList) {
            ccpa = ccpa_r1 + ccpa_r2 + "0";
            console.log("First party, in list, should be rr0");
            storeFirstPartyRequest(0, ccpa_r2, ccpa_r1).then().catch();
        } else {
            ccpa = ccpa_r1 + ccpa_r2 + "1";
            storeFirstPartyRequest(1, ccpa_r2, ccpa_r1).then().catch();
            console.log("First party, NOT in list, should be rr1");
        }
        return resolve(ccpa);
    })
    
}

function refreshPage() {
    chrome.tabs.getSelected(null, function(tab) {
        if(tab == null || tab.id == null || tab.id < 0) {
            return;
        }
        var code = 'window.location.reload();';
        chrome.tabs.executeScript(tab.id, {code: code});
    });
}

function sendRequest(hostname) {
    if(hostname != originHostName) {
        getDefaultPreference().then(setAllowAllToSell);
        return isInExceptionListHelper(hostname).then(sendRequestToThirdParty);
    } else {
        return isInExceptionListHelper(originHostName).then(sendRequestToFirstParty);
    }
}

function isInExceptionListHelper(tablink) {
    return new Promise(resolve => {
        var inExceptionList;
        chrome.storage.local.get('customPreferences', (data) => {
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
            return resolve(inExceptionList);
        })
    })
}


function modifyRequestHeaderHandler(details) {
    if (details.initiator !== undefined && details.initiator.startsWith("chrome-extension")) {
        return {};
    }
    isThirdPartyURL(details.url)
    .then(sendRequest)
    .then(ccpa => {
        ccpa1 = ccpa;
    });
    details.requestHeaders.push({ name: "ccpa1", value: ccpa1 });
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