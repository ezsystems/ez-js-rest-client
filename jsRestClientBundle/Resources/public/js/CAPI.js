var CAPI = (function() {
    "use strict";

    /**
     * Creates an instance of CAPI object
     *
     * @constructor
     * @param endPointUrl {string} url to REST root
     * @param authenticationAgent {object} literal object used to maintain authentication to REST server
     * @param connection {object} one of the special connection objects used to implement different techniques (connectionXHR, connectionJSONP etc.)
     */
    var API = function (endPointUrl, authenticationAgent, connection) {

        // Public vars and functions for this instance
        this.connectionManager = new RestConnectionManager(endPointUrl, authenticationAgent, connection);

    };

    // Public shared

    /**
     * Get instance of Content Service
     *
     * @method getContentService
     */
    API.prototype.getContentService = function(){
        //TODO: singleton approach
        return new contentService(this.connectionManager);
    };


    API.prototype.isConnected = function(){
        console.log("Is connected?");
    };


    return API;

}());