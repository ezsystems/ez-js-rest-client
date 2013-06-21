var PromiseCAPI = (function() {
    "use strict";

    /**
     * Creates an instance of PromiseCAPI object based on existing CAPI object
     *
     * @constructor
     * @param endPointUrl {string} url to REST root
     * @param authenticationAgent {object} literal object used to maintain authentication to REST server
     * @param connectionType {string} string related to one of the special connection objects used to implement exact technique ("XHR", "JSONP" etc.)
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
         * @param serviceFactory {function} CAPI function which returns one of the services
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