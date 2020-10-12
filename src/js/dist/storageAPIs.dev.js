"use strict";

// stores the users Date of Birth
// usage example :
// setUserDOB("5", "May", "2020")
// .then(
//     ...
// )
// .catch(error => console.error(error))
var setUserDOB = function setUserDOB(day, month, year) {
  var userDOB = {
    day: day,
    month: month,
    year: year
  };
  return new Promise(function (resolve, reject) {
    return chrome.storage.sync.set({
      userDOB: userDOB
    }, function () {
      return chrome.runtime.lastError ? reject(Error(chrome.runtime.lastError.message)) : resolve();
    });
  });
}; // retrieves the stored DOB of the user
// usage example:
// getUserDOB()
// .then( date => {
//     var day = date.day
//     var month = date.month
//     var year = date.year
//     ...
// })
// .catch(error => console.error(error))


var getUserDOB = function getUserDOB() {
  return new Promise(function (resolve, reject) {
    return chrome.storage.sync.get('userDOB', function (result) {
      chrome.runtime.lastError ? reject(Error(chrome.runtime.lastError.message)) : resolve(result);
    });
  });
}; // sets the custom (opposite to default) preference for the webpage opened
// usage example:
// setCustomPreference()
// .then(
//     ...
// )
// .catch(error => console.error(error))


var setCustomPreference = function setCustomPreference() {
  return new Promise(function (resolve, reject) {
    getDefaultPreference().then(function (defaultPreference) {
      var defaultPreference = defaultPreference["default"];
      var customPreference = 1;

      if (defaultPreference) {
        customPreference = 0;
      }

      chrome.tabs.getSelected(null, function (tab) {
        var tablink = tab.url.split('/')[2];
        chrome.storage.sync.get('customPreferences', function (data) {
          var customPreferences = data.customPreferences;
          var newPreference = {
            domain: tablink,
            preference: customPreference
          };

          if (customPreferences) {
            customPreferences.push(newPreference);
          } else {
            customPreferences = [newPreference];
          }

          chrome.storage.sync.set({
            customPreferences: customPreferences
          }, function () {
            return chrome.runtime.lastError ? reject(Error(chrome.runtime.lastError.message)) : resolve();
          });
        });
      });
    });
  });
}; // checks whether a custom preference (exception) exists for the current opened tab
// if an exception for the current page exists the promise resolves
// if no exception (custom preference) exists for the current page the promise enters the catch clause
// usage example:
// checkCustomPreference()
// .then(data => { // custom preference does exist for the current tab
//     var customPreferences = data.preference
//         ...
// })
// .catch(val => { // val can be ignored but it is neccessary to be given as argument.
//                 // custom preference does not exist for the current tab
// })


var checkCustomPreference = function checkCustomPreference() {
  return new Promise(function (resolve, reject) {
    chrome.tabs.getSelected(null, function (tab) {
      var tablink = tab.url.split('/')[2];
      chrome.storage.sync.get('customPreferences', function (data) {
        var customPreferences = data.customPreferences;

        if (customPreferences) {
          var filteredPreference = customPreferences.filter(function (p) {
            return p.domain == tablink;
          });

          if (filteredPreference.length == 0) {
            reject(0);
          } else {
            resolve(filteredPreference[0]);
          }
        } else {
          reject(0);
        }
      });
    });
  });
}; // the default preference can be set. for now we only have two options for preference
// either 1 or 0
// this function would also erase all previous exceptions set
// usage example:
// setDefaultPreference(1)
// .then(
//     ...
// )
// .catch(error => console.error(error))


function setDefaultPreference(preference) {
  var defaultPreference = {
    "default": preference
  };
  return new Promise(function (resolve, reject) {
    var customPreferences = [];
    chrome.storage.sync.set({
      customPreferences: customPreferences
    });
    chrome.storage.sync.set({
      defaultPreference: defaultPreference
    }, function () {
      return chrome.runtime.lastError ? reject(Error(chrome.runtime.lastError.message)) : resolve();
    });
  });
} // retrieves the stored default preference.
// usage example:
// getDefaultPreference()
// .then(data => {
//     var defaultPreference = data.default
//     ...
// })
// .catch(error => console.error(error))


var getDefaultPreference = function getDefaultPreference() {
  return new Promise(function (resolve, reject) {
    return chrome.storage.sync.get('defaultPreference', function (result) {
      return chrome.runtime.lastError ? reject(Error(chrome.runtime.lastError.message)) : resolve(result.defaultPreference);
    });
  });
};