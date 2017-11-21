/* global define */
define(['authAgents/SessionAuthAgent', 'authAgents/HttpBasicAuthAgent', 'ConnectionManager',
        'ConnectionFeatureFactory', 'connections/XmlHttpRequestConnection', 'connections/MicrosoftXmlHttpRequestConnection',
        'services/DiscoveryService', 'services/ContentService', 'services/ContentTypeService',
        'services/UserService', 'utils/extend'],
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
     * @param [options] {Object} Object containing different options for the CAPI
     * @param [options.rootPath='/api/ezp/v2/'] {String} the API root path
     * @param [options.logRequests=false] {Boolean} whether to log requests
     * @param [options.siteAccess=null] {String|null} siteaccess in which requests should be executed
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
            discoveryService,
            contentService,
            contentTypeService,
            userService;

        // Options used if not overwritten from the outside
        defaultOptions =  {
            logRequests: false, // Whether we should log each request to the js console or not
            rootPath: '/api/ezp/v2/', // Path to the REST root
            connectionStack: [ // Array of connections, should be filled-in in preferred order
                {connection: XmlHttpRequestConnection},
                {connection: MicrosoftXmlHttpRequestConnection}
            ],
            siteAccess: null,
            token: null
        };

        authenticationAgent.setCAPI(this);

        // Merging provided options (if any) with defaults
        mergedOptions = extend({}, defaultOptions, options);

        connectionFactory = new ConnectionFeatureFactory(mergedOptions.connectionStack);
        connectionManager = new ConnectionManager(endPointUrl, authenticationAgent, connectionFactory, mergedOptions.siteAccess, mergedOptions.token);
        connectionManager.logRequests = mergedOptions.logRequests;
        discoveryService = new DiscoveryService(mergedOptions.rootPath, connectionManager);

        /**
         * Checks that the CAPI instance is logged in
         *
         * @method isLoggedIn
         * @param {Function} callback
         */
        this.isLoggedIn = function (callback) {
            authenticationAgent.isLoggedIn(callback);
        };

        /**
         * Logs in the user
         *
         * @method logIn
         * @param {Object} [credentials]
         * @param {String} credentials.login
         * @param {String} credentials.password
         * @param {Function} callback
         */
        this.logIn = function (credentials, callback) {
            if ( callback ) {
                authenticationAgent.setCredentials(credentials);
            } else {
                callback = credentials;
            }
            authenticationAgent.logIn(callback);
        };

        /**
         * Logs out the current user.
         *
         * @method logOut
         * @param {Function} callback
         */
        this.logOut = function (callback) {
            authenticationAgent.logOut(callback);
        };

        /**
         * Stores session info.
         *
         * @method storeSessionInfo
         * @param {Object} session
         */
        this.storeSessionInfo = function (session) {
            authenticationAgent._storeSessionInfo({
                name: session.name,
                href: session._href,
                identifier: session.identifier,
                csrfToken: session.csrfToken,
            });
        };

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
            if (!contentService)  {
                contentService = new ContentService(
                    connectionManager,
                    discoveryService,
                    mergedOptions.rootPath
                );
            }
            return contentService;
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
            if (!contentTypeService) {
                contentTypeService = new ContentTypeService(
                    connectionManager,
                    discoveryService
                );
            }
            return contentTypeService;
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
            if (!userService)  {
                userService = new UserService(
                    connectionManager,
                    discoveryService,
                    mergedOptions.rootPath
                );
            }
            return userService;
        };

        /**
         * Get instance of Discovery Service. Use DiscoveryService to internally to discover
         * resources URI and media type provided in the root resource.
         *
         * @method getDiscoveryService
         * @return {DiscoveryService}
         * @example
         *      var discoveryService = jsCAPI.getDiscoveryService();
         *      discoveryService.getInfoObject(
         *          "Trash",
         *          callback
         *      );
         */
        this.getDiscoveryService = function () {
            return discoveryService;
        };

        /**
         * Gets the connection manager
         *
         * @method getConnectionManager
         * @return {ConnectionManager}
         * @example
         *      var connectionManager = jsCAPI.getConnectionManager();
         *      connectionManager.request(
         *          "GET",
         *          "/endpoint",
         *          "",
         *          {"Accept": "application/json"},
         *          callback
         *      );
         */
        this.getConnectionManager = function () {
            return connectionManager;
        };
    };

    return CAPI;
});
