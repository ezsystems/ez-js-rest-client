/* global define, describe, it, expect, beforeEach, jasmine, spyOn */
define(function (require) {

    // Declaring dependencies
    var HttpBasicAuthAgent = require("authAgents/HttpBasicAuthAgent"),
        CAPIError = require("structures/CAPIError");

    describe("Http Basic Authorization Agent", function () {
        var testLogin = "login",
            testPassword = "password",
            mockCallback,
            httpBasicAuthAgent;

        beforeEach(function () {
            mockCallback = jasmine.createSpy('mockCallback');
        });

        describe("ensureAuthentication", function () {
            beforeEach(function () {
                httpBasicAuthAgent = new HttpBasicAuthAgent();
            });

            it("should call the callback without doing anything", function () {
                httpBasicAuthAgent.ensureAuthentication(mockCallback);
                expect(mockCallback).toHaveBeenCalledWith(false, true);
            });
        });

        describe("authenticateRequest", function () {
            beforeEach(function () {
                httpBasicAuthAgent = new HttpBasicAuthAgent({
                    login: testLogin,
                    password: testPassword,
                });
            });

            it("should change the request to use basic auth", function () {
                var request = {};

                httpBasicAuthAgent.authenticateRequest(request, mockCallback);

                expect(mockCallback).toHaveBeenCalledWith(false, request);
                expect(request.httpBasicAuth).toEqual(true);
                expect(request.login).toEqual(testLogin);
                expect(request.password).toEqual(testPassword);
            });
        });

        describe("setCredentials", function () {
            beforeEach(function () {
                httpBasicAuthAgent = new HttpBasicAuthAgent();
            });

            it("should set the credentials", function () {
                var request = {}, cb = function () {};

                httpBasicAuthAgent.setCredentials({
                    login: testLogin,
                    password: testPassword
                });
                httpBasicAuthAgent.authenticateRequest(request, cb);

                expect(request.login).toEqual(testLogin);
                expect(request.password).toEqual(testPassword);
            });
        });

        describe("isLoggedIn", function () {
            var contentService,
                capi = {
                    getContentService: function () {
                        return contentService;
                    }
                };

            beforeEach(function () {
                httpBasicAuthAgent = new HttpBasicAuthAgent();
                httpBasicAuthAgent.setCAPI(capi);
            });

            it("should check the credentials", function () {
                spyOn(capi, "getContentService");
                httpBasicAuthAgent.isLoggedIn(mockCallback);

                expect(mockCallback).toHaveBeenCalledWith(true, false);
                expect(capi.getContentService).not.toHaveBeenCalled();
            });

            it("should check the credentials (no password)", function () {
                spyOn(capi, "getContentService");
                httpBasicAuthAgent.isLoggedIn(mockCallback);
                httpBasicAuthAgent.setCredentials({
                    login: testLogin,
                    password: ""
                });

                expect(mockCallback).toHaveBeenCalledWith(true, false);
                expect(capi.getContentService).not.toHaveBeenCalled();
            });

            it("should try to load the root resource", function () {
                var rootResponse = {},
                    error = false;

                contentService = {
                    loadRoot: function (cb) {
                        cb(error, rootResponse);
                    }
                };

                httpBasicAuthAgent.setCredentials({
                    login: testLogin,
                    password: testPassword
                });
                httpBasicAuthAgent.isLoggedIn(mockCallback);

                expect(mockCallback).toHaveBeenCalledWith(error, rootResponse);
            });

            it("should handle error while loading the root resource", function () {
                var rootResponse = false,
                    error = new CAPIError();

                contentService = {
                    loadRoot: function (cb) {
                        cb(error, rootResponse);
                    }
                };

                httpBasicAuthAgent.setCredentials({
                    login: testLogin,
                    password: testPassword
                });
                httpBasicAuthAgent.isLoggedIn(mockCallback);

                expect(mockCallback).toHaveBeenCalledWith(error, rootResponse);
            });
        });

        describe("logIn", function () {
            beforeEach(function () {
                httpBasicAuthAgent = new HttpBasicAuthAgent();
            });

            it("should call isLoggedIn", function () {
                var cb = function () { };

                spyOn(httpBasicAuthAgent, "isLoggedIn");

                httpBasicAuthAgent.logIn(cb);
                expect(httpBasicAuthAgent.isLoggedIn).toHaveBeenCalledWith(cb);
            });
        });

        describe("logOut", function () {
            beforeEach(function () {
                httpBasicAuthAgent = new HttpBasicAuthAgent();
            });

            it("should do nothing", function () {
                httpBasicAuthAgent.logOut(mockCallback);
                expect(mockCallback).toHaveBeenCalledWith(false, true);
            });
        });

        describe("logIn", function () {
            beforeEach(function () {
                httpBasicAuthAgent = new HttpBasicAuthAgent();
            });

            it("should call isLoggedIn", function () {
                var cb = function () { };

                spyOn(httpBasicAuthAgent, "isLoggedIn");

                httpBasicAuthAgent.logIn(cb);
                expect(httpBasicAuthAgent.isLoggedIn).toHaveBeenCalledWith(cb);
            });
        });

        describe("logOut", function () {
            beforeEach(function () {
                httpBasicAuthAgent = new HttpBasicAuthAgent();
            });

            it("should do nothing", function () {
                httpBasicAuthAgent.logOut(mockCallback);
                expect(mockCallback).toHaveBeenCalledWith(false, true);
            });
        });
    });
});
