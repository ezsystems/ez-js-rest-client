
describe("Connection Manager", function () {

    var mockAuthenticationAgent,
        mockConnectionFactory,
        mockConnection,
        mockCallback,
        connectionManager,

        endPointUrl = 'http://ez.git.local',
        rootId = '/api/ezp/v2/',
        testContentId = '/api/ezp/v2/content/objects/173';

    beforeEach(function (){

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
        }
        spyOn(mockAuthenticationAgent, 'ensureAuthentication').andCallThrough();
        spyOn(mockAuthenticationAgent, 'authenticateRequest').andCallThrough();
        spyOn(mockAuthenticationAgent, 'logOut').andCallThrough();

        mockConnection = jasmine.createSpyObj('mockConnection', ['execute']);
        mockConnectionFactory = {
            createConnection : function(){
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

        it("it's own constructor", function(){

            connectionManager = new ConnectionManager(
                endPointUrl,
                mockAuthenticationAgent,
                mockConnectionFactory
            );

            expect(mockConnectionFactory.createConnection).toHaveBeenCalled();
        });

        describe("regular calls:", function () {

            beforeEach(function (){
                connectionManager = new ConnectionManager(
                    endPointUrl,
                    mockAuthenticationAgent,
                    mockConnectionFactory
                );
            });

            it("request", function(){

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
                expect(mockConnection.execute).toHaveBeenCalledWith(
                    jasmine.any(Request),
                    mockCallback
                );
            });

            it("notAuthorizedRequest", function(){

                connectionManager.notAuthorizedRequest(
                    "GET",
                    rootId,
                    "",
                    {},
                    mockCallback
                );

                expect(mockAuthenticationAgent.ensureAuthentication).not.toHaveBeenCalled();
                expect(mockAuthenticationAgent.authenticateRequest).not.toHaveBeenCalled();
                expect(mockConnection.execute).toHaveBeenCalledWith(
                    jasmine.any(Request),
                    mockCallback
                );
            });

            it("delete", function(){

                connectionManager.delete(
                    testContentId,
                    mockCallback
                );

                expect(mockAuthenticationAgent.ensureAuthentication).toHaveBeenCalled();
                expect(mockAuthenticationAgent.authenticateRequest).toHaveBeenCalled();
                expect(mockConnection.execute).toHaveBeenCalledWith(
                    jasmine.any(Request),
                    mockCallback
                );
            });

            it("logOut", function(){

                connectionManager.logOut(mockCallback);

                expect(mockAuthenticationAgent.logOut).toHaveBeenCalledWith(mockCallback);
            });

        });
    });


});




