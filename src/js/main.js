document.getElementById("sendrequest").addEventListener("click",function(){
    // get my data
    var r1 = "u";
    // delete my data
    var r2 = "u";
    // do not sell my data
    var r3 = "u";
    var allowAllToSell = false;
    // var hasNewPreference = false;
    
    if ($("#get").get(0).checked) {
        r1 = "1";
    }
    if ($("#delete").get(0).checked) {
        r2 = "1";
    }
    chrome.storage.sync.get(['do-not-sell-data'], function(result) {
        if(result.key === undefined) {
            allowAllToSell = false;
            r3 = "u";
        } else if(result.key === "1") {
            allowAllToSell = false;
            r3 = "1";
        } else {
            allowAllToSell = true;
            r3 = "0";
            hasNewPreference = true;
        }
    });
    chrome.runtime.sendMessage({r1: r1});
    chrome.runtime.sendMessage({r2: r2});
    chrome.runtime.sendMessage({r3: r3});
    // chrome.runtime.sendMessage({ccpa: r1+r2+r3});
    // chrome.runtime.sendMessage({newPreference: hasNewPreference});
    chrome.runtime.sendMessage({allowAllToSellFlag: allowAllToSell});
});