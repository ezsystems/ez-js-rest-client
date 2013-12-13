/* global define */
define(['authAgents/SessionAuthAgent', 'authAgents/HttpBasicAuthAgent', 'ConnectionManager',
        'ConnectionFeatureFactory', 'connections/XmlHttpRequestConnection', 'connections/MicrosoftXmlHttpRequestConnection',
        'services/DiscoveryService', 'services/ContentService', 'services/ContentTypeService',
        'services/UserService', "utils/extend"],
    function (SessionAuthAgent, HttpBasicAuthAgent, ConnectionManager,
              ConnectionFeatureFactory, XmlHttpRequestConnection, MicrosoftXmlHttpRequestConnection,
              DiscoveryService, ContentService, ContentTypeService,
              UserService, extend) {
    "use strict";

    /**
     * Creates an instance of CAPI - main object which handles the API initialization and gives ability to retrieve various services.
     * Could be created only in one instance. Handles connections, authorization and REST paths discovery automatically.
     *
     * @class CAPI
     * @constructor
     * @param endPointUrl {String} url pointing to REST root
     * @param authenticationAgent {Object} Instance of one of the AuthAgents (e.g. SessionAuthAgent, HttpBasicAuthAgent)
     * @param [options] {Object} Object containing different options for the CAPI (see example)
     * @example
     *     var   authAgent = new SessionAuthAgent({
               login: "admin",
               password: "admin"
           }),
           jsCAPI = new CAPI(
               'http://ez.git.local', authAgent, {
               logRequests: true, // Whether we should log each request to the js console or not
               rootPath: '/api/ezp/v2/', // Path to the REST root
               connectionStack: [ // Array of connections, should be filled-in in preferred order
                    {connection: XmlHttpRequestConnection},
                    {connection: MicrosoftXmlHttpRequestConnection}
               ]
           });
     */
    var CAPI = function (endPointUrl, authenticationAgent, options) {
        var defaultOptions,
            mergedOptions,
            connectionFactory,
            connectionManager,
            discoveryService;

        // Options used if not overwritten from the outside
        defaultOptions =  {
            logRequests: false, // Whether we should log each request to the js console or not
            rootPath: '/api/ezp/v2/', // Path to the REST root
            connectionStack: [ // Array of connections, should be filled-in in preferred order
                {connection: XmlHttpRequestConnection},
                {connection: MicrosoftXmlHttpRequestConnection}
            ]
        };

        this._contentService = null;
        this._contentTypeService = null;
        this._userService = null;

        authenticationAgent.setCAPI(this);

        // Merging provided options (if any) with defaults
        mergedOptions = extend({}, defaultOptions, options);

        connectionFactory = new ConnectionFeatureFactory(mergedOptions.connectionStack);
        connectionManager = new ConnectionManager(endPointUrl, authenticationAgent, connectionFactory);
        connectionManager.logRequests = mergedOptions.logRequests;
        discoveryService = new DiscoveryService(mergedOptions.rootPath, connectionManager);

        /**
         * Get instance of Content Service. Use ContentService to retrieve information and execute operations related to Content.
         *
         * @method getContentService
         * @return {ContentService}
         * @example
         *      var contentService = jsCAPI.getContentService();
         *      contentService.loadRoot(
         *          callback
         *      );
         */
        this.getContentService = function () {
            if  (!this._contentService)  {
                this._contentService  =  new ContentService(
                    connectionManager,
                    discoveryService,
                    mergedOptions.rootPath
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
        this.getContentTypeService = function () {
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
        this.getUserService = function () {
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
