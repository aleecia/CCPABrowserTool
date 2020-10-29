"use strict";

// stores the users Date of Birth
// usage example :
// setUserDOB("5", "May", "2020")
// .then(
//     ...
// )
// .catch(error => console.error(error))
var setUserDOB = function setUserDOB(userDOB) {
  var userDOB = {
    userDOB: userDOB
  };
  return new Promise(function (resolve, reject) {
    return chrome.storage.sync.set(userDOB, function () {
      return chrome.runtime.lastError ? reject(Error(chrome.runtime.lastError.message)) : resolve();
    });
  });
}; // retrieves the stored DOB of the user
// usage example:
// getUserDOB()
// .then( result => {
//     var birthday = result.userDOB
//     ...
// })
// .catch(error => console.error(error))


var getUserDOB = function getUserDOB() {
  return new Promise(function (resolve, reject) {
    return chrome.storage.sync.get('userDOB', function (result) {
      chrome.runtime.lastError ? reject(Error(chrome.runtime.lastError.message)) : resolve(result);
    });
  });
}; // stores the users password set for parent mode
// usage example :
// setParentPassword("12345")
// .then(
//     ...
// )
// .catch(error => console.error(error))


var setParentPassword = function setParentPassword(parentPassword) {
  var parentPassword = {
    parentPassword: parentPassword
  };
  return new Promise(function (resolve, reject) {
    return chrome.storage.sync.set(parentPassword, function () {
      return chrome.runtime.lastError ? reject(Error(chrome.runtime.lastError.message)) : resolve();
    });
  });
}; // retrieves the stored parent password of the user
// usage example:
// getParentPassword()
// .then( result => {
//     var pw = result.parentPassword
// })
// .catch(error => console.error(error))


var getParentPassword = function getParentPassword() {
  return new Promise(function (resolve, reject) {
    return chrome.storage.sync.get('parentPassword', function (result) {
      chrome.runtime.lastError ? reject(Error(chrome.runtime.lastError.message)) : resolve(result);
    });
  });
}; // stores the current status about whether user is in parent mode
// usage example :
// setIsParentMode(true)
// .then(
//     ...
// )
// .catch(error => console.error(error))


var setIsParentMode = function setIsParentMode(isParentMode) {
  var isParentMode = {
    isParentMode: isParentMode
  };
  return new Promise(function (resolve, reject) {
    return chrome.storage.sync.set({
      isParentMode: isParentMode
    }, function () {
      return chrome.runtime.lastError ? reject(Error(chrome.runtime.lastError.message)) : resolve();
    });
  });
}; // retrieves if the user is in parent mode
// usage example:
// getIsParentMode()
// .then( result => {
//     var isParentMode = result.isParentMode
//     ...
// })
// .catch(error => console.error(error))


var getIsParentMode = function getIsParentMode() {
  return new Promise(function (resolve, reject) {
    return chrome.storage.sync.get('isParentMode', function (result) {
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
      console.log('thisdefault', defaultPreference);
      var customPreference = 1;
      chrome.tabs.getSelected(null, function (tab) {
        var tablink = tab.url.split('/')[2];
        chrome.storage.sync.get('customPreferences', function (data) {
          var customPreferences = data.customPreferences;
          var newPreference = {
            "domain": tablink,
            "preference": customPreference
          };

          if (customPreferences) {
            customPreferences = customPreferences.filter(function (p) {
              return p.domain !== tablink;
            });
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
// if an exception for the current page exists the promise resolves with the value 1 
// otherwise it resolves with a value of 0
// usage example:
// checkCustomPreference()
// .then(data => { // data would be a boolean val indicating whether or not the customPreference exists
//      ...
// })
// 


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
            resolve(0);
          } else {
            resolve(1);
          }
        } else {
          resolve(0);
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


var setDefaultPreference = function setDefaultPreference(preference) {
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
}; // retrieves the stored default preference.
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
}; // deletes the current opened tab from the exceptions list
// if the current tab's url is not in the exception list it would do nothing
// usage example:
//       deleteCustomPreference()
//       .then(() => {
//         ... next steps here
//       })
//       .catch(error => console.error(error))


var deleteCustomPreference = function deleteCustomPreference() {
  return new Promise(function (resolve, reject) {
    chrome.tabs.getSelected(null, function (tab) {
      var tablink = tab.url.split('/')[2];
      chrome.storage.sync.get('customPreferences', function (data) {
        var customPreferences = data.customPreferences;

        if (customPreferences) {
          customPreferences = customPreferences.filter(function (p) {
            return p.domain !== tablink;
          });
        } else {
          customPreferences = [];
        }

        chrome.storage.sync.set({
          customPreferences: customPreferences
        }, function () {
          return chrome.runtime.lastError ? reject(Error(chrome.runtime.lastError.message)) : resolve();
        });
      });
    });
  });
}; // retreives the list of strings (urls) that are included in the exceptions list
// usage example:
//       getExceptionsList()
//       .then(data => {
//         .... next steps here
//       })
//       .catch(error => console.error(error))


var getExceptionsList = function getExceptionsList() {
  return new Promise(function (resolve, reject) {
    chrome.storage.sync.get('customPreferences', function (data) {
      if (chrome.runtime.lastError) {
        reject(Error(chrome.runtime.lastError.message));
      } else {
        if (data.customPreferences) {
          resolve(data.customPreferences.map(function (p) {
            return p.domain;
          }));
        } else {
          resolve([]);
        }
      }
    });
  });
}; // stores the information for requests sent to first parties
// if the request is sent automatically then only the url and r3 preference is neccessary
// if the request is sent by a push and values of r1 and r2 are not unset they may be given as arguments too
// usage example:
//   requestSentFirstParty("google.com", 1)
//   .then(
//     ... next steps here
//   )
//   .catch(error => console.error(error))


var requestSentFirstParty = function requestSentFirstParty(url, x) {
  var y = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "u";
  var z = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : "u";
  return new Promise(function (resolve, reject) {
    chrome.storage.sync.get('firstPartyRequests', function (data) {
      if (chrome.runtime.lastError) {
        reject(Error(chrome.runtime.lastError.message));
      } else {
        var firstPartyRequests = data.firstPartyRequests;
        var now = new Date();
        var newRequest = {
          "domain": url,
          "r1": z,
          "r2": y,
          "r3": x,
          "date": {
            "day": now.getDate(),
            "month": now.getMonth(),
            "year": now.getFullYear(),
            "time": now.getTime()
          }
        };

        if (firstPartyRequests) {
          firstPartyRequests.push(newRequest);
        } else {
          firstPartyRequests = [newRequest];
        }

        chrome.storage.sync.set({
          firstPartyRequests: firstPartyRequests
        }, function () {
          return chrome.runtime.lastError ? reject(Error(chrome.runtime.lastError.message)) : resolve();
        });
      }
    });
  });
}; // stores the information for requests sent to third parties
// only the url and the preference sent is required as arguments
// usage example:
//       requestSentThirdParty("ads.google.com", 1)
//       .then(
//         .... next steps here
//       )
//       .catch(error => console.error(error))


var requestSentThirdParty = function requestSentThirdParty(url, x) {
  return new Promise(function (resolve, reject) {
    chrome.storage.sync.get('thirdPartyRequests', function (data) {
      if (chrome.runtime.lastError) {
        reject(Error(chrome.runtime.lastError.message));
      } else {
        var thirdPartyRequests = data.thirdPartyRequests;
        var now = new Date();
        var newRequest = {
          "domain": url,
          "r3": x,
          "date": {
            "day": now.getDate(),
            "month": now.getMonth(),
            "year": now.getFullYear()
          }
        };

        if (thirdPartyRequests) {
          thirdPartyRequests.push(newRequest);
        } else {
          thirdPartyRequests = [newRequest];
        }

        chrome.storage.sync.set({
          thirdPartyRequests: thirdPartyRequests
        }, function () {
          return chrome.runtime.lastError ? reject(Error(chrome.runtime.lastError.message)) : resolve();
        });
      }
    });
  });
};