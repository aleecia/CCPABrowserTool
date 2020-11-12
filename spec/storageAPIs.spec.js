
const storageAPIs = require('../src/js/storageAPIs.js')

var date = '14-May-1996'


describe('setUserDOB', function() {
    it('sets User DOB', function(done) {
        var setSpy = spyOn(storageAPIs.chrome.storage.local, 'set').and.callThrough();

        storageAPIs.setUserDOB(date)
        .then( () => {
            expect(setSpy).toHaveBeenCalled()
            done()
        })
        .catch(error => {
            // console.log(error)
        })
    })
})

describe('getUserDOB', function() {
    it('gets User DOB', function(done) {
        var getSpy = spyOn(storageAPIs.chrome.storage.local, 'get').and.callThrough();
        storageAPIs.setUserDOB(date)        
        .then(
            storageAPIs.getUserDOB()
        )
        .then( (result)=> {
            expect(getSpy).toHaveBeenCalled()
            done()
        })
        .catch(error => {
            // console.log(error)
        })
    })
})



describe('setDefaultPreference', function() {
    it('sets default preference', function(done) {
        var setSpy = spyOn(storageAPIs.chrome.storage.local, 'set').and.callThrough()
        
        storageAPIs.setDefaultPreference(1)
        .then( () => {
            expect(setSpy).toHaveBeenCalled()
            done()
        })
        .catch(error => {
            // console.log(error)
        })
    })
})

describe('getDefaultPreference', function() {
    it('gets default preference', function(done) {
        var getSpy = spyOn(storageAPIs.chrome.storage.local, 'get').and.callThrough()
        
        storageAPIs.getDefaultPreference()
        .then( result => {
            expect(getSpy).toHaveBeenCalled()
            done()
        })
        .catch(error => {
            // console.log(error)
        })
    })
})

describe('setCustomPreference', function() {
    it('adds current URL to exception list', function(done) {
        var setSpy = spyOn(storageAPIs.chrome.storage.local, 'set').and.callThrough();
        storageAPIs.setDefaultPreference(1)
        .then(
            storageAPIs.setCustomPreference()
        )
        .then( () => {
            expect(setSpy).toHaveBeenCalled()
            done()
        })
        .catch(error => {
            // console.log("error",error)
        })
    })
})

describe('checkCustomPreference', function() {
    it('checks whether current URL is in exception list', function(done) {
        var getSpy = spyOn(storageAPIs.chrome.storage.local, 'get').and.callThrough();

        storageAPIs.checkCustomPreference()
        .then(() => {
            expect(getSpy).toHaveBeenCalled()
            done()
        })
        .catch(error => {
            // console.log(error)
        })
    })
})

describe('deleteCustomPreference', function() {
    it('deletes current URL from the exception list', function(done) {
        var setSpy = spyOn(storageAPIs.chrome.storage.local, 'set').and.callThrough()
        
        storageAPIs.deleteCustomPreference()
        .then( () => {
            expect(setSpy).toHaveBeenCalled()
            done()
        })
        .catch(error => {
            // console.log(error)
        })
    })
})

describe('getExceptionsList', function() {
    it('retreives the exception list', function(done) {
        var getSpy = spyOn(storageAPIs.chrome.storage.local, 'get').and.callThrough();

        storageAPIs.getExceptionsList()
        .then(() => {
            expect(getSpy).toHaveBeenCalled()
            done()
        })
        .catch(error => {
            // console.log(error)
        })
    })
})

describe('addRecord', function() {
    it('adds the request sent to the history log', function(done) {
        var setSpy = spyOn(storageAPIs.chrome.storage.local, 'set').and.callThrough()
        
        storageAPIs.addRecord()
        .then( () => {
            expect(setSpy).toHaveBeenCalled()
            done()
        })
        .catch(error => {
            // console.log(error)
        })
    })
})


describe('setParentPassword', function() {
    it('adds the request sent to the history log', function(done) {
        var setSpy = spyOn(storageAPIs.chrome.storage.local, 'set').and.callThrough()
        
        var now = new Date()
        storageAPIs.setParentPassword("xyz")
        .then( () => {
            expect(setSpy).toHaveBeenCalled()
            done()
        })
        .catch(error => {
            // console.log(error)
        })
    })
})

describe('getParentPassword', function() {
    it('retreives the exception list', function(done) {
        var getSpy = spyOn(storageAPIs.chrome.storage.local, 'get').and.callThrough();

        storageAPIs.getParentPassword()
        .then(() => {
            expect(getSpy).toHaveBeenCalled()
            done()
        })
        .catch(error => {
            // console.log(error)
        })
    })
})

describe('setIsParentMode', function() {
    it('adds the request sent to the history log', function(done) {
        var setSpy = spyOn(storageAPIs.chrome.storage.local, 'set').and.callThrough()
        
        storageAPIs.setIsParentMode()
        .then( () => {
            expect(setSpy).toHaveBeenCalled()
            done()
        })
        .catch(error => {
            // console.log(error)
        })
    })
})

describe('getIsParentMode', function() {
    it('retreives the exception list', function(done) {
        var getSpy = spyOn(storageAPIs.chrome.storage.local, 'get').and.callThrough();

        storageAPIs.getIsParentMode()
        .then(() => {
            expect(getSpy).toHaveBeenCalled()
            done()
        })
        .catch(error => {
            // console.log(error)
        })
    })
})

describe('addURLtoCustomList', function() {
    it('add the url (provided as argument) to the exception list', function(done) {
        var setSpy = spyOn(storageAPIs.chrome.storage.local, 'set').and.callThrough()
        storageAPIs.setDefaultPreference(1)
        .then(
            storageAPIs.addURLtoCustomList("x.y.z")
        )
        .then( () => {
            expect(setSpy).toHaveBeenCalled()
            done()
        })
        .catch(error => {
            console.log(error)
        })
    })
})

describe('removeURLfromCustomList', function() {
    it('removes the url (provided as argument) from the exception list', function(done) {
        var setSpy = spyOn(storageAPIs.chrome.storage.local, 'set').and.callThrough()

        storageAPIs.removeURLfromCustomList("x.y.z")
        .then( () => {
            expect(setSpy).toHaveBeenCalled()
            done()
        })
        .catch(error => {
            console.log(error)
        })
    })
})
