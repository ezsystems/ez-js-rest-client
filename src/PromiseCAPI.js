/* global define */
define(["CAPI", "services/PromiseService"], function (CAPI, PromiseService) {
    "use strict";

    /**
     * Creates an instance of PromiseCAPI object based on existing CAPI object
     *
     * @class PromiseCAPI
     * @constructor
     * @param originalCapi {CAPI} main REST client object
     */
    var PromiseCAPI = function (originalCapi) {
        var key,
            _services,
            _generatePromiseServiceFactory,
            _generateMappedFunction;

        // Documentation for dynamically created methods

        /**
         * Dynamically generated method which returns promise-based version of the ContentService.
         * Resulting service provides set of methods named the same as the regular
         * {{#crossLink "ContentService"}}ContentService{{/crossLink}} methods.
         * The only exception are structure constructors (new...Struct methods) which are not implemented in promise-based services.
         * These promise-based methods should be used without the callback parameter and according to promises approach.
         * Basic usage of a promise-based method is provided in the following example.
         * Read more about promises at https://github.com/kriskowal/q
         *
         * @method getContentService
         * @return {PromiseService}
         * @example
         *     var jsCAPI = new eZ.CAPI(
         *         'http://ez.git.local',
         *         new eZ.SessionAuthAgent({login: "admin", password: "ezpublish"}),
         *         {logRequests: true},
         *     ),
         *     jsPromiseCAPI = new eZ.PromiseCAPI(jsCAPI),
         *     promiseContentService = jsPromiseCAPI.getContentService(),
         *     promise = promiseContentService.loadSection("/api/ezp/v2/content/sections/1");
         *
         *     promise.then(
         *         function (result) {
         *             console.log(result);
         *         }, function (error) {
         *             console.log(error);
         *         }
         *     );
         */

        /**
         * Dynamically generated method which returns promise-based version of the ContentTypeService.
         * Resulting service provides set of methods named the same as the regular
         * {{#crossLink "ContentTypeService"}}ContentTypeService{{/crossLink}} methods.
         * The only exception are structure constructors (new...Struct methods) which are not implemented in promise-based services.
         * These promise-based methods should be used without the callback parameter and according to promises approach.
         * Basic usage of a promise-based method is provided in the following example.
         * Read more about promises at https://github.com/kriskowal/q
         *
         * @method getContentTypeService
         * @return {PromiseService}
         * @example
         *     var jsCAPI = new eZ.CAPI(
         *         'http://ez.git.local',
         *         new eZ.SessionAuthAgent({login: "admin", password: "ezpublish"}),
         *         {logRequests: true},
         *     ),
         *     jsPromiseCAPI = new eZ.PromiseCAPI(jsCAPI),
         *     promiseContentTypeService = jsPromiseCAPI.getContentTypeService(),
         *     promise = promiseContentTypeService.loadContentTypeGroup("/api/ezp/v2/content/typegroups/1");
         *
         *     promise.then(
         *         function (result) {
         *             console.log(result);
         *         }, function (error) {
         *             console.log(error);
         *         }
         *     );
         */

        /**
         * Dynamically generated method which returns promise-based version of the UserService.
         * Resulting service provides set of methods named the same as the regular
         * {{#crossLink "UserService"}}UserService{{/crossLink}} methods.
         * The only exception are structure constructors (new...Struct methods) which are not implemented in promise-based services.
         * These promise-based methods should be used without the callback parameter and according to promises approach.
         * Basic usage of a promise-based method is provided in the following example.
         * Read more about promises at https://github.com/kriskowal/q
         *
         * @method getUserService
         * @return {PromiseService}
         * @example
         *     var jsCAPI = new eZ.CAPI(
         *         'http://ez.git.local',
         *         new eZ.SessionAuthAgent({login: "admin", password: "ezpublish"}),
         *         {logRequests: true},
         *     ),
         *     jsPromiseCAPI = new eZ.PromiseCAPI(jsCAPI),
         *     promiseUserService = jsPromiseCAPI.getUserService(),
         *     promise = promiseUserService.loadUserGroup("/api/ezp/v2/user/groups/1/5");
         *
         *     promise.then(
         *         function (result) {
         *             console.log(result);
         *         }, function (error) {
         *             console.log(error);
         *         }
         *     );
         */

        /**
         * Array of promise-based services instances (needed to implement singletons approach)
         *
         * @attribute _services
         * @type {Object}
         * @protected
         */
        _services = {};

        /**
         * Convert any CAPI service factory into Promise-based service factory.
         *
         * The factory will cache once created instances inside the _services object
         * to not create new service wrappers each time they are requested
         *
         * @method _createPromiseServiceFactory
         * @param serviceFactoryName {String} name of the function which returns one of the CAPI services
         * @return {Function} function which returns instance of the PromiseService - promise-based wrapper around any of the CAPI services
         * @private
         */
        _generatePromiseServiceFactory = function (serviceFactoryName) {
            return function () {
                if (!_services[serviceFactoryName]) {
                    _services[serviceFactoryName] = new PromiseService(
                        originalCapi[serviceFactoryName].call(originalCapi)
                    );
                }
                return _services[serviceFactoryName];
            };
        };

        _generateMappedFunction = function(originalMethodName) {
            return function() {
                return originalCapi[originalMethodName].apply(
                    originalCapi,
                    Array.prototype.slice.call(arguments)
                );
            };
        };

        // Auto-generating promise-based services based on every existing CAPI service
        // taking into account only functions with "get....Service" signature
        /* Disabling hasOwnProperty wrapper check here, as we explicitly WANT to copy
         * over potentially inherited functions */
        /* jshint -W089 */
        for(key in originalCapi) {
            if (typeof originalCapi[key] !== "function") {
                continue;
            }

            switch(true) {
            case (/^_/).test(key):
                // Skip all private methods
                break;
            case (/^(get[^\s(]+Service)/).test(key):
                // Wrap all services to return a PromiseService Wrapper
                this[key] = _generatePromiseServiceFactory(key);
                break;
            default:
                // Map all other functions by simply copying them, while
                // retaining their calling context
                this[key] = _generateMappedFunction(key);
            }
        }
    };
    /* jshint +W089 */

    return PromiseCAPI;
});