/* global define, describe, it, expect, beforeEach, jasmine, spyOn */
define(["authAgents/SessionAuthAgent", "structures/CAPIError"], function (SessionAuthAgent, CAPIError) {
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
            mockStorage,
            mockStorageData,
            sessionAuthAgent;

        // Mocked storage injected into the authagent for testing
        mockStorage = {
            getItem: function(key) {
                return (mockStorageData[key] !== undefined) ? JSON.parse(mockStorageData[key]) : null;
            },
            setItem: function(key, value) {
                mockStorageData[key] = JSON.stringify(value);
            },
            removeItem: function(key) {
                if (mockStorageData[key] !== undefined) {
                    delete mockStorageData[key];
                }
            }
        };

        beforeEach(function (){
            mockStorageData = {};

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
                }, mockStorage);
                sessionAuthAgent.setCAPI(mockCAPI);
            });

            it("ensureAuthentication", function(){

                sessionAuthAgent.ensureAuthentication(mockCallback);

                expect(mockUserService.newSessionCreateStruct).toHaveBeenCalled();
                expect(mockUserService.createSession).toHaveBeenCalledWith(
                    jasmine.any(Object),
                    jasmine.any(Function)
                );

                expect(mockStorage.getItem(SessionAuthAgent.KEY_SESSION_NAME)).toEqual(testSessionName);
                expect(mockStorage.getItem(SessionAuthAgent.KEY_SESSION_ID)).toEqual(testSessionId);
                expect(mockStorage.getItem(SessionAuthAgent.KEY_CSRF_TOKEN)).toEqual(testCsrfToken);

                expect(mockCallback).toHaveBeenCalledWith(false, true);
            });

            it("ensureAuthentication when already authenticated", function(){
                mockStorage.setItem(
                    SessionAuthAgent.KEY_SESSION_ID,
                    "i-am-a-real-session-id-no-doubt-about-that"
                );

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

                mockStorage.setItem(SessionAuthAgent.KEY_CSRF_TOKEN, testCsrfToken);

                sessionAuthAgent.authenticateRequest(mockRequest, mockCallback);

                expect(mockCallback).toHaveBeenCalledWith(false, mockRequest);
                expect(mockRequest.headers["X-CSRF-Token"]).toEqual(testCsrfToken);
            });

            it("logOut", function(){

                mockStorage.setItem(SessionAuthAgent.KEY_SESSION_ID, testSessionId);

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
                }, mockStorage);
                sessionAuthAgent.setCAPI(mockFaultyCAPI);
            });

            it("ensureAuthentication", function(){

                sessionAuthAgent.ensureAuthentication(mockCallback);

                expect(mockCallback).toHaveBeenCalled();
                expect(mockCallback.mostRecentCall.args[0]).toEqual(jasmine.any(CAPIError)); //error
                expect(mockCallback.mostRecentCall.args[1]).toEqual(false); //response
            });

            it("logOut", function(){

                mockStorage.setItem(SessionAuthAgent.KEY_SESSION_ID, testSessionId);
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