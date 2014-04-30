/* global define, describe, it, expect, beforeEach, jasmine, spyOn */
define(function (require) {
    var DiscoveryService = require("services/DiscoveryService"),
        CAPIError = require("structures/CAPIError");

    describe("Discovery Service", function () {
        var mockCallback,
            discoveryService,
            testRootPath = "/api/ezp/v2/";

        beforeEach(function () {
            mockCallback = jasmine.createSpy('mockCallback');
        });

        describe("getInfoObject", function () {
            var mockConnectionManager,
                testTrashObject = {
                    "_media-type" : "application/vnd.ez.api.Trash+json",
                    "_href" : "/api/ezp/v2/content/trash"
                },
                testRootObject = {
                    "Root": {
                        "trash": testTrashObject
                    }
                };

            beforeEach(function () {
                mockConnectionManager = {
                    request : function (method, url, body, headers, callback) {
                        callback(false, {document: testRootObject});
                    }
                };

                discoveryService = new DiscoveryService(
                    testRootPath,
                    mockConnectionManager
                );
            });

            it("should retrieve the info by requesting the root", function () {
                spyOn(mockConnectionManager, "request").andCallThrough();
                discoveryService.getInfoObject("trash", mockCallback);

                expect(mockConnectionManager.request).toHaveBeenCalledWith(
                    "GET", testRootPath, "",
                    {'Accept': "application/vnd.ez.api.Root+json"},
                    jasmine.any(Function)
                );

                expect(mockCallback).toHaveBeenCalledWith(false, testTrashObject);
            });

            it("should request the root only once", function () {
                discoveryService.getInfoObject("trash", mockCallback);

                spyOn(mockConnectionManager, "request").andCallThrough();
                discoveryService.getInfoObject("trash", mockCallback);

                expect(mockCallback).toHaveBeenCalledWith(false, testTrashObject);
                expect(mockConnectionManager.request).not.toHaveBeenCalled();
            });


            it("should check if the value exists", function () {
                discoveryService.getInfoObject("doesnotexist", mockCallback);

                expect(mockCallback).toHaveBeenCalledWith(
                    jasmine.any(CAPIError), false
                );
            });
        });

        describe("getInfoObject error handling", function () {
            it("should handle root discovery error", function () {
                var errorResponse = {'status': 418},
                    mockFaultyConnectionManager;

                mockFaultyConnectionManager = {
                    request : function (method, url, body, headers, callback) {
                        callback(new CAPIError(""), errorResponse);
                    }
                };

                discoveryService = new DiscoveryService(
                    testRootPath,
                    mockFaultyConnectionManager
                );

                discoveryService.getInfoObject("somename", mockCallback);

                expect(mockCallback).toHaveBeenCalledWith(
                    jasmine.any(CAPIError),
                    errorResponse
                );
            });
        });
    });
});
