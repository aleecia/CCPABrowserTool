'use strict';

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