/* global define */
define(["CAPI", "services/PromiseService"], function (CAPI, PromiseService) {
    "use strict";

    /**
     * Creates an instance of PromiseCAPI object based on existing CAPI object
     *
     * @class PromiseCAPI
     * @constructor
     * @param CAPI {CAPI} main REST client object
     */
    var PromiseCAPI = function (CAPI) {
        var key;

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
         * @type {Array}
         * @protected
         */
        this._services = [];

        /**
         * Convert any CAPI service into Promise-based service (if needed).
         *
         * @method _getPromiseService
         * @param serviceFactoryName {String} name of the function which returns one of the CAPI services
         * @return {function} function which returns instance of the PromiseService - promise-based wrapper around any of the CAPI services
         * @protected
         */
        this._getPromiseService = function (serviceFactoryName) {
            return function () {
                if (!this._services[serviceFactoryName]) {
                    this._services[serviceFactoryName] = new PromiseService(CAPI[serviceFactoryName].call(CAPI));
                }
                return this._services[serviceFactoryName];
            };
        };

        // Auto-generating promise-based services based on every existing CAPI service
        // taking into account only functions with "get....Service" signature
        for (key in CAPI) {
            if ( (typeof CAPI[key] === "function") && (/^(get[^\s(]+Service)/).test(key) ) {
                this[key] = this._getPromiseService(key);
            }
        }
    };

    return PromiseCAPI;

});