/* global define, describe, it, expect, beforeEach, jasmine, spyOn, eZ */
define(function (require) {

    var ConnectionManager = require("ConnectionManager"),
        Request = require("structures/Request"),
        CAPIError = require("structures/CAPIError");

    require("jasmineCAPIMatchers");

    describe("Connection Manager", function () {

        var mockAuthenticationAgent,
            mockFaultyAuthenticationAgent,
            mockConnectionFactory,
            mockConnection,
            mockCallback,
            connectionManager,

            endPointUrl = 'http://ez.git.local',
            rootId = '/api/ezp/v2/',
            testTrue = true,
            testFalse = false;

        beforeEach(function (){

            eZ.addJasmineCAPIMatchers.call(this);

            mockAuthenticationAgent = {
                ensureAuthentication : function(done){
                    done(false, true);
                },
                authenticateRequest : function(request, done){
                    done(false, request);
                },
                logOut : function(callback){
                    callback(false, true);
                }
            };
            spyOn(mockAuthenticationAgent, 'ensureAuthentication').andCallThrough();
            spyOn(mockAuthenticationAgent, 'authenticateRequest').andCallThrough();
            spyOn(mockAuthenticationAgent, 'logOut').andCallThrough();

            mockConnection = jasmine.createSpyObj('mockConnection', ['execute']);
            mockConnectionFactory = {
                createConnection : function (){
                    return mockConnection;
                }
            };
            spyOn(mockConnectionFactory, 'createConnection').andCallThrough();

            mockCallback = jasmine.createSpy('mockCallback');
        });



    // ******************************
    // Cases without errors
    // ******************************
        describe("is calling injected objects with right arguments while running:", function () {

            beforeEach(function (){
                connectionManager = new ConnectionManager(
                    endPointUrl,
                    mockAuthenticationAgent,
                    mockConnectionFactory
                );
            });

            it("request", function (){

                connectionManager.logRequests = testFalse;

                connectionManager.request(
                    "GET",
                    rootId,
                    "",
                    {},
                    mockCallback
                );

                expect(mockAuthenticationAgent.ensureAuthentication).toHaveBeenCalled();
                expect(mockAuthenticationAgent.authenticateRequest).toHaveBeenCalledWith(
                    jasmine.any(Request),
                    jasmine.any(Function)
                );

                expect(mockConnectionFactory.createConnection).toHaveBeenCalled();
                expect(mockConnection.execute).toHaveBeenCalledWith(
                    jasmine.any(Request),
                    mockCallback
                );

                expect(mockConnection.execute).toHaveBeenCalledWithObject({
                    method: "GET",
                    url: endPointUrl + rootId,
                    body: "",
                    headers: {}
                });
            });

            it("request (with calls logging and minimum arguments set)", function (){

                connectionManager.logRequests = testTrue;

                // Spy on console.dir AND stop it from really logging something
                spyOn(console, 'dir');

                connectionManager.request(
                    mockCallback
                );

                expect(mockAuthenticationAgent.ensureAuthentication).toHaveBeenCalled();
                expect(mockAuthenticationAgent.authenticateRequest).toHaveBeenCalledWith(
                    jasmine.any(Request),
                    jasmine.any(Function)
                );
                expect(mockConnection.execute).toHaveBeenCalledWith(
                    jasmine.any(Request),
                    mockCallback
                );
                expect(console.dir).toHaveBeenCalledWith(jasmine.any(Request));

                expect(mockConnection.execute).toHaveBeenCalledWithObject({
                    method: "GET",
                    url: endPointUrl + "/",
                    body: "",
                    headers: {}
                });
            });

            it("request (with 1 optional argument)", function (){

                connectionManager.request(
                    "GET",
                    mockCallback
                );

                expect(mockAuthenticationAgent.ensureAuthentication).toHaveBeenCalled();
                expect(mockAuthenticationAgent.authenticateRequest).toHaveBeenCalledWith(
                    jasmine.any(Request),
                    jasmine.any(Function)
                );
                expect(mockConnection.execute).toHaveBeenCalledWith(
                    jasmine.any(Request),
                    mockCallback
                );

                expect(mockConnection.execute).toHaveBeenCalledWithObject({
                    method: "GET",
                    url: endPointUrl + "/",
                    body: "",
                    headers: {}
                });
            });

            it("request (with 2 optional arguments)", function (){

                connectionManager.request(
                    "GET",
                    rootId,
                    mockCallback
                );

                expect(mockAuthenticationAgent.ensureAuthentication).toHaveBeenCalled();
                expect(mockAuthenticationAgent.authenticateRequest).toHaveBeenCalledWith(
                    jasmine.any(Request),
                    jasmine.any(Function)
                );
                expect(mockConnection.execute).toHaveBeenCalledWith(
                    jasmine.any(Request),
                    mockCallback
                );

                expect(mockConnection.execute).toHaveBeenCalledWithObject({
                    method: "GET",
                    url: endPointUrl + rootId,
                    body: "",
                    headers: {}
                });
            });

            it("request (with 3 optional arguments)", function (){

                connectionManager.request(
                    "GET",
                    rootId,
                    "",
                    mockCallback
                );

                expect(mockAuthenticationAgent.ensureAuthentication).toHaveBeenCalled();
                expect(mockAuthenticationAgent.authenticateRequest).toHaveBeenCalledWith(
                    jasmine.any(Request),
                    jasmine.any(Function)
                );
                expect(mockConnection.execute).toHaveBeenCalledWith(
                    jasmine.any(Request),
                    mockCallback
                );

                expect(mockConnection.execute).toHaveBeenCalledWithObject({
                    method: "GET",
                    url: endPointUrl + rootId,
                    body: "",
                    headers: {}
                });
            });

            it("request (and stores request in queue while authentication is still in progress)", function (){

                connectionManager._authInProgress = true;
                connectionManager._requestsQueue.push("dummyRequest");

                connectionManager.request(
                    "GET",
                    rootId,
                    "",
                    {},
                    mockCallback
                );

                expect(mockAuthenticationAgent.ensureAuthentication).not.toHaveBeenCalled();
                expect(mockAuthenticationAgent.authenticateRequest).not.toHaveBeenCalled();
                expect(mockConnectionFactory.createConnection).not.toHaveBeenCalled();
                expect(connectionManager._requestsQueue.length).toEqual(2);
            });

            it("notAuthorizedRequest", function (){

                connectionManager.logRequests = testFalse;

                connectionManager.notAuthorizedRequest(
                    "GET",
                    rootId,
                    "",
                    {},
                    mockCallback
                );

                expect(mockAuthenticationAgent.ensureAuthentication).not.toHaveBeenCalled();
                expect(mockAuthenticationAgent.authenticateRequest).toHaveBeenCalled();
                expect(mockConnectionFactory.createConnection).toHaveBeenCalled();
                expect(mockConnection.execute).toHaveBeenCalledWith(
                    jasmine.any(Request),
                    mockCallback
                );
            });

            it("notAuthorizedRequest (with calls logging and minimum arguments set)", function (){

                connectionManager.logRequests = testTrue;

                // Spy on console.dir AND prevent it from really outputting something
                spyOn(console, 'dir');

                connectionManager.notAuthorizedRequest(
                    mockCallback
                );

                expect(mockAuthenticationAgent.ensureAuthentication).not.toHaveBeenCalled();
                expect(mockAuthenticationAgent.authenticateRequest).toHaveBeenCalled();
                expect(mockConnection.execute).toHaveBeenCalledWith(
                    jasmine.any(Request),
                    mockCallback
                );
                expect(console.dir).toHaveBeenCalledWith(jasmine.any(Request));
            });

            it("notAuthorizedRequest (with 1 optional argument)", function (){

                connectionManager.notAuthorizedRequest(
                    "GET",
                    mockCallback
                );

                expect(mockAuthenticationAgent.ensureAuthentication).not.toHaveBeenCalled();
                expect(mockAuthenticationAgent.authenticateRequest).toHaveBeenCalled();
                expect(mockConnection.execute).toHaveBeenCalledWith(
                    jasmine.any(Request),
                    mockCallback
                );

                expect(mockConnection.execute).toHaveBeenCalledWithObject({
                    method: "GET",
                    url: endPointUrl + "/",
                    body: "",
                    headers: {}
                });
            });

            it("notAuthorizedRequest (with 2 optional arguments)", function (){

                connectionManager.notAuthorizedRequest(
                    "GET",
                    rootId,
                    mockCallback
                );

                expect(mockAuthenticationAgent.ensureAuthentication).not.toHaveBeenCalled();
                expect(mockAuthenticationAgent.authenticateRequest).toHaveBeenCalled();
                expect(mockConnection.execute).toHaveBeenCalledWith(
                    jasmine.any(Request),
                    mockCallback
                );

                expect(mockConnection.execute).toHaveBeenCalledWithObject({
                    method: "GET",
                    url: endPointUrl + rootId,
                    body: "",
                    headers: {}
                });
            });

            it("notAuthorizedRequest (with 3 optional arguments)", function (){

                connectionManager.notAuthorizedRequest(
                    "GET",
                    rootId,
                    "",
                    mockCallback
                );

                expect(mockAuthenticationAgent.ensureAuthentication).not.toHaveBeenCalled();
                expect(mockAuthenticationAgent.authenticateRequest).toHaveBeenCalled();
                expect(mockConnection.execute).toHaveBeenCalledWith(
                    jasmine.any(Request),
                    mockCallback
                );

                expect(mockConnection.execute).toHaveBeenCalledWithObject({
                    method: "GET",
                    url: endPointUrl + rootId,
                    body: "",
                    headers: {}
                });
            });
        });

    // ******************************
    // Cases with errors
    // ******************************
        describe("is returning errors correctly, when authentication fails, while performing request and", function () {

            it("ensuring authentication", function (){

                mockFaultyAuthenticationAgent = {
                    ensureAuthentication : function(done){
                        done(
                            new CAPIError("Error while ensuring authentication."),
                            false
                        );
                    }
                };
                spyOn(mockFaultyAuthenticationAgent, 'ensureAuthentication').andCallThrough();

                connectionManager = new ConnectionManager(
                    endPointUrl,
                    mockFaultyAuthenticationAgent,
                    mockConnectionFactory
                );

                connectionManager.request(
                    "GET",
                    rootId,
                    "",
                    {},
                    mockCallback
                );

                expect(mockFaultyAuthenticationAgent.ensureAuthentication).toHaveBeenCalled();
                expect(mockCallback).toHaveBeenCalledWith(
                    jasmine.any(CAPIError),
                    false
                );
            });

            it("authenticating request", function (){

                mockFaultyAuthenticationAgent = {
                    ensureAuthentication : function(done){
                        done(false, true);
                    },
                    authenticateRequest : function(request, done){
                        done(
                            new CAPIError("Error while authenticating request."),
                            false);
                    }
                };
                spyOn(mockFaultyAuthenticationAgent, 'ensureAuthentication').andCallThrough();
                spyOn(mockFaultyAuthenticationAgent, 'authenticateRequest').andCallThrough();

                connectionManager = new ConnectionManager(
                    endPointUrl,
                    mockFaultyAuthenticationAgent,
                    mockConnectionFactory
                );

                connectionManager.request(
                    "GET",
                    rootId,
                    "",
                    {},
                    mockCallback
                );

                expect(mockFaultyAuthenticationAgent.ensureAuthentication).toHaveBeenCalled();
                expect(mockFaultyAuthenticationAgent.authenticateRequest).toHaveBeenCalled();
                expect(mockCallback).toHaveBeenCalledWith(
                    jasmine.any(CAPIError),
                    false
                );
            });

        });
    });

});
