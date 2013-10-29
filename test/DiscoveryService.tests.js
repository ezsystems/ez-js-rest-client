define(function (require) {

    // Declaring dependencies
    var DiscoveryService = require("services/DiscoveryService"),
        CAPIError = require("structures/CAPIError");

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
            };

        beforeEach(function (){

            mockConnectionManager = {
                request : function(method, url, body, headers, callback){
                    mockRootResponse = {};
                    mockRootResponse.document = testRootObject;
                    callback(false, mockRootResponse);
                }
            };

            mockCallback = jasmine.createSpy('mockCallback');
        });


    // ******************************
    // Cases without errors
    // ******************************
        describe("is calling objects with right arguments and saves info correctly while running", function () {

            beforeEach(function (){
                discoveryService = new DiscoveryService(
                    testRootPath,
                    mockConnectionManager
                );
            });

            it("discoverRoot", function(){

                spyOn(mockConnectionManager, 'request').andCallThrough();

                discoveryService._discoverRoot(
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
                discoveryService._discoverRoot(
                    testRootPath,
                    mockCallback
                );

                expect(mockConnectionManager.request).not.toHaveBeenCalled();

                expect(mockCallback).toHaveBeenCalled();
                expect(mockCallback.mostRecentCall.args[0]).toEqual(false); //errors
                expect(mockCallback.mostRecentCall.args[1]).toEqual(true); //response

            });

            it("copyToCache", function(){

                discoveryService._copyToCache({"trash": testTrashObject});

                expect(discoveryService.cacheObject["trash"]).toEqual(testTrashObject);
            });

            it("copyToCache with faulty object", function(){

                discoveryService._copyToCache({"trash": null});

                expect(discoveryService.cacheObject["trash"]).toBeUndefined();
            });




            it("getObjectFromCache", function(){

                spyOn(discoveryService, '_discoverRoot').andCallThrough();

                discoveryService._getObjectFromCache(
                    "trash",
                    mockCallback
                );

                expect(discoveryService._discoverRoot).toHaveBeenCalled();
                expect(mockCallback).toHaveBeenCalled();
                expect(mockCallback.mostRecentCall.args[0]).toEqual(false); //error
                expect(mockCallback.mostRecentCall.args[1]).toEqual(testTrashObject); //response
            });

            it("getObjectFromCache when object is cached but not in Root ", function(){

                spyOn(discoveryService, '_discoverRoot').andCallThrough();

                discoveryService.cacheObject.trashNotInRoot = testTrashObject;

                discoveryService._getObjectFromCache(
                    "trashNotInRoot",
                    mockCallback
                );

                expect(discoveryService._discoverRoot).toHaveBeenCalled();
                expect(mockCallback).toHaveBeenCalled();
                expect(mockCallback.mostRecentCall.args[0]).toEqual(false); //error
                expect(mockCallback.mostRecentCall.args[1]).toEqual(testTrashObject); //response
            });

            it("getUrl", function(){

                spyOn(discoveryService, '_getObjectFromCache').andCallThrough();

                discoveryService.getUrl(
                    "trash",
                    mockCallback
                );

                expect(discoveryService._getObjectFromCache).toHaveBeenCalled();
                expect(mockCallback).toHaveBeenCalled();
                expect(mockCallback.mostRecentCall.args[0]).toEqual(false); //error
                expect(mockCallback.mostRecentCall.args[1]).toEqual(testTrashObject._href); //response
            });

            it("getMediaType", function(){

                spyOn(discoveryService, '_getObjectFromCache').andCallThrough();

                discoveryService.getMediaType(
                    "trash",
                    mockCallback
                );

                expect(discoveryService._getObjectFromCache).toHaveBeenCalled();
                expect(mockCallback).toHaveBeenCalled();
                expect(mockCallback.mostRecentCall.args[0]).toEqual(false); //error
                expect(mockCallback.mostRecentCall.args[1]).toEqual(testTrashObject["_media-type"]); //response
            });

            it("getInfoObject", function(){

                spyOn(discoveryService, '_getObjectFromCache').andCallThrough();

                discoveryService.getInfoObject(
                    "trash",
                    mockCallback
                );

                expect(discoveryService._getObjectFromCache).toHaveBeenCalled();
                expect(mockCallback).toHaveBeenCalled();
                expect(mockCallback.mostRecentCall.args[0]).toEqual(false); //error
                expect(mockCallback.mostRecentCall.args[1]).toEqual(testTrashObject); //response
            });

        });

    // ******************************
    // Cases with errors
    // ******************************
        describe("is returning errors correctly, while", function (){

            it("running discoverRoot call, and Connection Manager fails to connect", function(){

                mockFaultyConnectionManager = {
                    request : function(method, url, body, headers, callback){
                        callback(new CAPIError(""), false);
                    }
                };
                spyOn(mockFaultyConnectionManager, 'request').andCallThrough();

                discoveryService = new DiscoveryService(
                    testRootPath,
                    mockFaultyConnectionManager
                );

                discoveryService._discoverRoot(
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
                expect(mockCallback.mostRecentCall.args[1]).toEqual(false); //response

            });

            it("running getObjectFromCache call, and Connection Manager fails to connect", function(){

                mockFaultyConnectionManager = {
                    request : function(method, url, body, headers, callback){
                        callback(new CAPIError(""), false);
                    }
                };
                spyOn(mockFaultyConnectionManager, 'request').andCallThrough();

                discoveryService = new DiscoveryService(
                    testRootPath,
                    mockFaultyConnectionManager
                );

                discoveryService._getObjectFromCache(
                    "somename",
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
                expect(mockCallback.mostRecentCall.args[1]).toEqual(false); //response
            });

            describe("trying to access non-existent object (sorry no magic in stock today, only trash :)", function () {

                beforeEach(function (){
                    discoveryService = new DiscoveryService(
                        testRootPath,
                        mockConnectionManager
                    );
                });

                it("getObjectFromCache", function(){

                    spyOn(discoveryService, '_discoverRoot').andCallThrough();

                    discoveryService._getObjectFromCache(
                        "magic",
                        mockCallback
                    );

                    expect(discoveryService._discoverRoot).toHaveBeenCalled();
                    expect(mockCallback).toHaveBeenCalled();
                    expect(mockCallback.mostRecentCall.args[0]).toEqual(jasmine.any(CAPIError)); //error
                    expect(mockCallback.mostRecentCall.args[1]).toEqual(false); //response
                });

                it("getUrl", function(){

                    spyOn(discoveryService, '_getObjectFromCache').andCallThrough();

                    discoveryService.getUrl(
                        "magic",
                        mockCallback
                    );

                    expect(discoveryService._getObjectFromCache).toHaveBeenCalled();
                    expect(mockCallback).toHaveBeenCalled();
                    expect(mockCallback.mostRecentCall.args[0]).toEqual(jasmine.any(CAPIError)); //error
                    expect(mockCallback.mostRecentCall.args[1]).toEqual(false); //response
                });

                it("getMediaType", function(){

                    spyOn(discoveryService, '_getObjectFromCache').andCallThrough();

                    discoveryService.getMediaType(
                        "magic",
                        mockCallback
                    );

                    expect(discoveryService._getObjectFromCache).toHaveBeenCalled();
                    expect(mockCallback).toHaveBeenCalled();
                    expect(mockCallback.mostRecentCall.args[0]).toEqual(jasmine.any(CAPIError)); //error
                    expect(mockCallback.mostRecentCall.args[1]).toEqual(false); //response
                });

                it("getInfoObject", function(){

                    spyOn(discoveryService, '_getObjectFromCache').andCallThrough();

                    discoveryService.getInfoObject(
                        "magic",
                        mockCallback
                    );

                    expect(discoveryService._getObjectFromCache).toHaveBeenCalled();
                    expect(mockCallback).toHaveBeenCalled();
                    expect(mockCallback.mostRecentCall.args[0]).toEqual(jasmine.any(CAPIError)); //error
                    expect(mockCallback.mostRecentCall.args[1]).toEqual(false); //response
                });
            });

        });
    });

});