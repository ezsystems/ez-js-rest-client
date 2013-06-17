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
    var CAPI = function (endPointUrl, authenticationAgent) {

        this.contentService_ = null;
        this.userService_ = null;

        authenticationAgent.CAPI = this;
        // No other way to use session authorization... or is it?

        // Array of connections, should be filled-in in preferred order
        //TODO: consider moving to some sort of configuration file...
        var connectionStack = [
            {
                connection: XmlHttpRequestConnection
            },
            {
                connection: MicrosoftXmlHttpRequestConnection
            }
        ];
        var connectionFactory = new ConnectionFeatureFactory(connectionStack);

        var connectionManager = new ConnectionManager(endPointUrl, authenticationAgent, connectionFactory);

        //TODO: move logRequests to the same config file as above...
        connectionManager.logRequests = true;

        //TODO: move hardcoded rootPath to the same config file as above...
        var discoveryService = new DiscoveryService('/api/ezp/v2/', connectionManager)

        /**
         * Get instance of Content Service
         *
         * @method getContentService
         * @return {ContentService}
         */
        this.getContentService = function getContentService(){
            if  (!this.contentService_)  {
                this.contentService_  =  new ContentService(
                    connectionManager,
                    discoveryService
                );
            }
            return  this.contentService_;
        };

        /**
         * Get instance of Content Type Service
         *
         * @method getContentTypeService
         * @return {ContentTypeService}
         */
        this.getContentTypeService = function getContentTypeService(){
            if  (!this.contentTypeService_)  {
                this.contentTypeService_  =  new ContentTypeService(
                    connectionManager,
                    discoveryService
                );
            }
            return  this.contentTypeService_;
        };

        /**
         * Get instance of User Service
         *
         * @method getUserService
         * @return {UserService}
         */
        this.getUserService = function getUserService(){
            if  (!this.userService_)  {
                this.userService_  =  new UserService(
                    connectionManager,
                    discoveryService
                );
            }
            return  this.userService_;
        };

    };

    return CAPI;

}());