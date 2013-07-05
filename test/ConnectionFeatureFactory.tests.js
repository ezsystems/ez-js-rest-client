describe("Connection Feature Factory", function () {

    var testConnectionStack,
        mockCompatibleConnection,
        mockIncompatibleConnection,
        mockFactory,
        connectionFeatureFactory,
        connection;

    beforeEach(function (){

        mockCompatibleConnection = (function(){
            var connection = function(){

            }
            connection.isCompatible = function(){
                return true;
            }
            return connection;
        }());
        spyOn(mockCompatibleConnection, 'isCompatible').andCallThrough();

        mockIncompatibleConnection = (function(){
            var connection = function(){

            }
            connection.isCompatible = function(){
                return false;
            }
            return connection;
        }());
        spyOn(mockIncompatibleConnection, 'isCompatible').andCallThrough();

    });

    it("is selecting compatible connection", function(){

        testConnectionStack = [
            {
                connection: mockIncompatibleConnection
            },
            {
                connection: mockCompatibleConnection
            }
        ];

        connectionFeatureFactory = new ConnectionFeatureFactory(testConnectionStack);
        spyOn(connectionFeatureFactory, 'defaultFactory').andCallThrough();

        connection = connectionFeatureFactory.createConnection();

        expect(mockIncompatibleConnection.isCompatible).toHaveBeenCalled();
        expect(mockCompatibleConnection.isCompatible).toHaveBeenCalled();
        expect(connectionFeatureFactory.defaultFactory).toHaveBeenCalledWith(mockCompatibleConnection);

        expect(connection instanceof mockCompatibleConnection).toBeTruthy();
    });

    it("is using connection factory if it is provided", function(){

        mockFactory = jasmine.createSpy('mockFactory').andCallFake(
            function(Connection){
                return new Connection();
            }
        );

        testConnectionStack = [
            {
                connection: mockIncompatibleConnection
            },
            {
                connection: mockCompatibleConnection,
                factory: mockFactory
            }
        ];

        connectionFeatureFactory = new ConnectionFeatureFactory(testConnectionStack);
        spyOn(connectionFeatureFactory, 'defaultFactory');

        connection = connectionFeatureFactory.createConnection();

        expect(mockIncompatibleConnection.isCompatible).toHaveBeenCalled();
        expect(mockCompatibleConnection.isCompatible).toHaveBeenCalled();

        expect(mockFactory).toHaveBeenCalledWith(mockCompatibleConnection);
        expect(connectionFeatureFactory.defaultFactory).not.toHaveBeenCalled();

        expect(connection instanceof mockCompatibleConnection).toBeTruthy();
    });


});