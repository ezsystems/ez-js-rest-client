/* global define, describe, it, expect, beforeEach, runs, waitsFor */
define(function (require) {

    var PromiseService = require("services/PromiseService");

    describe("PromiseService", function () {

        var promiseService,
            mockService,
            promise,
            testRootPath = '/testrootpath/';


        beforeEach(function () {
            mockService = {};

            // mock call
            mockService.loadRoot = function loadRoot(rootPath, callback) {
                callback(false, true);
            };
            // structure constructor (should be ignored)
            mockService.newContentUpdateStruct = function newContentUpdateStruct() {};

            promiseService = new PromiseService(mockService);
        });

        it("is running constructor correctly (auto-generating promise-based calls and ignoring structure constructors)", function () {
            expect(promiseService).toBeDefined();
            expect(promiseService.loadRoot).toBeDefined();
            expect(promiseService.newContentUpdateStruct).not.toBeDefined();
        });

        it("is running generated promise-based calls correctly when promise is fulfilled", function () {
            var success = false,
                errorReason = false;
            promise = promiseService.loadRoot(testRootPath);

            expect(promise).toBeDefined();
            expect(promise.then).toBeDefined();

            runs(function() {
                promise.then(
                    function (result) {
                        success = result;
                    },
                    function (error) {
                        errorReason = error;
                    }
                );
            });

            waitsFor(function() {
                return success;
            }, "Waiting for promise to be fulfilled", 1000);

            runs(function() {
                expect(success).toBeTruthy();
                expect(errorReason).toBeFalsy();
            });

        });

        // *****************
        // Cases with errors
        it("is throwing exception when supplied number of arguments is incorrect", function () {
            expect(function () {promiseService.loadRoot();}).toThrow();
        });

        it("is running generated promise-based calls correctly when promise is rejected", function () {
            var success = false,
                errorReason = false;

            mockService = {};
            // mock call
            mockService.loadRoot = function loadRoot(rootPath, callback) {
                // callback is returning true for error
                callback(true, false);
            };

            promiseService = new PromiseService(mockService);
            promise = promiseService.loadRoot(testRootPath);

            runs(function() {
                promise.then(
                    function (result) {
                        success = result;
                    },
                    function (error) {
                        errorReason = error;
                    }
                );
            });

            waitsFor(function() {
                return errorReason;
            }, "Waiting for promise to be rejected", 1000);

            runs(function() {
                expect(errorReason).toBeTruthy();
                expect(success).toBeFalsy();
            });

        });

    });

});