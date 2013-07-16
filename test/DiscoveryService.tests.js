
describe("Discovery Service", function () {

    var mockConnectionManager,
        mockFaultyConnectionManager,
        mockCallback,
        mockRootResponse,
        discoveryService,
        testRootPath = "/api/ezp/v2/",
        testName = "trash",
        testTrashObject = {
            "_media-type" : "application/vnd.ez.api.Trash+json",
            "_href" : "/api/ezp/v2/content/trash"
        },
        testRootObject = {
            "Root": {
                "trash": testTrashObject
            }
        },
        fakedFaultyGetObjectFromCache = function(name, callback){
            callback(false, null);
        };

    beforeEach(function (){

        mockConnectionManager = {
            request : function(method, url, body, headers, callback){
                mockRootResponse = {};
                mockRootResponse.body = JSON.stringify(testRootObject);
                callback(false, mockRootResponse);
            }
        };

        mockCallback = jasmine.createSpy('mockCallback');
    });


// ******************************
// Cases without errors
// ******************************
    describe("is calling objects with right arguments and saves info correctly while running calls", function () {

        beforeEach(function (){
            discoveryService = new DiscoveryService(
                testRootPath,
                mockConnectionManager
            );
        });

        it("discoverRoot", function(){

            spyOn(mockConnectionManager, 'request').andCallThrough();

            discoveryService.discoverRoot(
                testRootPath,
                mockCallback
            );

            expect(mockConnectionManager.request).toHaveBeenCalled();
            expect(mockConnectionManager.request.mostRecentCall.args[0]).toEqual("GET"); //method
            expect(mockConnectionManager.request.mostRecentCall.args[1]).toEqual(testRootPath); //url
            expect(mockConnectionManager.request.mostRecentCall.args[2]).toEqual(""); // body
            expect(mockConnectionManager.request.mostRecentCall.args[3].Accept).toEqual("application/vnd.ez.api.Root+json"); // headers
            expect(mockConnectionManager.request.mostRecentCall.args[4]).toEqual(jasmine.any(Function)); // callback

            expect(mockCallback).toHaveBeenCalled();
            expect(mockCallback.mostRecentCall.args[0]).toEqual(false); //errors
            expect(mockCallback.mostRecentCall.args[1]).toEqual(true); //response

            // Second call to test correct caching
            mockConnectionManager.request.reset();
            discoveryService.discoverRoot(
                testRootPath,
                mockCallback
            );

            expect(mockConnectionManager.request).not.toHaveBeenCalled();

            expect(mockCallback).toHaveBeenCalled();
            expect(mockCallback.mostRecentCall.args[0]).toEqual(false); //errors
            expect(mockCallback.mostRecentCall.args[1]).toEqual(true); //response

        });

        it("copyToCache", function(){

            discoveryService.copyToCache({"trash": testTrashObject});

            expect(discoveryService.cacheObject["trash"]).toEqual(testTrashObject);
        });

        it("getObjectFromCache", function(){

            spyOn(discoveryService, 'discoverRoot').andCallThrough();

            discoveryService.getObjectFromCache(
                "trash",
                mockCallback
            );

            expect(discoveryService.discoverRoot).toHaveBeenCalled();
            expect(mockCallback).toHaveBeenCalled();
            expect(mockCallback.mostRecentCall.args[0]).toEqual(false); //error
            expect(mockCallback.mostRecentCall.args[1]).toEqual(testTrashObject); //response
        });

        it("getObjectFromCache when object is cached but not in Root ", function(){

            spyOn(discoveryService, 'discoverRoot').andCallThrough();

            discoveryService.cacheObject.trashNotInRoot = testTrashObject;

            discoveryService.getObjectFromCache(
                "trashNotInRoot",
                mockCallback
            );

            expect(discoveryService.discoverRoot).toHaveBeenCalled();
            expect(mockCallback).toHaveBeenCalled();
            expect(mockCallback.mostRecentCall.args[0]).toEqual(false); //error
            expect(mockCallback.mostRecentCall.args[1]).toEqual(testTrashObject); //response
        });

        it("getUrl", function(){

            spyOn(discoveryService, 'getObjectFromCache').andCallThrough();

            discoveryService.getUrl(
                "trash",
                mockCallback
            );

            expect(discoveryService.getObjectFromCache).toHaveBeenCalled();
            expect(mockCallback).toHaveBeenCalled();
            expect(mockCallback.mostRecentCall.args[0]).toEqual(false); //error
            expect(mockCallback.mostRecentCall.args[1]).toEqual(testTrashObject._href); //response
        });

        it("getMediaType", function(){

            spyOn(discoveryService, 'getObjectFromCache').andCallThrough();

            discoveryService.getMediaType(
                "trash",
                mockCallback
            );

            expect(discoveryService.getObjectFromCache).toHaveBeenCalled();
            expect(mockCallback).toHaveBeenCalled();
            expect(mockCallback.mostRecentCall.args[0]).toEqual(false); //error
            expect(mockCallback.mostRecentCall.args[1]).toEqual(testTrashObject["_media-type"]); //response
        });

        it("getInfoObject", function(){

            spyOn(discoveryService, 'getObjectFromCache').andCallThrough();

            discoveryService.getInfoObject(
                "trash",
                mockCallback
            );

            expect(discoveryService.getObjectFromCache).toHaveBeenCalled();
            expect(mockCallback).toHaveBeenCalled();
            expect(mockCallback.mostRecentCall.args[0]).toEqual(false); //error
            expect(mockCallback.mostRecentCall.args[1]).toEqual(testTrashObject); //response
        });

    });

// ******************************
// Cases with errors
// ******************************
    describe("is returning errors correctly, while", function (){

        it("running discoverRoot call", function(){

            mockFaultyConnectionManager = {
                request : function(method, url, body, headers, callback){
                    callback(true, false);
                }
            };
            spyOn(mockFaultyConnectionManager, 'request').andCallThrough();

            discoveryService = new DiscoveryService(
                testRootPath,
                mockFaultyConnectionManager
            );

            discoveryService.discoverRoot(
                testRootPath,
                mockCallback
            );

            expect(mockFaultyConnectionManager.request).toHaveBeenCalled();
            expect(mockFaultyConnectionManager.request.mostRecentCall.args[0]).toEqual("GET"); //method
            expect(mockFaultyConnectionManager.request.mostRecentCall.args[1]).toEqual(testRootPath); //url
            expect(mockFaultyConnectionManager.request.mostRecentCall.args[2]).toEqual(""); // body
            expect(mockFaultyConnectionManager.request.mostRecentCall.args[3].Accept).toEqual("application/vnd.ez.api.Root+json"); // headers
            expect(mockFaultyConnectionManager.request.mostRecentCall.args[4]).toEqual(jasmine.any(Function)); // callback

            expect(mockCallback).toHaveBeenCalled();
            expect(mockCallback.mostRecentCall.args[0]).toEqual(jasmine.any(CAPIError)); //errors
            expect(mockCallback.mostRecentCall.args[1]).toEqual(jasmine.any(Response)); //response

        });

        describe("trying to access non-existent object (sorry no magic in stock today, only trash :)", function () {

            beforeEach(function (){
                discoveryService = new DiscoveryService(
                    testRootPath,
                    mockConnectionManager
                );
            });

            it("getObjectFromCache", function(){

                spyOn(discoveryService, 'discoverRoot').andCallThrough();

                discoveryService.getObjectFromCache(
                    "magic",
                    mockCallback
                );

                expect(discoveryService.discoverRoot).toHaveBeenCalled();
                expect(mockCallback).toHaveBeenCalled();
                expect(mockCallback.mostRecentCall.args[0]).toEqual(jasmine.any(CAPIError)); //error
                expect(mockCallback.mostRecentCall.args[1]).toEqual(jasmine.any(Response)); //response
            });

            it("getUrl", function(){

                spyOn(discoveryService, 'getObjectFromCache').andCallThrough();

                discoveryService.getUrl(
                    "magic",
                    mockCallback
                );

                expect(discoveryService.getObjectFromCache).toHaveBeenCalled();
                expect(mockCallback).toHaveBeenCalled();
                expect(mockCallback.mostRecentCall.args[0]).toEqual(jasmine.any(CAPIError)); //error
                expect(mockCallback.mostRecentCall.args[1]).toEqual(jasmine.any(Response)); //response
            });

            it("getMediaType", function(){

                spyOn(discoveryService, 'getObjectFromCache').andCallThrough();

                discoveryService.getMediaType(
                    "magic",
                    mockCallback
                );

                expect(discoveryService.getObjectFromCache).toHaveBeenCalled();
                expect(mockCallback).toHaveBeenCalled();
                expect(mockCallback.mostRecentCall.args[0]).toEqual(jasmine.any(CAPIError)); //error
                expect(mockCallback.mostRecentCall.args[1]).toEqual(jasmine.any(Response)); //response
            });

            it("getInfoObject", function(){

                spyOn(discoveryService, 'getObjectFromCache').andCallThrough();

                discoveryService.getInfoObject(
                    "magic",
                    mockCallback
                );

                expect(discoveryService.getObjectFromCache).toHaveBeenCalled();
                expect(mockCallback).toHaveBeenCalled();
                expect(mockCallback.mostRecentCall.args[0]).toEqual(jasmine.any(CAPIError)); //error
                expect(mockCallback.mostRecentCall.args[1]).toEqual(jasmine.any(Response)); //response
            });
        });

        describe("dealing with faulty getObjectFromCache call", function () {

            beforeEach(function (){
                discoveryService = new DiscoveryService(
                    testRootPath,
                    mockConnectionManager
                );

                spyOn(discoveryService, 'getObjectFromCache').andCallFake(fakedFaultyGetObjectFromCache);
            });

            it("getUrl", function(){

                discoveryService.getUrl(
                    "trash",
                    mockCallback
                );

                expect(discoveryService.getObjectFromCache).toHaveBeenCalled();
                expect(mockCallback).toHaveBeenCalled();
                expect(mockCallback.mostRecentCall.args[0]).toEqual(jasmine.any(CAPIError)); //error
                expect(mockCallback.mostRecentCall.args[1]).toEqual(jasmine.any(Response)); //response
            });

            it("getMediaType", function(){

                discoveryService.getMediaType(
                    "trash",
                    mockCallback
                );

                expect(discoveryService.getObjectFromCache).toHaveBeenCalled();
                expect(mockCallback).toHaveBeenCalled();
                expect(mockCallback.mostRecentCall.args[0]).toEqual(jasmine.any(CAPIError)); //error
                expect(mockCallback.mostRecentCall.args[1]).toEqual(jasmine.any(Response)); //response
            });

            it("getInfoObject", function(){

                discoveryService.getInfoObject(
                    "trash",
                    mockCallback
                );

                expect(discoveryService.getObjectFromCache).toHaveBeenCalled();
                expect(mockCallback).toHaveBeenCalled();
                expect(mockCallback.mostRecentCall.args[0]).toEqual(jasmine.any(CAPIError)); //error
                expect(mockCallback.mostRecentCall.args[1]).toEqual(jasmine.any(Response)); //response
            });
        });

    });
});