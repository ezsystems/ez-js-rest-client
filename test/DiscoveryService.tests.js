/* global define, describe, it, expect, beforeEach, jasmine, spyOn */
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

            beforeEach(function () {
                discoveryService = new DiscoveryService(
                    testRootPath,
                    mockConnectionManager
                );
            });

            it("getInfoObject", function () {
                discoveryService.getInfoObject(
                    "trash",
                    mockCallback
                );

                expect(mockCallback).toHaveBeenCalledWith(false, testTrashObject);
            });

        });

    // ******************************
    // Cases with errors
    // ******************************
        describe("is returning errors correctly, while", function () {
            var errorResponse = {'status': 418};

            it("running getInfoObject call and Connection Manager fails to connect", function () {

                mockFaultyConnectionManager = {
                    request : function (method, url, body, headers, callback) {
                        callback(new CAPIError(""), errorResponse);
                    }
                };
                spyOn(mockFaultyConnectionManager, 'request').andCallThrough();

                discoveryService = new DiscoveryService(
                    testRootPath,
                    mockFaultyConnectionManager
                );

                discoveryService.getInfoObject(
                    "somename",
                    mockCallback
                );

                expect(mockFaultyConnectionManager.request).toHaveBeenCalledWith(
                    "GET", testRootPath, "",
                    {'Accept': "application/vnd.ez.api.Root+json"},
                    jasmine.any(Function)
                );

                expect(mockCallback).toHaveBeenCalledWith(
                    jasmine.any(CAPIError),
                    errorResponse
                );
            });

            describe("trying to access non-existent object (sorry no magic in stock today, only trash :)", function () {

                beforeEach(function () {
                    discoveryService = new DiscoveryService(
                        testRootPath,
                        mockConnectionManager
                    );
                });

                it("getInfoObject", function () {
                    discoveryService.getInfoObject(
                        "magic",
                        mockCallback
                    );

                    expect(mockCallback).toHaveBeenCalledWith(
                        jasmine.any(CAPIError), false
                    );
                });
            });
        });
    });
});
