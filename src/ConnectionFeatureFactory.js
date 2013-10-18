/* global define */
define(function () {
    "use strict";

    /**
     * Creates an instance of connection feature factory. This factory is choosing compatible connection from list of available connections.
     *
     * @class ConnectionFeatureFactory
     * @constructor
     * @param connectionList {array} Array of connections, should be filled-in in preferred order
     */
    var ConnectionFeatureFactory = function(connectionList) {

        this.connectionList = connectionList;

        this.defaultFactory = function(Connection) {
            return new Connection();
        };

    };

    /**
     * Returns instance of the very first compatible connection from the list
     *
     * @method createConnection
     * @return  {Connection}
     */
    ConnectionFeatureFactory.prototype.createConnection = function(){
        var connection = null,
            index = 0;

        // Choosing and creating first compatible connection from connection list
        for (index = 0; index < this.connectionList.length; ++index) {

            if (this.connectionList[index].connection.isCompatible()) {

                if (this.connectionList[index].factory){
                    connection = this.connectionList[index].factory(this.connectionList[index].connection);
                } else {
                    connection = this.defaultFactory(this.connectionList[index].connection);
                }
                break;

            }
        }

        return connection;
    };


    return ConnectionFeatureFactory;

});