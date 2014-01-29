/* global define, describe, it, expect, beforeEach, jasmine, spyOn */
define(function (require) {

    // Declaring dependencies
    var SessionAuthAgent = require("authAgents/SessionAuthAgent"),
        CAPIError = require("structures/CAPIError"),
        sessionStorage = {
            getItem: function(identifier){
                return null;
            },
            setItem: function(identifier){
                return;
            },
            removeItem: function(identifier){
                return;
            }
        };

    describe("Session Authorization Agent", function () {

        var testLogin = "login",
            testPassword = "password",
            testSessionId = "/api/ezp/v2/user/sessions/o7i8r1sapfc9r84ae53bgq8gp4",
            testSessionName = "EZSESSID",
            testCsrfToken = "o7i8r1sapfc9r84ae53bgq8gp4",
            mockCAPI,
            mockFaultyCAPI,
            mockUserService,
            mockFaultyUserService,
            mockCallback,
            mockSessionResponse,
            mockRequest,
            sessionAuthAgent;

        beforeEach(function (){

            spyOn(sessionStorage, 'getItem').andCallThrough();
            spyOn(sessionStorage, 'setItem').andCallThrough();
            spyOn(sessionStorage, 'removeItem').andCallThrough();

            mockUserService = {
                newSessionCreateStruct: function(login, password){
                    return {
                        body: {
                            SessionInput: {
                                login: login,
                                password: password
                            }
                        }
                    };
                },
                createSession: function(sessionCreateStruct, callback){
                    mockSessionResponse = {};
                    mockSessionResponse.body = JSON.stringify({
                        "Session" : {
                            "_href" : testSessionId,
                            "name" : testSessionName,
                            "csrfToken" : "o7i8r1sapfc9r84ae53bgq8gp4"
                        }
                    });

                    callback(
                        false,
                        mockSessionResponse
                    );
                },
                deleteSession: function(sessionId, callback){
                    callback(
                        false,
                        true
                    );
                }
            };
            spyOn(mockUserService, 'newSessionCreateStruct').andCallThrough();
            spyOn(mockUserService, 'createSession').andCallThrough();
            spyOn(mockUserService, 'deleteSession').andCallThrough();

            mockCAPI = {
                getUserService: function(){
                    return mockUserService;
                }
            };

            mockCallback = jasmine.createSpy('mockCallback');
        });

        describe("is correctly performing", function(){

            beforeEach(function (){

                sessionAuthAgent = new SessionAuthAgent({
                    login : testLogin,
                    password : testPassword
                });
                sessionAuthAgent.setCAPI(mockCAPI);

            });

            it("ensureAuthentication", function(){

                sessionAuthAgent.ensureAuthentication(mockCallback);

                expect(mockUserService.newSessionCreateStruct).toHaveBeenCalled();
                expect(mockUserService.createSession).toHaveBeenCalledWith(
                    jasmine.any(Object),
                    jasmine.any(Function)
                );

                expect(sessionAuthAgent.sessionName).toEqual(testSessionName);
                expect(sessionAuthAgent.csrfToken).toEqual(testCsrfToken);
                expect(sessionAuthAgent.sessionId).toEqual(testSessionId);

                expect(mockCallback).toHaveBeenCalledWith(false, true);
            });

            it("ensureAuthentication when already authenticated (sessionStorage is storing sessionId)", function(){

                sessionStorage.getItem = function(identifier){
                    return "i-am-a-real-session-id-no-doubt-about-that";
                };

                sessionAuthAgent = new SessionAuthAgent({
                    login : testLogin,
                    password : testPassword
                });
                sessionAuthAgent.setCAPI(mockCAPI);

                sessionAuthAgent.ensureAuthentication(mockCallback);

                expect(mockUserService.createSession).not.toHaveBeenCalled();
                expect(mockCallback).toHaveBeenCalledWith(false, true);

            });

            it("authenticateRequest for a request using safe ('GET') method", function(){

                mockRequest = {
                    headers : {},
                    method : "GET"
                };

                sessionAuthAgent.authenticateRequest(mockRequest, mockCallback);

                expect(mockCallback).toHaveBeenCalledWith(false, mockRequest);
                expect(mockRequest.headers["X-CSRF-Token"]).not.toBeDefined();
            });

            it("authenticateRequest for a request using safe ('HEAD') method", function(){

                mockRequest = {
                    headers : {},
                    method : "HEAD"
                };

                sessionAuthAgent.authenticateRequest(mockRequest, mockCallback);

                expect(mockCallback).toHaveBeenCalledWith(false, mockRequest);
                expect(mockRequest.headers["X-CSRF-Token"]).not.toBeDefined();
            });

            it("authenticateRequest for a request using safe ('OPTIONS') method", function(){

                mockRequest = {
                    headers : {},
                    method : "OPTIONS"
                };

                sessionAuthAgent.authenticateRequest(mockRequest, mockCallback);

                expect(mockCallback).toHaveBeenCalledWith(false, mockRequest);
                expect(mockRequest.headers["X-CSRF-Token"]).not.toBeDefined();
            });

            it("authenticateRequest for a request using safe ('TRACE') method", function(){

                mockRequest = {
                    headers : {},
                    method : "TRACE"
                };

                sessionAuthAgent.authenticateRequest(mockRequest, mockCallback);

                expect(mockCallback).toHaveBeenCalledWith(false, mockRequest);
                expect(mockRequest.headers["X-CSRF-Token"]).not.toBeDefined();
            });

            it("authenticateRequest for a request using non-safe ('POST') method", function(){

                mockRequest = {
                    headers : {},
                    method : "POST"
                };

                sessionAuthAgent.csrfToken = testCsrfToken;

                sessionAuthAgent.authenticateRequest(mockRequest, mockCallback);

                expect(mockCallback).toHaveBeenCalledWith(false, mockRequest);
                expect(mockRequest.headers["X-CSRF-Token"]).toEqual(testCsrfToken);
            });

            it("logOut", function(){

                sessionAuthAgent.sessionId = testSessionId;
                sessionAuthAgent.logOut(mockCallback);

                expect(mockUserService.deleteSession).toHaveBeenCalledWith(
                    testSessionId,
                    jasmine.any(Function)
                );

                expect(mockCallback).toHaveBeenCalledWith(false, true);
            });

            it("setCAPI", function () {
                var anotherCAPI = {};
                sessionAuthAgent.setCAPI(anotherCAPI);

                expect(sessionAuthAgent._CAPI).toBe(anotherCAPI);
            });


        });

        describe("is returning errors correctly, when user service fails, while performing", function(){

            beforeEach(function (){
                mockFaultyUserService = {
                    deleteSession: function(sessionId, callback){
                        callback(
                            true,
                            false
                        );
                    },
                    createSession: function(sessionCreateStruct, callback){
                        callback(
                            true,
                            false
                        );
                    },
                    newSessionCreateStruct: function(login, password){
                        return {
                            body: {
                                SessionInput: {
                                    login: login,
                                    password: password
                                }
                            }
                        };
                    }
                };
                spyOn(mockFaultyUserService, 'deleteSession').andCallThrough();
                spyOn(mockFaultyUserService, 'createSession').andCallThrough();
                spyOn(mockFaultyUserService, 'newSessionCreateStruct').andCallThrough();

                mockFaultyCAPI = {
                    getUserService: function(){
                        return mockFaultyUserService;
                    }
                };

                sessionAuthAgent = new SessionAuthAgent({
                    login : testLogin,
                    password : testPassword
                });
                sessionAuthAgent.setCAPI(mockFaultyCAPI);

            });

            it("ensureAuthentication", function(){

                sessionAuthAgent.ensureAuthentication(mockCallback);

                expect(mockCallback).toHaveBeenCalled();
                expect(mockCallback.mostRecentCall.args[0]).toEqual(jasmine.any(CAPIError)); //error
                expect(mockCallback.mostRecentCall.args[1]).toEqual(false); //response
            });

            it("logOut", function(){

                sessionAuthAgent.sessionId = testSessionId;
                sessionAuthAgent.logOut(mockCallback);

                expect(mockFaultyUserService.deleteSession).toHaveBeenCalledWith(
                    testSessionId,
                    jasmine.any(Function)
                );

                expect(mockCallback).toHaveBeenCalledWith(true, false);
            });

        });
    });

});