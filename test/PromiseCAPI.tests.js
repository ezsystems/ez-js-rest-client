/* global define, describe, it, expect, beforeEach */
define(function (require) {

    var PromiseCAPI = require("PromiseCAPI"),
        PromiseService = require("services/PromiseService");

    describe("PromiseCAPI", function () {

        var promiseCAPI,
            mockCAPI,
            promiseContentService,
            anotherPromiseContentService;

        beforeEach(function () {
            mockCAPI = {};

            // mock service retrieval
            mockCAPI.getContentService = function getContentService() {};
            // something which is not a service
            mockCAPI.somethingElse = function somethingElse() {};
            mockCAPI.andSomethingElse = "dummy string parameter";

            promiseCAPI = new PromiseCAPI(mockCAPI);
        });

        it("is running constructor correctly (auto-generating promise-based services based on every existing CAPI service)", function () {
            expect(promiseCAPI).toBeDefined();
            expect(promiseCAPI.getContentService).toBeDefined();
            expect(promiseCAPI.somethingElse).not.toBeDefined();
            expect(promiseCAPI.andSomethingElse).not.toBeDefined();
        });

        it("is calling generated promise versions of services correctly (and they are singletons)", function () {
            promiseContentService = promiseCAPI.getContentService();
            anotherPromiseContentService = promiseCAPI.getContentService();

            expect(promiseContentService).toBeDefined();
            expect(anotherPromiseContentService).toBeDefined();
            expect(promiseContentService instanceof PromiseService).toBeTruthy();
            expect(anotherPromiseContentService).toBe(promiseContentService);
        });

    });

});