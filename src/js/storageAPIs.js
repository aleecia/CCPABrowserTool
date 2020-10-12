



// stores the users Date of Birth
// usage example :
    // setUserDOB("5", "May", "2020")
    // .then(
    //     ...
    // )
    // .catch(error => console.error(error))
const setUserDOB = (day, month, year) => {
  var userDOB = {
    day: day,
    month: month,
    year: year,
  }
  return new Promise((resolve, reject) =>
    chrome.storage.sync.set({ userDOB }, () =>
      chrome.runtime.lastError
        ? reject(Error(chrome.runtime.lastError.message))
        : resolve()
    )
  )
}

// retrieves the stored DOB of the user
// usage example:
    // getUserDOB()
    // .then( date => {
    //     var day = date.day
    //     var month = date.month
    //     var year = date.year
    //     ...
    // })
    // .catch(error => console.error(error))

const getUserDOB = () => {
  return new Promise((resolve, reject) =>
    chrome.storage.sync.get('userDOB', (result) => {
      chrome.runtime.lastError
        ? reject(Error(chrome.runtime.lastError.message))
        : resolve(result)
    })
  )
}

// sets the custom (opposite to default) preference for the webpage opened
// usage example:
    // setCustomPreference()
    // .then(
    //     ...
    // )
    // .catch(error => console.error(error))

const setCustomPreference = () => {
  return new Promise((resolve, reject) => {
    getDefaultPreference().then((defaultPreference) => {
      var defaultPreference = defaultPreference.default
      var customPreference = 1
      if (defaultPreference) {
        customPreference = 0
      }
      chrome.tabs.getSelected(null, (tab) => {
        var tablink = tab.url.split('/')[2]
        chrome.storage.sync.get('customPreferences', (data) => {
          var customPreferences = data.customPreferences
          var newPreference = {
            domain: tablink,
            preference: customPreference,
          }
          if (customPreferences) {
            customPreferences.push(newPreference)
          } else {
            customPreferences = [newPreference]
          }
          chrome.storage.sync.set({ customPreferences }, () =>
            chrome.runtime.lastError
              ? reject(Error(chrome.runtime.lastError.message))
              : resolve()
          )
        })
      })
    })
  })
}
// checks whether a custom preference (exception) exists for the current opened tab
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

const checkCustomPreference = () => {
  return new Promise((resolve, reject) => {
    chrome.tabs.getSelected(null, (tab) => {
      var tablink = tab.url.split('/')[2]
      chrome.storage.sync.get('customPreferences', (data) => {
        var customPreferences = data.customPreferences
        if (customPreferences) {
          var filteredPreference = customPreferences.filter(
            (p) => p.domain == tablink
          )
          if (filteredPreference.length == 0) {
            reject(0)
          } else {
            resolve(filteredPreference[0])
          }
        } else {
          reject(0)
        }
      })
    })
  })
}

// the default preference can be set. for now we only have two options for preference
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
    default: preference,
  }
  return new Promise((resolve, reject) => {
    var customPreferences = []
    chrome.storage.sync.set({ customPreferences })
    chrome.storage.sync.set({ defaultPreference }, () =>
      chrome.runtime.lastError
        ? reject(Error(chrome.runtime.lastError.message))
        : resolve()
    )
  })
}

// retrieves the stored default preference.
// usage example:
    // getDefaultPreference()
    // .then(data => {
    //     var defaultPreference = data.default
    //     ...
    // })
    // .catch(error => console.error(error))
const getDefaultPreference = () => {
  return new Promise((resolve, reject) =>
    chrome.storage.sync.get('defaultPreference', (result) =>
      chrome.runtime.lastError
        ? reject(Error(chrome.runtime.lastError.message))
        : resolve(result.defaultPreference)
    )
  )
}
