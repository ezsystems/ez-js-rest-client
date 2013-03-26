var CAPI = (function() {
    "use strict";

    // Private static



    // Constructor
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