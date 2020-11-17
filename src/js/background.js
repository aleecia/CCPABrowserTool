var firstParty_get = "u";
var firstParty_delete = "u";
var thirdParty_get = "u";
var thirdParty_delete = "u";
var thirdParty_sell = "u";
var firstParty_sell = "u";

var blockDoNotSellRequest = false;
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
    getDefaultPreference("").then(comb => {
        var [data, hostname] = comb
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
        getAllowSaleCount().then(data => console.log("allow", data)).catch();
        getDoNotSaleCount().then(data => console.log("NOT", data)).catch();
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
    for (var i = 0; i < header.length; i++) {
        // console.log("response",details)
        if (header[i].name == "ccpa1") {
            // console.log("ccpa header received")
            if (details.url == 'http://www.ccpabrowsertool.com/') {
                chrome.tabs.create({
                    url: chrome.runtime.getURL('./skin/response.html'),
                    active: false
                }, function (tab) {
                    chrome.windows.create({
                        tabId: tab.id,
                        type: "panel",
                        focused: false,
                        width: 400
                    });
                }

                );
            }
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
            // console.log("ccpa rule, ", ccpa1);
        }).catch()

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
        if (requestTabId != currentTabID) {
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
        // for third party request, check whether user has stopped sending requests
        // checkStopSendingForThirdParty().then(setBlockThirdPartyFlag).catch();
        // for third party request, get user's default preference
        // then construct ccpa rule based on user's default or customized preference
        return getDefaultPreference(hostname)
                .then(setAllowAllToSell)
                .then(checkStopSendingForThirdParty)
                .then(setBlockThirdPartyFlag)
                .then(isInExceptionListHelper)
                .then(constructThirdPartyCCPARule)
                .then(addThirdPartyRecord).catch();
    } else {
        // for first party, construct ccpa rule based on user's customized preference
        return getDefaultPreference(originHostname)
               .then(setAllowAllToSell)
               .then(isInExceptionListHelper)
               .then(constructFirstPartyCCPARule)
               .then(addFirstPartyRecord).catch();
        // isInExceptionListHelper(originHostname).then(constructFirstPartyCCPARule).then(addFirstPartyRecord).catch();
    }
}


function setBlockThirdPartyFlag(data) {
    return new Promise((resolve) => {
        var [flag, hostname] = data;
        blockDoNotSellRequest = flag;
        resolve(hostname);
    }).catch()
}


function addFirstPartyRecord(data) {
    return new Promise((resolve) => {
        var [ccpa, hostname] = data;
        if(firstParty_delete == "1" || firstParty_delete == "0" || firstParty_get == "1" || firstParty_get == "0") {
            addRecord(hostname, 0, firstParty_delete, firstParty_get);
            if(firstParty_sell == "1") {
                incrementDoNotSaleCount().then().catch();
            } else if(firstParty_sell == "0") {
                incrementAllowSaleCount().then().catch();
            }
        } else {
            if(firstParty_sell == "1") {
                incrementDoNotSaleCount().then().catch();
            } else if(firstParty_sell == "0") {
                incrementAllowSaleCount().then().catch();
            }
        }
        resolve(ccpa);
    }).catch()
}

function addThirdPartyRecord(data) {
    return new Promise((resolve) => {
        var [ccpa, hostname] = data;
        if(thirdParty_delete == "1" || thirdParty_delete == "0" || thirdParty_get == "1" || thirdParty_get == "0") {
            addRecord(hostname, 1, thirdParty_delete, thirdParty_get);
            if(thirdParty_sell == "1") {
                incrementDoNotSaleCount().then().catch();
            } else if(thirdParty_sell == "0") {
                incrementAllowSaleCount().then().catch();
            }
        } else {
            if(thirdParty_sell == "1") {
                incrementDoNotSaleCount().then().catch();
            } else if(thirdParty_sell == "0") {
                incrementAllowSaleCount().then().catch();
            }
        }
        resolve(ccpa);
    }).catch()
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
    return new Promise((resolve, reject) => {
        var ccpa;
        var [isInExceptionList, hostname] = data;
        if (blockDoNotSellRequest) {
            thirdParty_sell = "u";
            ccpa = thirdParty_get + thirdParty_delete + thirdParty_sell;
            // console.log("3rd rru");
        } else {
            if (!(isInExceptionList ^ flag)) {
                thirdParty_sell = "0";
                ccpa = thirdParty_get + thirdParty_delete + thirdParty_sell;
                // console.log("3rd rr0");
            } else {
                thirdParty_sell = "1";
                ccpa = thirdParty_get + thirdParty_delete + thirdParty_sell;
                // console.log("3rd rr1");
            }
        }
        return resolve([ccpa, hostname]);
    }).catch()
}

/**
 * Construct first party's ccpa rule based on customized preference
 * 1. if the request's hostname is in the ExceptionList, ccpa rule would be set as "r1 r2 0", 
 *    Otherwise, ccpa rule would be set as "r1 r2 1".
 *    Value of r1 r2 based on user's preference from front-end.
 * 2. store every request into storage for analysis purpose.
 * @param isInExceptionList true stands for allowing to sell data; false stands for not allowing.
 */
function constructFirstPartyCCPARule(data) {
    return new Promise((resolve, reject) => {
        var [isInExceptionList, hostname] = data;
        var ccpa;
        if (!(isInExceptionList ^ flag)) {
            firstParty_sell = "0";
            ccpa = firstParty_get + firstParty_delete + firstParty_sell;
            // console.log("1st rr0");
        } else {
            firstParty_sell = "1";
            ccpa = firstParty_get + firstParty_delete + firstParty_sell;
            // console.log("1st rr1");
        }
        return resolve([ccpa, hostname]);
    }).catch()
}



/**
 * Set user's default preference of selling information.
 * @param defaultPreference 0 => allow selling my data; 1 => do not sell my data.
 */
function setAllowAllToSell(data) {
    return new Promise((resolve, reject) => {
        var [defaultPreference, hostname] = data;
        if (!defaultPreference) {
            reject(hostname);
        }
        if (defaultPreference.default == 0) {
            flag = 0
        } else {
            flag = 1;
        }
        resolve(hostname);
    }).catch()
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
            return resolve([inExceptionList, hostname]);
        })
    }).catch()
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
        chrome.tabs.executeScript(tab.id, {
            code: code
          }, _=>{
            let e = chrome.runtime.lastError;
            if(e !== undefined){}
          });
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
            getMessage: true
        })
    }
    if (request.firstParty_delete) {
        firstParty_get = "u";
        firstParty_delete = "1";
        thirdParty_get = "u";
        thirdParty_delete = "u";
        chrome.runtime.sendMessage({
            getMessage: true
        })
    }
    if (request.thirdParty_get) {
        firstParty_get = "u";
        firstParty_delete = "u";
        thirdParty_get = "1";
        thirdParty_delete = "u";
        chrome.runtime.sendMessage({
            getMessage: true
        })
    }
    if (request.thirdParty_delete) {
        firstParty_get = "u";
        firstParty_delete = "u";
        thirdParty_get = "u";
        thirdParty_delete = "1";
        chrome.runtime.sendMessage({
            getMessage: true
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

function getDefaultPreference(hostname) {
    return new Promise((resolve, reject) =>
        chrome.storage.local.get('defaultPreference', (result) =>
            chrome.runtime.lastError ?
                reject(Error(chrome.runtime.lastError.message)) :
                resolve([result.defaultPreference, hostname])
        )
    ).catch()
}

function checkStopSendingForThirdParty(hostname) {
	return new Promise((resolve, reject) => {
		chrome.tabs.getSelected(null, (tab) => {
			var tablink = tab.url.split('/')[2]
			chrome.storage.local.get('stopSendingForThirdParty', (data) => {
				var stopSendingForThirdParty = data.stopSendingForThirdParty
				if (stopSendingForThirdParty) {
					var filteredPreference = stopSendingForThirdParty.filter(
						(p) => p.domain == tablink
					)
					if (filteredPreference.length == 0) {
						resolve([false, hostname])
					} else {
						resolve([true,hostname])
					}
				} else {
					resolve([false, hostname])
				}
			})
		})
	}).catch()
}

function addRecord(url, thirdParty, y, z) {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get('history', data => {
            if (chrome.runtime.lastError) {
                reject(Error(chrome.runtime.lastError.message))
            } else {
                var history = data.history
                var now = new Date()
                var newRequest = {
                    "domain": url,
                    "r1": z,
                    "r2": y,
                    "thirdParty": thirdParty,
                    "date": {
                        "day": now.getDate(),
                        "month": now.getMonth() + 1,
                        "year": now.getFullYear(),
                        "time": {
                            "seconds": now.getSeconds(),
                            "minutes": now.getMinutes(),
                            "hour": now.getHours()
                        }
                    }
                }
                if (history) {
                    history.push(newRequest)
                } else {
                    history = [newRequest]
                }
                chrome.storage.local.set({ history }, () =>
                    chrome.runtime.lastError ?
                        reject(Error(chrome.runtime.lastError.message)) :
                        resolve()
                )
            }
        })
    }).catch()
}

incrementDoNotSaleCount = () => {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get('DoNotSaleCount', data => {
            if (chrome.runtime.lastError) {
                reject(Error(chrome.runtime.lastError.message))
            } else {
                var DoNotSaleCount = data.DoNotSaleCount;
                if (DoNotSaleCount) {
                    DoNotSaleCount.count = DoNotSaleCount.count + 1
                } else {
                    DoNotSaleCount = {
                        'count': 1
                    }
                }
                chrome.storage.local.set({ DoNotSaleCount }, () =>
                    chrome.runtime.lastError ?
                        reject(Error(chrome.runtime.lastError.message)) :
                        resolve()
                )
            }
        })
    }).catch()
}

const incrementAllowSaleCount = () => {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get('AllowSaleCount', data => {
            if (chrome.runtime.lastError) {
                reject(Error(chrome.runtime.lastError.message))
            } else {
                var AllowSaleCount = data.AllowSaleCount;
                if (AllowSaleCount) {
                    AllowSaleCount.count = AllowSaleCount.count + 1
                } else {
                    AllowSaleCount = {
                        'count': 1
                    }
                }
                chrome.storage.local.set({ AllowSaleCount }, () =>
                    chrome.runtime.lastError ?
                        reject(Error(chrome.runtime.lastError.message)) :
                        resolve()
                )
            }
        })
    }).catch()
}

const getAllowSaleCount = () => {
	return new Promise((resolve, reject) => {
		chrome.storage.local.get('AllowSaleCount', data => {
			if (chrome.runtime.lastError) {
				reject(Error(chrome.runtime.lastError.message))
			} else {
				var AllowSaleCount = data.AllowSaleCount
				if (AllowSaleCount) {
					resolve(AllowSaleCount.count)
				} else {
					resolve(0)
				}
			}
		})
	})
}

const getDoNotSaleCount = () => {
	return new Promise((resolve, reject) => {
		chrome.storage.local.get('DoNotSaleCount', data => {
			if (chrome.runtime.lastError) {
				reject(Error(chrome.runtime.lastError.message))
			} else {
				var DoNotSaleCount = data.DoNotSaleCount
				if (DoNotSaleCount) {
					resolve(DoNotSaleCount.count)
				} else {
					resolve(0)
				}
			}
		})
	})
}