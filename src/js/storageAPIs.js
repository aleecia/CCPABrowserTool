// stores the users Date of Birth
// usage example :
// setUserDOB("5", "May", "2020")
// .then(
//     ...
// )
// .catch(error => console.error(error))
const setUserDOB = (userDOB) => {
	var userDOB = {
		userDOB: userDOB,
	}
	return new Promise((resolve, reject) =>
		chrome.storage.local.set(userDOB, () =>
			chrome.runtime.lastError ?
			reject(Error(chrome.runtime.lastError.message)) :
			resolve()
		)
	)
}

// retrieves the stored DOB of the user
// usage example:
// getUserDOB()
// .then( result => {
//     var birthday = result.userDOB
//     ...
// })
// .catch(error => console.error(error))

const getUserDOB = () => {
	return new Promise((resolve, reject) =>
		chrome.storage.local.get('userDOB', (result) => {
			chrome.runtime.lastError ?
				reject(Error(chrome.runtime.lastError.message)) :
				resolve(result)
		})
	)
}

// stores the users password set for parent mode
// usage example :
// setParentPassword("12345")
// .then(
//     ...
// )
// .catch(error => console.error(error))
const setParentPassword = (parentPassword) => {
	var parentPassword = {
		parentPassword: parentPassword,
	}
	return new Promise((resolve, reject) =>
		chrome.storage.local.set(parentPassword, () =>
			chrome.runtime.lastError ?
			reject(Error(chrome.runtime.lastError.message)) :
			resolve()
		)
	)
}

// retrieves the stored parent password of the user
// usage example:
// getParentPassword()
// .then( result => {
//     var pw = result.parentPassword
// })
// .catch(error => console.error(error))
const getParentPassword = () => {
	return new Promise((resolve, reject) =>
		chrome.storage.local.get('parentPassword', (result) => {
			chrome.runtime.lastError ?
				reject(Error(chrome.runtime.lastError.message)) :
				resolve(result)
		})
	)
}

// stores the current status about whether user is in parent mode
// usage example :
// setIsParentMode(true)
// .then(
//     ...
// )
// .catch(error => console.error(error))
const setIsParentMode = (isParentMode) => {
	var isParentMode = {
		isParentMode: isParentMode,
	}
	return new Promise((resolve, reject) =>
		chrome.storage.local.set(
			isParentMode, () =>
			chrome.runtime.lastError ?
			reject(Error(chrome.runtime.lastError.message)) :
			resolve()
		)
	)
}

// retrieves if the user is in parent mode
// usage example:
// getIsParentMode()
// .then( result => {
//     var isParentMode = result.isParentMode
//     ...
// })
// .catch(error => console.error(error))

const getIsParentMode = () => {
	return new Promise((resolve, reject) =>
		chrome.storage.local.get('isParentMode', (result) => {
			chrome.runtime.lastError ?
				reject(Error(chrome.runtime.lastError.message)) :
				resolve(result)
		})
	)
}

// Grant a session of 15 minutes for parents access after entering the password
// usage example :
// setParentAccessExpireTime(date.getTime())
// .then(
//     ...
// )
// .catch(error => console.error(error))
const setParentAccessExpireTime = (parentAccessExpireTime) => {
	var parentAccessExpireTime = {
		parentAccessExpireTime: parentAccessExpireTime,
	}
	return new Promise((resolve, reject) =>
		chrome.storage.local.set(
			parentAccessExpireTime, () =>
			chrome.runtime.lastError ?
			reject(Error(chrome.runtime.lastError.message)) :
			resolve()
		)
	)
}

// retrieves the granted timestamp before which parents don't need to enter pw again 
// usage example:
// getParentAccessExpireTime()
// .then( result => {
//     var parentAccessExpireTime = result.parentAccessExpireTime
//     ...
// })
// .catch(error => console.error(error))

const getParentAccessExpireTime = () => {
	return new Promise((resolve, reject) =>
		chrome.storage.local.get('parentAccessExpireTime', (result) => {
			chrome.runtime.lastError ?
				reject(Error(chrome.runtime.lastError.message)) :
				resolve(result)
		})
	)
}

// Reset third party list
// usage example :
// resetThirdPartyList()
// .then(
//     ...
// )
// .catch(error => console.error(error))
const resetThirdPartyList = () => {
	var thirdPartyList = []
	return new Promise((resolve, reject) =>
		chrome.storage.local.set({
				thirdPartyList
			}, () =>
			chrome.runtime.lastError ?
			reject(Error(chrome.runtime.lastError.message)) :
			resolve()
		)
	)
}

// sets stop sending for third parties (only for r3)
// usage example:
// setStopSendingForThirdParty()
// .then(
//     ...
// )
// .catch(error => console.error(error))

const setStopSendingForThirdParty = () => {
	return new Promise((resolve, reject) => {
		chrome.tabs.getSelected(null, tab => {
			var tablink = tab.url.split('/')[2]
			chrome.storage.local.get('stopSendingForThirdParty', data => {
				var stopSendingForThirdParty = data.stopSendingForThirdParty;
				var newPreference = {
					"domain": tablink,
					"preference": stopSendingForThirdParty
				}

				if (stopSendingForThirdParty) {
					stopSendingForThirdParty = stopSendingForThirdParty.filter(p => p.domain !== tablink)
					stopSendingForThirdParty.push(newPreference)
				} else {
					stopSendingForThirdParty = [newPreference]
				}
				chrome.storage.local.set({
						stopSendingForThirdParty
					}, () =>
					chrome.runtime.lastError ?
					reject(Error(chrome.runtime.lastError.message)) :
					resolve()
				)
			})
		})
	})
}

// checks whether a stop sending for third party signal set for the current opened tab
// usage example:
// checkStopSendingForThirdParty()
// .then(data => { // data would be a boolean val, true -> block, false -> unblock
//      ...
// })
// 

const checkStopSendingForThirdParty = () => {
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
						resolve(false)
					} else {
						resolve(true)
					}
				} else {
					resolve(false)
				}
			})
		})
	})
}

// deletes the setting
// usage example:
//       deleteStopSendingForThirdParty()
//       .then(() => {
//         ... next steps here
//       })
//       .catch(error => console.error(error))

const deleteStopSendingForThirdParty = () => {
	return new Promise((resolve, reject) => {
		chrome.tabs.getSelected(null, tab => {
			var tablink = tab.url.split('/')[2]
			chrome.storage.local.get('stopSendingForThirdParty', data => {
				var stopSendingForThirdParty = data.stopSendingForThirdParty
				if (stopSendingForThirdParty) {
					stopSendingForThirdParty = stopSendingForThirdParty.filter(p => p.domain !== tablink)
				} else {
					stopSendingForThirdParty = []
				}
				chrome.storage.local.set({
						stopSendingForThirdParty
					}, () =>
					chrome.runtime.lastError ?
					reject(Error(chrome.runtime.lastError.message)) :
					resolve()
				)
			})
		})
	})
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
		getDefaultPreference()
			.then(defaultPreference => {
				var defaultPreference = defaultPreference.default;
				var customPreference = 1;
				if (defaultPreference) {
					customPreference = 0;
				}
				chrome.tabs.getSelected(null, tab => {
					var tablink = tab.url.split('/')[2]
					chrome.storage.local.get('customPreferences', data => {
						var customPreferences = data.customPreferences
						var newPreference = {
							"domain": tablink,
							"preference": customPreference
						}

						if (customPreferences) {
							customPreferences = customPreferences.filter(p => p.domain !== tablink)
							customPreferences.push(newPreference)
						} else {
							customPreferences = [newPreference]
						}
						chrome.storage.local.set({
								customPreferences
							}, () =>
							chrome.runtime.lastError ?
							reject(Error(chrome.runtime.lastError.message)) :
							resolve()
						)
					})
				})
			})
			.catch(error => {
				reject(Error(error))
			})
	})
}

// adds the url (provided as argument) to the exception list
// usage:
// 	addURLtoCustomList("www.youtube.com")
// 	.then(
// 		 ... next steps here
// 	)
// 	.catch(error => console.log(error))

const addURLtoCustomList = (url) => {
	return new Promise((resolve, reject) => {
		getDefaultPreference()
			.then(defaultPreference => {
				var defaultPreference = defaultPreference.default;
				var customPreference = 1;
				if (defaultPreference) {
					customPreference = 0;
				}
				var newPreference = {
					"domain": url,
					"preference": customPreference
				}
				chrome.storage.local.get('customPreferences', data => {
					var customPreferences = data.customPreferences
					if (customPreferences) {
						customPreferences = customPreferences.filter(p => p.domain !== url)
						customPreferences.push(newPreference)
					} else {
						customPreferences = [newPreference]
					}
					chrome.storage.local.set({
							customPreferences
						}, () =>
						chrome.runtime.lastError ?
						reject(Error(chrome.runtime.lastError.message)) :
						resolve()
					)
				})

			})
			.catch(error => {
				reject(Error(error))
			})
	})
}

// removes the url (provided as argument) from the exception list
// usage:
// 	removeURLfromCustomList("www.youtube.com")
// 	.then(
// 		 ... next steps here
// 	)
// 	.catch(error => console.log(error))

const removeURLfromCustomList = (url) => {
	return new Promise((resolve, reject) => {
		chrome.storage.local.get('customPreferences', data => {
			var customPreferences = data.customPreferences;
			if (customPreferences) {
				customPreferences = customPreferences.filter(p => p.domain !== url)
			} else {
				customPreferences = []
			}
			chrome.storage.local.set({
					customPreferences
				}, () =>
				chrome.runtime.lastError ?
				reject(Error(chrome.runtime.lastError.message)) :
				resolve()
			)
		})
	})
}


// checks whether a custom preference (exception) exists for the current opened tab
// if an exception for the current page exists the promise resolves with the value 1 
// otherwise it resolves with a value of 0
// usage example:
// checkCustomPreference()
// .then(data => { // data would be a boolean val indicating whether or not the customPreference exists
//      ...
// })
// 

const checkCustomPreference = () => {
	return new Promise((resolve, reject) => {
		chrome.tabs.getSelected(null, (tab) => {
			var tablink = tab.url.split('/')[2]
			chrome.storage.local.get('customPreferences', (data) => {
				var customPreferences = data.customPreferences
				if (customPreferences) {
					var filteredPreference = customPreferences.filter(
						(p) => p.domain == tablink
					)
					if (filteredPreference.length == 0) {
						resolve(0)
					} else {
						resolve(1)
					}
				} else {
					resolve(0)
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

const setDefaultPreference = (preference) => {
	var defaultPreference = {
		default: preference,
	}
	return new Promise((resolve, reject) => {
		var customPreferences = []
		chrome.storage.local.set({
			customPreferences
		}, () => {})
		chrome.storage.local.set({
				defaultPreference
			}, () =>
			chrome.runtime.lastError ?
			reject(Error(chrome.runtime.lastError.message)) :
			resolve()
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
		chrome.storage.local.get('defaultPreference', (result) =>
			chrome.runtime.lastError ?
			reject(Error(chrome.runtime.lastError.message)) :
			resolve(result.defaultPreference)
		)
	)
}


// deletes the current opened tab from the exceptions list
// if the current tab's url is not in the exception list it would do nothing
// usage example:
//       deleteCustomPreference()
//       .then(() => {
//         ... next steps here
//       })
//       .catch(error => console.error(error))

const deleteCustomPreference = () => {
	return new Promise((resolve, reject) => {
		chrome.tabs.getSelected(null, tab => {
			var tablink = tab.url.split('/')[2]
			chrome.storage.local.get('customPreferences', data => {
				var customPreferences = data.customPreferences
				if (customPreferences) {
					customPreferences = customPreferences.filter(p => p.domain !== tablink)
				} else {
					customPreferences = []
				}
				chrome.storage.local.set({
						customPreferences
					}, () =>
					chrome.runtime.lastError ?
					reject(Error(chrome.runtime.lastError.message)) :
					resolve()
				)
			})
		})
	})
}


// retreives the list of strings (urls) that are included in the exceptions list
// usage example:
//       getExceptionsList()
//       .then(data => {
//         .... next steps here
//       })
//       .catch(error => console.error(error))

const getExceptionsList = () => {
	return new Promise((resolve, reject) => {
		chrome.storage.local.get('customPreferences', data => {
			if (chrome.runtime.lastError) {
				reject(Error(chrome.runtime.lastError.message))
			} else {
				if (data.customPreferences) {
					resolve(data.customPreferences.map(p => p.domain))
				} else {
					resolve([])
				}
			}
		})
	})
}


// stores the information for requests sent to first parties
// the values of r1 and r2 must be supplied as arguments
// usage example:
//   addRecord("google.com", 0, 1, 1)
//   .then(
//     ... next steps here
//   )
//   .catch(error => console.error(error))

const addRecord = (url, thirdParty, y, z) => {
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
					const duplications = history.filter(p => (p.domain == newRequest.domain && p.r1 == newRequest.r1 && p.r2 == newRequest.r2 &&
						p.date.year == newRequest.date.year && p.date.month == newRequest.date.month && p.date.day == newRequest.date.day &&
						p.date.time.hour == newRequest.date.time.hour && p.date.time.minutes == newRequest.date.time.minutes))
					if (duplications.length == 0)
						history.push(newRequest)
				} else {
					history = [newRequest]
				}
				chrome.storage.local.set({
						history
					}, () =>
					chrome.runtime.lastError ?
					reject(Error(chrome.runtime.lastError.message)) :
					resolve()
				)
			}
		})
	})
}


// increments the number of do not sale my data requests sent by the user
// usage example:
// 	incrementDoNotSaleCount()
// 	.then(
// 		... next steps here
// 	)
// 	.catch(error => console.log(error))

const incrementDoNotSaleCount = () => {
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
				chrome.storage.local.set({
						DoNotSaleCount
					}, () =>
					chrome.runtime.lastError ?
					reject(Error(chrome.runtime.lastError.message)) :
					resolve()
				)
			}
		})
	})
}

// retrieves the number of do not sale my data requests sent by the user
// usage example:
// 	getDoNotSaleCount()
// 	.then(count =>
// 		... next steps here
// 	)
// 	.catch(error => console.log(error))

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

// increments the number of do not sale my data requests sent by the user
// usage example:
// 	incrementAllowSaleCount()
// 	.then(
// 		... next steps here
// 	)
// 	.catch(error => console.log(error))

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
				chrome.storage.local.set({
						AllowSaleCount
					}, () =>
					chrome.runtime.lastError ?
					reject(Error(chrome.runtime.lastError.message)) :
					resolve()
				)
			}
		})
	})
}

// retrieves the number of do not sale my data requests sent by the user
// usage example:
// 	getAllowSaleCount()
// 	.then(count =>
// 		... next steps here
// 	)
// 	.catch(error => console.log(error))

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


// retrieves all records of all requests sent
// usage example:
// 	getAllRecords()
// 	.then(data => 
// 		...	
// 	)
// 	.catch(error => console.log(erorr))

const getAllRecords = () => {
	return new Promise((resolve, reject) => {
		chrome.storage.local.get('history', data => {
			if (chrome.runtime.lastError) {
				reject(Error(chrome.runtime.lastError.message))
			} else {
				var history = data.history
				if (history) {
					resolve(history)
				}
				resolve([])
			}
		})
	})
}

// retrieves all first party records 
// usage example:
// 	getFirstPartyRecords()
// 	.then(data =>
// 		...	
// 	)
// 	.catch(error => console.log(error))

const getFirstPartyRecords = () => {
	return new Promise((resolve, reject) => {
		chrome.storage.local.get('history', data => {
			if (chrome.runtime.lastError) {
				reject(Error(chrome.runtime.lastError.message))
			} else {
				var history = data.history
				if (history) {
					history = history.filter(p => (p.thirdParty == 0))
					resolve(history)
				}
				resolve([])
			}
		})
	})
}

// retrieves all third party records 
// usage example:
// 	getThirdPartyRecords()
// 	.then(data =>
// 		...	
// 	)
// 	.catch(error => console.log(error))

const getThirdPartyRecords = () => {
	return new Promise((resolve, reject) => {
		chrome.storage.local.get('history', data => {
			if (chrome.runtime.lastError) {
				reject(Error(chrome.runtime.lastError.message))
			} else {
				var history = data.history
				if (history) {
					history = history.filter(p => (p.thirdParty == 1))
					resolve(history)
				}
				resolve([])
			}
		})
	})
}


// gets the last sent first party request to the url 
// provided as argument
// usage example:
// 		getLastRequest("google.com")
//		.then(data => 
//			... next steps here
//		)
//		.catch(
//			error
//		 )

const getLastRequest = (url) => {
	return new Promise((resolve, reject) => {
		chrome.storage.local.get('history', data => {
			if (chrome.runtime.lastError) {
				reject(Error(chrome.runtime.lastError.message))
			} else {
				var history = data.history
				if (history) {
					history = history.filter(p => (p.domain === url && p.thirdParty == 0))
					if (history) {
						resolve(history[history.length - 1])
					}
				}
				resolve(null)
			}
		})
	})
}



// // uncomment the following lines for testing:

// const chrome = {
// 	_store : {
// 		"limit": 160, 
// 		_initialized: true
// 	},
// 	_tab : {
// 		tab: {
// 			url : "https://github.com/"
// 		}
// 	},
//     storage: {
// 		local: {
// 			get: (a, callback) => callback(chrome._store),
// 			set: (a, callback) => {
// 				// console.log('save' + JSON.stringify(a));
// 				for (let el in a) {
// 					if (a.hasOwnProperty(el)) {
// 						chrome._store[el] = a[el];
// 					}
// 				}
// 				callback()
// 			}
// 		}
// 	},
// 	runtime: {
// 		lastError : 0
// 	},
// 	tabs: {
// 		getSelected: (id, callback) => {
// 			if (!(id)) {
// 				callback(chrome._tab.tab)
// 			}
// 		}
// 	}
// }


// module.exports = {
// 	chrome,
// 	removeURLfromCustomList,
// 	addURLtoCustomList,
// 	setUserDOB,
// 	getUserDOB,
// 	setParentPassword,
// 	getParentPassword,
// 	setIsParentMode,
// 	getIsParentMode,
// 	setCustomPreference,
// 	checkCustomPreference,
// 	setDefaultPreference,
// 	getDefaultPreference,
// 	deleteCustomPreference,
// 	getExceptionsList,
// 	addRecord
// }