describe("Session Authorization Agent", function () {

    var sessions = "/api/ezp/v2/user/sessions",
        testLogin = "login",
        testPassword = "password",
        testSessionId = "/api/ezp/v2/user/sessions/o7i8r1sapfc9r84ae53bgq8gp4",
        testSessionName = "EZSESSID",
        testCsrfToken = "o7i8r1sapfc9r84ae53bgq8gp4",
        mockCAPI,
        mockUserService,
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

    });

    it("is running constructor correctly", function(){

        sessionAuthAgent = new SessionAuthAgent({
            login : testLogin,
            password : testPassword
        });

        expect(sessionAuthAgent).toBeDefined();
        expect(sessionAuthAgent._login).toEqual(testLogin);
        expect(sessionAuthAgent._password).toEqual(testPassword);
    });

    describe("is correctly performing calls:", function(){

        beforeEach(function (){

            sessionAuthAgent = new SessionAuthAgent({
                login : testLogin,
                password : testPassword
            });
            sessionAuthAgent.CAPI = mockCAPI;

            mockCallback = jasmine.createSpy('mockCallback');
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

            sessionAuthAgent.logOut(mockCallback);

            expect(mockCallback).toHaveBeenCalledWith(false, true);
        });

    });


});