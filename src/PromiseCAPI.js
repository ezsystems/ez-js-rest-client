var PromiseCAPI = (function() {
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
        var that = this;

        this._capi = CAPI;

        console.log('entered PromiseCAPI');


        /**
         * Convert any CAPI service into Promise-based service.
         *
         * @method generatePromiseService
         * @param serviceFactory {function} function which returns one of the CAPI services
         * @return {function} function which returns instance of the PromiseService - promise-based wrapper around any of the CAPI services
         */
        this.generatePromiseService = function(serviceFactory){
            return function() {
                return new PromiseService(
                    serviceFactory.call(that._capi)
                )
            }
        };

        // Auto-generating promise-based services based on every existing CAPI service
        // taking into account only functions with "get....Service" signature
        for(key in this._capi) {
            if ((typeof this._capi[key] === "function") && ( Object.prototype.toString.call(this._capi[key].toString().match(/^function\s*(get[^\s(]+Service)/)) === '[object Array]')) {

                this[key] = this.generatePromiseService(this._capi[key]);

            }
        }

    };

    return PromiseCAPI;

}());