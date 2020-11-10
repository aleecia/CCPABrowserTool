'use strict';

/**
 * CCPA rule1 : request my data
 */
var ccpa_r1 = "u";
/**
 * CCPA rule1 : delete my data
 */
var ccpa_r2 = "u";
/**
 * CCPA rule3 : do not sell my data
 */
var ccpa_r3 = "u";
/**
 * "ccpa1": "xyz"
 */
var ccpa1 = "undefined";
/**
 * Get user's default preference
 * 1 => do not sell my data; 0 => allow selling my data.
 */
var allowAllToSellFlag = false;

/**
 * Hostname of current website that user are visiting
 */
var originHostName = "undefined";



/**************************************************************************************************
*                                   First Time Installation                                       *
* *************************************************************************************************
*/

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



/**************************************************************************************************
 *                                          Initialization                                        *       
 **************************************************************************************************
 */
function initialize() {
    setupHeaderModListener();
    setInitialCCPARule();
}


initialize();


/**
 * Set the default ccpa rule based on user's default preference, 
 */
function setInitialCCPARule() {
    getDefaultPreference().then(data => {
        if (!data) {
            return;
        } else {
            var defaultPreference = data.default;
            // if user allows to sell, allowAllToSellFlag should be set as true
            if (defaultPreference == 0) {
                allowAllToSellFlag = true;
                ccpa1 = "uu0";
            } else {
                allowAllToSellFlag = false;
                ccpa1 = "uu1";
            }
        }
    });
}

/**
 * Webrequest lifecycle.
 */
function setupHeaderModListener() {

    chrome.webRequest.onBeforeSendHeaders.addListener(
        modifyRequestHeaderHandler,
        { urls: ["<all_urls>"] },
        ["blocking", "requestHeaders"]
    );

    chrome.webRequest.onSendHeaders.addListener(details => {
        console.log(details.requestHeaders);
    },
        { urls: ["<all_urls>"] },
        ['extraHeaders', 'requestHeaders']
    );
}


/***************************************************************************************************
 *                                     Message Handler                                             *       
 ***************************************************************************************************
 */

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
    if (request.refresh) {
        refreshPage();
    }
});


/***************************************************************************************************
 *                                  Modify HTTP Request Hander                                     *       
 ***************************************************************************************************
 */

/**
 * Monitor and Modify every http request send to both third party and first party
 * @param details http request details
 * For each request:
 * 1. check whether it belongs to third party
 * 2. send request accordingly
 * 3. add ccpa rule to request header
 * 4. return the modified HTTP request header
 */
function modifyRequestHeaderHandler(details) {
    if (details.initiator !== undefined && details.initiator.startsWith("chrome-extension")) {
        return {};
    }
    isThirdPartyURL(details.url)
        .then(getCCPARule)
        .then(ccpaRule => {
            ccpa1 = ccpaRule;
        });
    details.requestHeaders.push({ name: "ccpa1", value: ccpa1 });
    return { requestHeaders: details.requestHeaders };
}

/**
 * Return the hostname of current request url
 * @param {} requestURL current request url
 * 1. tab.url stands for the origin url that user wants to visit
 * 2. originHostName: origin hostname
 * 3. requestHostName: hostname of each http request url
 * return the correponding hostname
 */
function isThirdPartyURL(requestURL) {
    return new Promise((resolve, reject) => {
        var requestHostName = new URL(parseOriginURL(requestURL)).hostname;
        chrome.tabs.getSelected(null, (tab) => {
            if (/^https:./.test(tab.url) || /^http:./.test(tab.url)) {
                originHostName = new URL(parseOriginURL(tab.url)).hostname;
                // if hostname of each http request url 
                // equals to the origin url that user wants to visit
                if (requestHostName == originHostName) {
                    return resolve(originHostName);
                } else {
                    return resolve(requestHostName);
                }
            }
        })
    })
}


/**
 * Get corresponding CCPA rule in different scenarios.
 * @param {*} hostname hostname or domain of request url.
 */
function getCCPARule(hostname) {
    if (hostname != originHostName) {
        // for third party request, get user's default preference first
        getDefaultPreference().then(setAllowAllToSell);
        // store third party's request url to storage
        addToThirdPartyList(hostname).then().catch();
        // then construct ccpa rule based on user's default or customized preference
        return isInExceptionListHelper(hostname).then(constructThirdPartyCCPARule);
    } else {
        // for first party, construct ccpa rule based on user's customized preference
        return isInExceptionListHelper(originHostName).then(constructFirstPartyCCPARule);
    }
}

/**
 * Store all third party's hostname to storage
 * @param  hostname current third party's hostname
 */
function addToThirdPartyList(hostname) {
    return new Promise((resolve, reject) => {
		chrome.storage.local.get("thirdPartyList", data => {
            var thirdPartyList = data.thirdPartyList
            if(thirdPartyList) {
                thirdPartyList = thirdPartyList.filter(p => p !== hostname)
                thirdPartyList.push(hostname)
            } else {
                thirdPartyList = [hostname]
            }
            chrome.storage.local.set({ thirdPartyList }, () => 
                chrome.runtime.lastError ?
                reject(Error(chrome.runtime.lastError.message)) :
                resolve()
            )
        })
	})
}


function getThirdPartyList() {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get("thirdPartyList", data => {
            resolve(data);
        })
    })
}

/**
 * Check whether user has customized preference for current hostname
 * @param hostname current hostname, could be requestHostName or originHostName
 */
function isInExceptionListHelper(hostname) {
    return new Promise(resolve => {
        var inExceptionList;
        chrome.storage.local.get('customPreferences', (data) => {
            var customPreferences = data.customPreferences
            if (customPreferences) {
                var filteredPreference = customPreferences.filter(
                    (p) => p.domain == hostname
                )
                // the hostname does not in the user's exception list
                // which means user does not have customized preference for it.
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

/**
 * Set user's default preference of selling information.
 * @param defaultPreference 0 => allow selling my data; 1 => do not sell my data.
 */
function setAllowAllToSell(defaultPreference) {
    if (!defaultPreference) {
        return;
    }
    if (defaultPreference.default == 0) {
        allowAllToSellFlag = true;
    } else {
        allowAllToSellFlag = false;
    }
    return allowAllToSellFlag;
}

/**
 * Construct third party's ccpa rule
 * 1. if the request's hostname is in the ExceptionList or user allows to sell by default,
 *    ccpa rule would be set as "uu0", meaning user allows to sell information, but does not set 
 *    any preference for requesting or deleting information.
 *    Otherwise, ccpa rule would be set as "uu1".
 * 2. store every request into storage for analysis purpose.
 * @param isInExceptionList true stands for allowing to sell data; false stands for not allowing.
 */
function constructThirdPartyCCPARule(isInExceptionList) {
    return new Promise(resolve => {
        var ccpa;
        if (isInExceptionList || allowAllToSellFlag == true) {
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

/**
 * Construct first party's ccpa rule based on customized preference
 * 1. if the request's hostname is in the ExceptionList, ccpa rule would be set as "r1 r2 0", 
 *    Otherwise, ccpa rule would be set as "r1 r2 1".
 *    Value of r1 r2 based on user's preference from front-end.
 * 2. store every request into storage for analysis purpose.
 * @param isInExceptionList true stands for allowing to sell data; false stands for not allowing.
 */
function constructFirstPartyCCPARule(isInExceptionList) {
    return new Promise(resolve => {
        var ccpa;
        if (isInExceptionList) {
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


/****************************************************************************************************
 *                                      General Methods                                             *       
 ****************************************************************************************************
 */

/**
 * Return the url that matches specific pattern.
 * Otherwise, return null.
 * @param url given url
 */
function parseOriginURL(url) {
    var result = url.match(/^[\w-]+:\/{2,}\[?[\w\.:-]+\]?(?::[0-9]*)?/);
    if (result) {
        return result[0];
    }
    return null;
}

/**
 * Refresh the page Automaticlly after user clicks "send request" button.
 * The purpose is to add ccpa rule during the new lifecycle.
 * The life cycle determines that the tool can only modify the request 
 * that has not been sent, but not the request that has been sent successfully.
 */
function refreshPage() {
    chrome.tabs.getSelected(null, function (tab) {
        if (tab == null || tab.id == null || tab.id < 0) {
            return;
        }
        var code = 'window.location.reload();';
        chrome.tabs.executeScript(tab.id, { code: code });
    });
}



/****************************************************************************************************
 *                                        copy from storageAPIs.js                                  *
 ****************************************************************************************************
 */

function getDefaultPreference() {
    return new Promise((resolve, reject) =>
        chrome.storage.local.get('defaultPreference', (result) =>
            chrome.runtime.lastError ?
                reject(Error(chrome.runtime.lastError.message)) :
                resolve(result.defaultPreference)
        )
    )
}

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
