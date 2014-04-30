/* global define, describe, it, expect, beforeEach, jasmine, spyOn */
define(["authAgents/SessionAuthAgent", "structures/CAPIError"], function (SessionAuthAgent, CAPIError) {
    describe("Session Authorization Agent", function () {

        var testLogin = "login",
            testPassword = "password",
            testSessionHref = "/api/ezp/v2/user/sessions/o7i8r1sapfc9r84ae53bgq8gp4",
            testSessionId = "o7i8r1sapfc9r84ae53bgq8gp4",
            testSessionName = "EZSESSID",
            testCsrfToken = "o7i8r1sapfc9r84ae53bgq8gp4",
            createSessionResponse = {
                "Session" : {
                    "_href" : testSessionHref,
                    "identifier": testSessionId,
                    "name" : testSessionName,
                    "csrfToken" : testCsrfToken,
                }
            },
            mockCAPI,
            mockUserService,
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
                    mockSessionResponse.document = createSessionResponse;
                    mockSessionResponse.body = JSON.stringify(createSessionResponse);

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
                getUserService: function (){
                    return mockUserService;
                }
            };

            mockCallback = jasmine.createSpy('mockCallback');
        });

        describe("Storage", function () {
            it("should create some sort of Storage if none is given", function () {
                var sessionAuthAgent = new SessionAuthAgent({
                    login: testLogin,
                    password: testPassword
                });

                // Evil hack to access private member, but this is the easiest way
                // to do this check here. Anything else would involve other units of code
                expect(sessionAuthAgent._storage).not.toBeUndefined();
                expect(sessionAuthAgent._storage).not.toBeNull();
                expect(sessionAuthAgent._storage.setItem).not.toBeUndefined();
            });
        });

        describe("logIn", function () {
            beforeEach(function () {
                sessionAuthAgent = new SessionAuthAgent({
                    login : testLogin,
                    password : testPassword
                }, mockStorage);
                sessionAuthAgent.setCAPI(mockCAPI);
            });

            it("should call logOut before doing the login", function () {
                var callback = function () {};

                mockStorage.setItem(SessionAuthAgent.KEY_SESSION_ID, testSessionId);
                spyOn(sessionAuthAgent, 'ensureAuthentication');
                spyOn(sessionAuthAgent, 'logOut').andCallFake(function (done) {
                    mockStorage.setItem(SessionAuthAgent.KEY_SESSION_ID, null);
                    done();
                });
                sessionAuthAgent.logIn(callback);

                expect(sessionAuthAgent.logOut).toHaveBeenCalled();
                expect(sessionAuthAgent.ensureAuthentication).toHaveBeenCalledWith(callback);
            });

            it("should directly call ensureAuthentication if there's no session", function () {
                var callback = function () {};

                spyOn(sessionAuthAgent, 'ensureAuthentication');
                sessionAuthAgent.logIn(callback);

                expect(sessionAuthAgent.ensureAuthentication).toHaveBeenCalledWith(callback);
            });
        });

        describe("isLoggedIn", function () {
            var userService,
                capi = {
                    getUserService: function () {
                        return userService;
                    }
                };

            beforeEach(function () {
                sessionAuthAgent = new SessionAuthAgent({
                    login : testLogin,
                    password : testPassword
                }, mockStorage);
                sessionAuthAgent.setCAPI(capi);
            });

            it("should check its internal storage first", function () {
                sessionAuthAgent.isLoggedIn(mockCallback);

                expect(mockCallback).toHaveBeenCalledWith(true, false);
            });

            it("should call userService.refreshSession", function () {
                var refreshResult = {},
                    callback = jasmine.createSpy('mockCallback');

                userService = {
                    refreshSession: function (id, callback) {
                        callback(false, refreshResult);
                    },
                };

                spyOn(userService, 'refreshSession').andCallThrough();
                mockStorage.setItem(SessionAuthAgent.KEY_SESSION_ID, testSessionId);

                sessionAuthAgent.isLoggedIn(callback);

                expect(userService.refreshSession).toHaveBeenCalledWith(testSessionId, jasmine.any(Function));
                expect(callback).toHaveBeenCalledWith(false, refreshResult);
            });

            it("should reset the storage if userService.refreshSession results in an error", function () {
                var callback = jasmine.createSpy('mockCallback');

                userService = {
                    refreshSession: function (id, callback) {
                        callback(true, false);
                    },
                };

                spyOn(userService, 'refreshSession').andCallThrough();
                mockStorage.setItem(SessionAuthAgent.KEY_SESSION_ID, testSessionId);

                sessionAuthAgent.isLoggedIn(callback);

                expect(userService.refreshSession).toHaveBeenCalledWith(testSessionId, jasmine.any(Function));
                expect(callback).toHaveBeenCalledWith(true, false);
                expect(mockStorage.getItem(SessionAuthAgent.KEY_SESSION_ID)).toBeNull();
            });
        });

        describe("setCredentials", function () {
            beforeEach(function () {
                sessionAuthAgent = new SessionAuthAgent(false, mockStorage);
                sessionAuthAgent.setCAPI(mockCAPI);
            });

            it("should set the credentials", function () {
                sessionAuthAgent.setCredentials({login: testLogin, password: testPassword});
                sessionAuthAgent.ensureAuthentication(function () {});

                expect(mockUserService.newSessionCreateStruct).toHaveBeenCalledWith(testLogin, testPassword);
            });
        });

        describe("ensureAuthentication", function () {
            beforeEach(function () {
                sessionAuthAgent = new SessionAuthAgent({
                    login : testLogin,
                    password : testPassword
                }, mockStorage);
                sessionAuthAgent.setCAPI(mockCAPI);
            });

            it("should create a new session and store it in its storage", function () {

                sessionAuthAgent.ensureAuthentication(mockCallback);

                expect(mockUserService.newSessionCreateStruct).toHaveBeenCalledWith(testLogin, testPassword);
                expect(mockUserService.createSession).toHaveBeenCalledWith(
                    jasmine.any(Object),
                    jasmine.any(Function)
                );

                expect(mockStorage.getItem(SessionAuthAgent.KEY_SESSION_NAME)).toEqual(testSessionName);
                expect(mockStorage.getItem(SessionAuthAgent.KEY_SESSION_ID)).toEqual(testSessionId);
                expect(mockStorage.getItem(SessionAuthAgent.KEY_SESSION_HREF)).toEqual(testSessionHref);
                expect(mockStorage.getItem(SessionAuthAgent.KEY_CSRF_TOKEN)).toEqual(testCsrfToken);

                expect(mockCallback).toHaveBeenCalledWith(false, mockSessionResponse);
            });

            it("should detect if the user is already logged in", function () {
                mockStorage.setItem(
                    SessionAuthAgent.KEY_SESSION_ID,
                    "i-am-a-real-session-id-no-doubt-about-that"
                );

                sessionAuthAgent.ensureAuthentication(mockCallback);

                expect(mockUserService.createSession).not.toHaveBeenCalled();
                expect(mockCallback).toHaveBeenCalledWith(false, true);
            });

            it("should provide the userService.createSession error", function () {
                var createSessionError = new CAPIError(),
                    capi = {
                        getUserService: function () {
                            return userService;
                        }
                    },
                    userService = {
                        createSession: function (struct, callback) {
                            callback(createSessionError, false);
                        },
                        newSessionCreateStruct: function () {
                            return {};
                        }
                    };

                spyOn(userService, 'createSession').andCallThrough();
                spyOn(userService, 'newSessionCreateStruct').andCallThrough();

                sessionAuthAgent.setCAPI(capi);
                sessionAuthAgent.ensureAuthentication(mockCallback);

                expect(mockCallback).toHaveBeenCalledWith(createSessionError, false);

            });
        });

        describe("authenticateRequest", function () {
            it("should keep a GET request intact", function () {
                mockRequest = {
                    headers : {},
                    method : "GET"
                };
                mockStorage.setItem(SessionAuthAgent.KEY_CSRF_TOKEN, testCsrfToken);

                sessionAuthAgent.authenticateRequest(mockRequest, mockCallback);

                expect(mockCallback).toHaveBeenCalledWith(false, mockRequest);
                expect(mockRequest.headers["X-CSRF-Token"]).not.toBeDefined();
            });

            it("should keep a HEAD request intact", function () {
                mockRequest = {
                    headers : {},
                    method : "HEAD"
                };
                mockStorage.setItem(SessionAuthAgent.KEY_CSRF_TOKEN, testCsrfToken);

                sessionAuthAgent.authenticateRequest(mockRequest, mockCallback);

                expect(mockCallback).toHaveBeenCalledWith(false, mockRequest);
                expect(mockRequest.headers["X-CSRF-Token"]).not.toBeDefined();
            });

            it("should keep a OPTIONS request intact", function () {
                mockRequest = {
                    headers : {},
                    method : "OPTIONS"
                };
                mockStorage.setItem(SessionAuthAgent.KEY_CSRF_TOKEN, testCsrfToken);

                sessionAuthAgent.authenticateRequest(mockRequest, mockCallback);

                expect(mockCallback).toHaveBeenCalledWith(false, mockRequest);
                expect(mockRequest.headers["X-CSRF-Token"]).not.toBeDefined();
            });

            it("should keep a TRACE request intact", function () {
                mockRequest = {
                    headers : {},
                    method : "TRACE"
                };
                mockStorage.setItem(SessionAuthAgent.KEY_CSRF_TOKEN, testCsrfToken);

                sessionAuthAgent.authenticateRequest(mockRequest, mockCallback);

                expect(mockCallback).toHaveBeenCalledWith(false, mockRequest);
                expect(mockRequest.headers["X-CSRF-Token"]).not.toBeDefined();
            });

            it("should add the CSRF header to a POST request", function (){
                mockRequest = {
                    headers : {},
                    method : "POST"
                };

                mockStorage.setItem(SessionAuthAgent.KEY_CSRF_TOKEN, testCsrfToken);

                sessionAuthAgent.authenticateRequest(mockRequest, mockCallback);

                expect(mockCallback).toHaveBeenCalledWith(false, mockRequest);
                expect(mockRequest.headers["X-CSRF-Token"]).toEqual(testCsrfToken);
            });
        });

        describe("logOut", function () {
            beforeEach(function () {
                sessionAuthAgent.setCAPI(mockCAPI);
            });

            it("should delete the session", function () {

                mockStorage.setItem(SessionAuthAgent.KEY_SESSION_HREF, testSessionHref);

                sessionAuthAgent.logOut(mockCallback);

                expect(mockUserService.deleteSession).toHaveBeenCalledWith(
                    testSessionHref,
                    jasmine.any(Function)
                );

                expect(mockCallback).toHaveBeenCalledWith(false, true);
                expect(mockStorage.getItem(SessionAuthAgent.KEY_SESSION_HREF)).toBeNull();
            });

            it("should handle the userService.deleteSession error", function () {
                var deleteSessionError = new CAPIError(),
                    capi = {
                        getUserService: function () {
                            return userService;
                        }
                    },
                    userService = {
                        deleteSession: function (href, callback) {
                            callback(deleteSessionError, false);
                        }
                    };

                spyOn(userService, 'deleteSession').andCallThrough();

                mockStorage.setItem(SessionAuthAgent.KEY_SESSION_HREF, testSessionHref);
                sessionAuthAgent.setCAPI(capi);
                sessionAuthAgent.logOut(mockCallback);

                expect(mockCallback).toHaveBeenCalledWith(deleteSessionError, false);
                expect(mockStorage.getItem(SessionAuthAgent.KEY_SESSION_HREF)).toBe(testSessionHref);
            });

            it("should not do anything if the session is not started", function () {
                sessionAuthAgent.logOut(mockCallback);

                expect(mockUserService.deleteSession).not.toHaveBeenCalled();
                expect(mockCallback).toHaveBeenCalledWith(false, true);
            });
        });

        describe("setCAPI", function () {
            it("should set the capi", function () {
                var anotherCAPI = {};
                sessionAuthAgent.setCAPI(anotherCAPI);

                expect(sessionAuthAgent._CAPI).toBe(anotherCAPI);
            });
        });
    });
});
