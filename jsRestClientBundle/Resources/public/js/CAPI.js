var CAPI = (function() {
    "use strict";

    /**
     * Creates an instance of CAPI object
     *
     * @constructor
     * @param endPointUrl {string} url to REST root
     * @param authenticationAgent {object} literal object used to maintain authentication to REST server
     * @param connectionType {string} string related to one of the special connection objects used to implement exact technique ("XHR", "JSONP" etc.)
     */
    var API = function (endPointUrl, authenticationAgent, connectionType) {

        // Public vars and functions for this instance
        this.connectionManager = new RestConnectionManager(endPointUrl, authenticationAgent, connectionType);

    };

    // Public shared

    /**
     * Get instance of Content Service
     *
     * @method getContentService
     */
    API.prototype.getContentService = function(){
        if  (!this.contentService_)  {
            this.contentService_  =  new ContentService(
                this.connectionManager
            );
        }
        return  this.contentService_;
    };

    return API;

}());