var CAPI = (function() {
    "use strict";

    /**
     * Creates an instance of CAPI object
     *
     * @constructor
     * @param endPointUrl {string} url to REST root
     * @param authenticationAgent {object} literal object used to maintain authentication to REST server
     */
    var CAPI = function (endPointUrl, authenticationAgent) {

        this._contentService = null;
        this._contentTypeService = null;
        this._userService = null;

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
            ],
            connectionFactory = new ConnectionFeatureFactory(connectionStack),
            connectionManager = new ConnectionManager(endPointUrl, authenticationAgent, connectionFactory),
            //TODO: move hardcoded rootPath to the same config file as above...
            discoveryService = new DiscoveryService('/api/ezp/v2/', connectionManager);

            //TODO: move logRequests to the same config file as above...
            connectionManager.logRequests = true;

        /**
         * Get instance of Content Service
         *
         * @method getContentService
         * @return {ContentService}
         */
        this.getContentService = function getContentService(){
            if  (!this._contentService)  {
                this._contentService  =  new ContentService(
                    connectionManager,
                    discoveryService
                );
            }
            return  this._contentService;
        };

        /**
         * Get instance of Content Type Service
         *
         * @method getContentTypeService
         * @return {ContentTypeService}
         */
        this.getContentTypeService = function getContentTypeService(){
            if  (!this._contentTypeService)  {
                this._contentTypeService  =  new ContentTypeService(
                    connectionManager,
                    discoveryService
                );
            }
            return  this._contentTypeService;
        };

        /**
         * Get instance of User Service
         *
         * @method getUserService
         * @return {UserService}
         */
        this.getUserService = function getUserService(){
            if  (!this._userService)  {
                this._userService  =  new UserService(
                    connectionManager,
                    discoveryService
                );
            }
            return  this._userService;
        };

    };

    return CAPI;

}());