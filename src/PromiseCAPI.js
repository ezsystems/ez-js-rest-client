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