describe("Session Authorization Agent", function () {

    var sessions = "/api/ezp/v2/user/sessions",
        testLogin = "login",
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
        sessionStorage = jasmine.createSpyObj('sessionStorage',['getItem','setItem','removeItem']);

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
            createSession: function(sessions, sessionCreateStruct, callback){
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
                )
            },
            deleteSession: function(sessionId, callback){
                callback(
                    false,
                    true
                )
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

    describe("is correctly performing calls:", function(){

        beforeEach(function (){

            sessionAuthAgent = new SessionAuthAgent({
                login : testLogin,
                password : testPassword
            });
            sessionAuthAgent.CAPI = mockCAPI;

        });

        it("ensureAuthentication", function(){

            sessionAuthAgent.ensureAuthentication(mockCallback);

            expect(mockUserService.newSessionCreateStruct).toHaveBeenCalled();
            expect(mockUserService.createSession).toHaveBeenCalledWith(
                sessions,
                jasmine.any(Object),
                jasmine.any(Function)
            );

            expect(sessionAuthAgent.sessionName).toEqual(testSessionName);
            expect(sessionAuthAgent.csrfToken).toEqual(testCsrfToken);
            expect(sessionAuthAgent.sessionId).toEqual(testSessionId);

            expect(mockCallback).toHaveBeenCalledWith(false, true);
        });

        it("ensureAuthentication when session is already created", function(){

            sessionAuthAgent.sessionId = testSessionId;

            sessionAuthAgent.ensureAuthentication(mockCallback);

            expect(mockUserService.createSession).not.toHaveBeenCalled();
            expect(mockCallback).toHaveBeenCalledWith(false, true);

        });

        it("authenticateRequest", function(){

            mockRequest = {
                headers : {}
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
    });

    describe("is returning errors correctly, when user service fails, while performing:", function(){

        beforeEach(function (){
            mockFaultyUserService = {
                deleteSession: function(sessionId, callback){
                    callback(
                        true,
                        false
                    )
                },
                createSession: function(sessions, sessionCreateStruct, callback){
                    callback(
                        true,
                        false
                    )
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
            sessionAuthAgent.CAPI = mockFaultyCAPI;

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