/* global define */
define(['authAgents/SessionAuthAgent', 'authAgents/HttpBasicAuthAgent', 'ConnectionManager',
        'ConnectionFeatureFactory', 'connections/XmlHttpRequestConnection', 'connections/MicrosoftXmlHttpRequestConnection',
        'services/DiscoveryService', 'services/ContentService', 'services/ContentTypeService',
        'services/UserService'],
    function (SessionAuthAgent, HttpBasicAuthAgent, ConnectionManager,
              ConnectionFeatureFactory, XmlHttpRequestConnection, MicrosoftXmlHttpRequestConnection,
              DiscoveryService, ContentService, ContentTypeService,
              UserService) {
    "use strict";

    /**
     * Creates an instance of CAPI - main object which handles the API initialization and gives ability to retrieve various services.
     * Could be created only in one instance. Handles connections, authorization and REST paths discovery automatically.
     *
     * @class CAPI
     * @constructor
     * @param endPointUrl {String} url pointing to REST root
     * @param authenticationAgent {Object} Instance of one of the AuthAgents (e.g. SessionAuthAgent, HttpBasicAuthAgent)
     * @example
     *     var   authAgent = new SessionAuthAgent({
               login: "admin",
               password: "admin"
           }),
           jsCAPI = new CAPI(
               'http://ez.git.local',
               authAgent
           );
     */
    var CAPI = function (endPointUrl, authenticationAgent) {
        this._contentService = null;
        this._contentTypeService = null;
        this._userService = null;

        authenticationAgent.setCAPI(this);

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
         * Get instance of Content Service. Use ContentService to retrieve information and execute operations related to Content.
         *
         * @method getContentService
         * @return {ContentService}
         * @example
         *      var contentService = jsCAPI.getContentService();
         *      contentService.loadRoot(
         *          '/api/ezp/v2/',
         *          callback
         *      );
         */
        this.getContentService = function getContentService() {
            if  (!this._contentService)  {
                this._contentService  =  new ContentService(
                    connectionManager,
                    discoveryService
                );
            }
            return  this._contentService;
        };

        /**
         * Get instance of Content Type Service. Use ContentTypeService to retrieve information and execute operations related to ContentTypes.
         *
         * @method getContentTypeService
         * @return {ContentTypeService}
         * @example
         *      var contentTypeService = jsCAPI.getContentTypeService();
         *      contentTypeService.loadContentType(
         *          '/api/ezp/v2/content/types/18',
         *          callback
         *      );
         */
        this.getContentTypeService = function getContentTypeService() {
            if  (!this._contentTypeService)  {
                this._contentTypeService  =  new ContentTypeService(
                    connectionManager,
                    discoveryService
                );
            }
            return  this._contentTypeService;
        };

        /**
         * Get instance of User Service. Use UserService to retrieve information and execute operations related to Users.
         *
         * @method getUserService
         * @return {UserService}
         * @example
         *      var userService = jsCAPI.getUserService();
         *      userService.loadRootUserGroup(
         *          callback
         *      );
         */
        this.getUserService = function getUserService() {
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

});
