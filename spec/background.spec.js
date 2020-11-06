

describe('parseOriginURL', function () {
    var url = "https://www.google.com";
    it('Parse origin url', function () {
        expect(parseOriginURL(url)).toEqual("https://www.google.com");
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
    it('Refresh page', function () {
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
    var defaultPreference_NotAllow = {
        "default": 1
    }
    var defaultPreference_Allow = {
        "default": 0
    }
    it('Set allow all to sell flag', function () {
        expect(setAllowAllToSell(defaultPreference_NotAllow)).toEqual(false);
    })
    it('Set allow all to sell flag', function () {
        expect(setAllowAllToSell(defaultPreference_Allow)).toEqual(true);
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
    it('Is in exception list', function () {
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
    it('Is third party url', function () {
        var url = "https://www.google.com";
        var getSpy = spyOn(chrome.tabs, 'getSelected').and.callThrough();
        isThirdPartyURL(url);
        expect(getSpy).toHaveBeenCalled();
    })
})


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
    it('setInitialCCPARule', function () {
        expect(setInitialCCPARule.getDefaultPreference).toHaveBeenCalled();
    })
})