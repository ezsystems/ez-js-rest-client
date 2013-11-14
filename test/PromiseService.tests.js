/* global define, describe, it, expect, beforeEach, runs, waitsFor */
define(function (require) {

    var PromiseService = require("services/PromiseService");

    describe("PromiseService", function () {

        var promiseService,
            mockService,
            promise,
            testRootPath = '/testrootpath/',
            promiseSuccess = false,
            promiseError = false,
            handlePromise = function (promise) {
                runs(function() {
                    promise.then(
                        function (result) {
                            promiseSuccess = result;
                        },
                        function (error) {
                            promiseError = error;
                        }
                    );
                });
            };


        beforeEach(function () {
            mockService = {};

            // mock call
            mockService.loadRoot = function loadRoot(rootPath, callback) {
                callback(false, true);
            };
            // structure constructor (should be ignored)
            mockService.newContentUpdateStruct = function newContentUpdateStruct() {};

            promiseService = new PromiseService(mockService);

            promiseSuccess = false;
            promiseError = false;
        });

        it("is running constructor correctly (auto-generating promise-based calls and ignoring structure constructors)", function () {
            expect(promiseService).toBeDefined();
            expect(promiseService.loadRoot).toBeDefined();
            expect(promiseService.newContentUpdateStruct).not.toBeDefined();
        });

        it("is running generated promise-based calls correctly when promise is fulfilled", function () {
            promise = promiseService.loadRoot(testRootPath);

            expect(promise).toBeDefined();
            expect(promise.then).toBeDefined();

            handlePromise(promise);

            waitsFor(function() {
                return promiseSuccess;
            }, "Waiting for promise to be fulfilled", 100);

            runs(function() {
                expect(promiseSuccess).toBeTruthy();
                expect(promiseError).toBeFalsy();
            });

        });

        // *****************
        // Cases with errors
        it("is throwing exception when supplied number of arguments is incorrect", function () {
            expect(function () {promiseService.loadRoot();}).toThrow();
        });

        it("is running generated promise-based calls correctly when promise is rejected", function () {
            mockService = {};
            // mock call
            mockService.loadRoot = function loadRoot(rootPath, callback) {
                // callback is returning error
                callback(new Error("Test Error"), false);
            };

            promiseService = new PromiseService(mockService);
            promise = promiseService.loadRoot(testRootPath);

            handlePromise(promise);

            waitsFor(function() {
                return promiseError;
            }, "Waiting for promise to be rejected", 1000);

            runs(function() {
                expect(promiseSuccess).toBeFalsy();
                expect(promiseError).toBeTruthy();
            });

        });

    });

});