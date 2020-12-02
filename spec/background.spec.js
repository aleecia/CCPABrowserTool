

describe('setInitialCCPARule', function () {
    beforeEach(() => {
        returnMock = {
            then: jasmine.createSpy()
        };
        setInitialCCPARule = {
            getDefaultPreference: jasmine.createSpy().and.returnValue(returnMock)
        }
        setInitialCCPARule.getDefaultPreference();
    })
    it('initial CCPA rule successfully', function () {
        expect(setInitialCCPARule.getDefaultPreference).toHaveBeenCalled();
    })
})


describe('refreshPage', function () {
    beforeEach(() => {
        _refreshPage = {
            chrome: {
                tabs: {
                    getSelected: (id, callback) => { },
                    executeScript: (id, obj) => { }
                }
            }
        }
        spyOn(_refreshPage.chrome.tabs, 'getSelected').and.callThrough();
        _refreshPage.chrome.tabs.getSelected();
    })
    it('Refresh page successfully', function () {
        expect(_refreshPage.chrome.tabs.getSelected).toHaveBeenCalled();
    })
})

describe('constructFirstPartyCCPARule', function () {
    beforeEach(() => {
        returnMock = {
            then: jasmine.createSpy()
        };
        constructFirstPartyCCPARule = {
            storeFirstPartyRequest: jasmine.createSpy().and.returnValue(returnMock)
        }
        constructFirstPartyCCPARule.storeFirstPartyRequest(0);
        constructFirstPartyCCPARule.storeFirstPartyRequest(1);
    })
    it('storeFirstPartyRequest should be called with 0', function () {
        expect(constructFirstPartyCCPARule.storeFirstPartyRequest).toHaveBeenCalledWith(0);
    })
    it('storeFirstPartyRequest should be called with 1', function () {
        expect(constructFirstPartyCCPARule.storeFirstPartyRequest).toHaveBeenCalledWith(1);
    })
})


describe('constructThirdPartyCCPARule', function () {
    beforeEach(() => {
        returnMock = {
            then: jasmine.createSpy()
        };
        constructThirdPartyCCPARule = {
            storeThirdPartyRequest: jasmine.createSpy().and.returnValue(returnMock)
        }
        constructThirdPartyCCPARule.storeThirdPartyRequest(0);
        constructThirdPartyCCPARule.storeThirdPartyRequest(1);
    })
    it('storeFirstPartyRequest should be called with 0', function () {
        expect(constructThirdPartyCCPARule.storeThirdPartyRequest).toHaveBeenCalledWith(0);
    })
    it('storeFirstPartyRequest should be called with 1', function () {
        expect(constructThirdPartyCCPARule.storeThirdPartyRequest).toHaveBeenCalledWith(1);
    })
})


describe('setAllowAllToSell', function () {
    var data_Not_Allow = {
        "default": 1,
        "hostname": "www.google.com"
    }
    var data_Allow = {
        "default": 0,
        "hostname": "www.google.com"
    }
    it('Set Not allow all to sell flag successfully', function () {
        expect(setAllowAllToSell(data_Not_Allow)).toEqual(jasmine.anything());
    })
    it('Set allow all to sell flag successfully', function () {
        expect(setAllowAllToSell(data_Allow)).toEqual(jasmine.anything());
    })
})


describe('isInExceptionListHelper', function () {
    beforeEach(() => {
        chrome = {
            storage: {
                local: {
                    get: (customPreferences, callback) => callback(chrome._store)
                }
            }
        }
    })
    it('isInExceptionList returns corret promise', function () {
        var hostname = "www.google.com";
        var getSpy = spyOn(chrome.storage.local, 'get');
        isInExceptionListHelper(hostname);
        expect(isInExceptionListHelper(hostname)).toEqual(jasmine.anything());
        expect(getSpy).toHaveBeenCalled();
    })
})


describe('isThirdPartyURL', function () {
    beforeEach(() => {
        chrome = {
            tabs: {
                getSelected: (id, callback) => { }
            }
        }
    })
    it('isThirdPartyURL returns corret promise', function () {
        var url = "https://www.google.com";
        var getSpy = spyOn(chrome.tabs, 'getSelected').and.callThrough();
        isThirdPartyURL(url);
        expect(getSpy).toHaveBeenCalled();
    })
})


describe('discardRequest', function () {
    it('discard request returns corret promise', function () {
        expect(discardRequest()).toEqual(jasmine.anything());
    })
})

describe('isCurrentTabRequest', function () {
    var request = {
        tabId : 111,
        url : ""
    }
    it('isCurrentTabRequest function returns corret promise', function () {
        expect(isCurrentTabRequest(request)).toEqual(jasmine.anything());
    })
})


describe('getCCPARule', function () {
    var hostname = ""
    it('getCCPARule function returns corret promise', function () {
        expect(getCCPARule(hostname)).toEqual(jasmine.anything());
    })
})


describe('setBlockThirdPartyFlag', function () {
    var data = ""
    it('set the BlockThirdParty Flag successfully', function () {
        expect(setBlockThirdPartyFlag(data)).toEqual(jasmine.anything());
    })
})



describe('addFirstPartyRecord', function () {
    beforeEach(() => {
        returnMock = {
            then: jasmine.createSpy()
        };
        addFirstPartyRecord = {
            addRecord: jasmine.createSpy().and.returnValue(returnMock),
            incrementDoNotSaleCount: jasmine.createSpy().and.returnValue(returnMock),
            incrementAllowSaleCount: jasmine.createSpy().and.returnValue(returnMock),
        }
        addFirstPartyRecord.addRecord("", 0, firstParty_delete, firstParty_get);
        addFirstPartyRecord.incrementDoNotSaleCount()
        addFirstPartyRecord.incrementAllowSaleCount()
    })
    it('added record for first party successfully', function () {
        expect(addFirstPartyRecord.addRecord).toHaveBeenCalled();
    })
    it('increment Do Not Sale count successfully', function () {
        expect(addFirstPartyRecord.incrementDoNotSaleCount).toHaveBeenCalled();
    })
    it('increment Allow Sale count successfully', function () {
        expect(addFirstPartyRecord.incrementAllowSaleCount).toHaveBeenCalled();
    })
})


describe('addThirdPartyRecord', function () {
    beforeEach(() => {
        returnMock = {
            then: jasmine.createSpy()
        };
        addThirdPartyRecord = {
            addRecord: jasmine.createSpy().and.returnValue(returnMock),
            incrementDoNotSaleCount: jasmine.createSpy().and.returnValue(returnMock),
            incrementAllowSaleCount: jasmine.createSpy().and.returnValue(returnMock),
        }
        addThirdPartyRecord.addRecord("", 0, "1", "0");
        addThirdPartyRecord.incrementDoNotSaleCount()
        addThirdPartyRecord.incrementAllowSaleCount()
    })
    it('added record for first party successfully', function () {
        expect(addThirdPartyRecord.addRecord).toHaveBeenCalled();
    })
    it('increment Do Not Sale count successfully', function () {
        expect(addThirdPartyRecord.incrementDoNotSaleCount).toHaveBeenCalled();
    })
    it('increment Allow Sale count successfully', function () {
        expect(addThirdPartyRecord.incrementAllowSaleCount).toHaveBeenCalled();
    })
})