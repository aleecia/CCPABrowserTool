'use strict';

const THIRTY_MINUTES_IN_MILLISECONDS = 1800000;

// Inputs: key: string.
// Returns object from localStorage.
const storageGet = function (key) {
    const store = localStorage;
    const json = store.getItem(key);
    if (json == null) {
        return undefined;
    }
    try {
        return JSON.parse(json);
    } catch (e) {
        console.log(`Couldn't parse json for ${key}`, e);
        return undefined;
    }
};

// Inputs: key: string, value: object.
// If value === undefined, removes key from storage.
// Returns undefined.
const storageSet = function (key, value) {
    const store = localStorage;
    if (value === undefined) {
        store.removeItem(key);
        return;
    }
    try {
        store.setItem(key, JSON.stringify(value));
    } catch (e) {
        console.log(`Couldn't set storage value for ${key}`, e)
    }
};

// Sets expirable object in storage to be used in place of a cookie
// Inputs:
//   name: string,
//   value: object,
//   millisecondsUntilExpire: number of milliseconds until the "cookie" expires
const setStorageCookie = function (name, value, millisecondsUntilExpire) {
    const expirationTime = Date.now() + (millisecondsUntilExpire || 0);
    storageSet(name, {
        value,
        expires: expirationTime
    });
};

// Returns value of storage "cookie" or undefined if the it doesn't exist or
// has expired
// Inputs:
//  name: string
const getStorageCookie = function (name) {
    const storedCookie = storageGet(name);
    if (storedCookie && (storedCookie.expires > Date.now())) {
        return storedCookie.value;
    }

    return undefined;
};