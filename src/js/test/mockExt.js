"use strict";
// licensed under GPL 2 by github.com/serv-inc version from 2018-10-04
window.chrome = {
  _store: {"limit" : 160, _initialized: true},
  _store_man: {"limit" : 160},
  _store_updated: {"limit" : 0},
  _listeners: [],
  runtime: {
    onMessage : {
      addListener : function() {}
    },
    onInstalled: {
      addListener: (listener) => chrome._listeners.push(listener)
    }
  },
  windows : {
    onCreated : {
      addListener : function() {}
    },
    onRemoved : {
      addListener : function() {}
    }
  }, 
  webRequest : {
    onBeforeSendHeaders : {
      addListener : function() {},
      removeListener : function() {}
    },
    onSendHeaders : {
      addListener : function() {},
      removeListener : function() {}
    },
    onHeadersReceived : {
      addListener : function() {},
      removeListener : function() {}
    }
  },
  tabs : {
    onActiveChanged : {
      addListener : function() {},
    }
  },
  storage: {
    local: {
      get: (a, callback) => callback(chrome._store),
      set: (a) => {
        console.log('save' + JSON.stringify(a));
        for (let el in a) {
          if ( a.hasOwnProperty(el) ) {
            chrome._store[el] = a[el];
          }
        }
      }
    }
  },
  _triggerChange(changeSet={"limit": {"newValue": 0, "oldValue": 160}},
                 area="managed") {
    chrome._listeners.forEach((listener) => {
      listener(changeSet, area);
    });
  }
};
