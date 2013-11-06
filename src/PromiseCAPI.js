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
         * Convert any CAPI service into Promise-based service (if needed).
         *
         * @method getPromiseService
         * @param serviceFactoryName {String} name of the function which returns one of the CAPI services
         * @return {function} function which returns instance of the PromiseService - promise-based wrapper around any of the CAPI services
         */
        this._getPromiseService = function (serviceFactoryName) {
            var singletonId = "_" + serviceFactoryName;

            return function () {
                if (!this[singletonId]) {
                    this[singletonId] = new PromiseService(CAPI[serviceFactoryName].call(CAPI));
                }
                return this[singletonId];
            };
        };

        // Auto-generating promise-based services based on every existing CAPI service
        // taking into account only functions with "get....Service" signature
        for (key in CAPI) {
            if ( (typeof CAPI[key] === "function") && (/^function\s*(get[^\s(]+Service)/).test(CAPI[key].toString()) ) {
                this[key] = this._getPromiseService(key);
            }
        }
    };

    return PromiseCAPI;

});