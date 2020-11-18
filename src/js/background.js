var firstParty_get = "u";
var firstParty_delete = "u";
var thirdParty_get = "u";
var thirdParty_delete = "u";

var currentTabID = "undefined";

var flag = false;
var ccpa1 = "undefined";
var originHostname = "undefined";


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
                flag = 0;
                ccpa1 = "uu0";
            } else {
                flag = 1;
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
            // console.log("send request");
            // console.log(details);
        },
        { urls: ["<all_urls>"] },
        ['extraHeaders', 'requestHeaders']
    );

    chrome.webRequest.onHeadersReceived.addListener(
        checkReponseHeader,
        { urls: ["<all_urls>"] },
        ["responseHeaders"]
    );
}



/***************************************************************************************************
 *                                  Modify HTTP Request Hander                                     *       
 ***************************************************************************************************
 */

function checkReponseHeader(details) {
    var header = details.responseHeaders
    for(var i=0;i<header.length;i++){
        if(header[i].name == "ccpa1"){
            chrome.tabs.getSelected(tab=>{
                console.log("response ccpa:"+header[i].value)
                console.log(details.url+tab.url)
                if (details.url==tab.url){
                chrome.tabs.create({
                    url: chrome.runtime.getURL('./skin/response.html'),
                    active: false
                }, function(tab) {
                chrome.windows.create({
                    tabId: tab.id,
                    type: "panel",
                    focused: false
                });
                }
                );
                }
            })
            break
        }
    }
}
/**
 * Monitor and Modify every http request send to both third party and first party
 * @param details http request details
 * For each request:
 * 1. check whether it belongs to the current tab
 * if it belongs, call handleRequest()
 * if it doesn't, call discardRequest()
 * 2. add different ccpa rule to request header
 * 3. return the modified HTTP request header
 */
function modifyRequestHeaderHandler(details) {
    if (details.initiator !== undefined && details.initiator.startsWith("chrome-extension")) {
        return {};
    }
    isCurrentTabRequest(details)
    .then(handleRequest, discardRequest)
    .then(ccpaRule => {
        ccpa1 = ccpaRule;
        console.log("ccpa rule, ", ccpa1);
    })
    details.requestHeaders.push({ name: "ccpa1", value: ccpa1 });
    return { requestHeaders: details.requestHeaders };
}

/**
 * For each request that belongs to the current tab:
 * 1. check whether it belongs to third party
 * 2. construct corresponding ccpa rule
 * 3. return a promise that contains the ccpa we just constructed
 * @param {*} requestURL request url that belongs to the current tab
 */
function handleRequest(requestURL) {
    return isThirdPartyURL(requestURL).then(getCCPARule).catch();
}

/**
 * For each request that doesn't belong to the current tab:
 * simply set ccpa rule to "uuu", meaning we won't handle it
 * return a promise that contains the ccpa we just constructed
 */
function discardRequest() {
    return new Promise((resolve) => {
        console.log("DISCARD step 2");
        resolve("uuu");
    })
}

/**
 * Check whether the request belongs to the current tab 
 * @param {*} request request we monitored
 */
function isCurrentTabRequest(request) {
    return new Promise((resolve, reject) => {
        var requestTabId = request.tabId;
        if(requestTabId != currentTabID) {
            console.log("DISCARD step 1");
            console.log("request tabID is: ", request.tabId);
            console.log("current tabid is: ", currentTabID);
            reject();
        } else {
            resolve(request.url);
        }
    })
}

/**
 * Return the hostname of current request url
 * @param {} requestURL current request url
 * 1. tab.url stands for the origin url that user wants to visit
 * 2. requestHostname: origin hostname
 * 3. requestHostname: hostname of each http request url
 * return the correponding hostname
 */
function isThirdPartyURL(requestURL) {
    return new Promise((resolve, reject) => {
        if (/^https:./.test(requestURL) || /^http:./.test(requestURL)) {
            var requestHostname = new URL(requestURL).hostname;
            chrome.tabs.getSelected(null, (tab) => {
                if (/^https:./.test(tab.url) || /^http:./.test(tab.url)) {
                    originHostname = new URL(tab.url).hostname;
                    // if hostname of each http request url 
                    // equals to the origin url that user wants to visit
                    if (requestHostname == originHostname) {
                        return resolve(originHostname);
                    } else {
                        return resolve(requestHostname);
                    }
                }
            })
        } else {
            reject("Invalid request url");
        }
    }).catch(error => {
        console.log(error);
    })
}



/**
 * Get corresponding CCPA rule in different scenarios.
 * @param {*} hostname hostname or domain of request url.
 */
function getCCPARule(hostname) {
    if (hostname != originHostname) {
        // for third party request, get user's default preference first
        getDefaultPreference().then(setAllowAllToSell);
        // then construct ccpa rule based on user's default or customized preference
        return isInExceptionListHelper(hostname).then(constructThirdPartyCCPARule).catch(error => console.log("itself 2"));
    } else {
        // for first party, construct ccpa rule based on user's customized preference
        return isInExceptionListHelper(originHostname).then(constructFirstPartyCCPARule).catch(error => console.log("itself 2"));
    }
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
function constructThirdPartyCCPARule(data) {
    return new Promise((resolve,reject) => {
        var ccpa;
        var [isInExceptionList] = data;
        if(!(isInExceptionList ^ flag)) {
            ccpa = thirdParty_get + thirdParty_delete + "0";
            console.log("3rd rr0");
        } else {
            ccpa = thirdParty_get + thirdParty_delete + "1";
            console.log("3rd rr1");
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
        if(!(isInExceptionList ^ flag)) {
            ccpa = firstParty_get + firstParty_delete + "0";
            console.log("1st rr0");
        } else {
            ccpa = firstParty_get + firstParty_delete + "1";
            console.log("1st rr1");
        }
        return resolve(ccpa);
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
        flag = 0
    } else {
        flag = 1;
    }
    return flag;
}

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
            return resolve([inExceptionList,hostname]);
        })
    })
}


/****************************************************************************************************
 *                                      General Methods                                             *       
 ****************************************************************************************************
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

/***************************************************************************************************
 *                                     Message Handler                                             *       
 ***************************************************************************************************
 */

chrome.runtime.onMessage.addListener((request) => {
    if (request.firstParty_get) {
        firstParty_get = "1";
        firstParty_delete = "u";
        thirdParty_get = "u";
        thirdParty_delete = "u";
        chrome.runtime.sendMessage({
            getMessage : true
        })
    }
    if (request.firstParty_delete) {
        firstParty_get = "u";
        firstParty_delete = "1";
        thirdParty_get = "u";
        thirdParty_delete = "u";
        chrome.runtime.sendMessage({
            getMessage : true
        })
    }
    if (request.thirdParty_get) {
        firstParty_get = "u";
        firstParty_delete = "u";
        thirdParty_get = "1";
        thirdParty_delete = "u";
        chrome.runtime.sendMessage({
            getMessage : true
        })
    }
    if (request.thirdParty_delete) {
        firstParty_get = "u";
        firstParty_delete = "u";
        thirdParty_get = "u";
        thirdParty_delete = "1";
        chrome.runtime.sendMessage({
            getMessage : true
        })
    }
    if (request.refresh) {
        refreshPage();
    }
});

/**
 * Monitor the switch between tabs
 */
chrome.tabs.onActiveChanged.addListener(function () {
    console.log("TAB CHANGED!!!!!!!!");
    chrome.tabs.query({ active: true, currentWindow: true }, function (tab) {
        currentTabID = tab[0].id;
    });
});


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