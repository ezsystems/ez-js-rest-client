/* global define */
define(["../../node_modules/q/q","structures/CAPIError"], function (q, CAPIError) {
    "use strict";

    // Silencing false positive according to http://stackoverflow.com/a/18112535/125264
    q.stopUnhandledRejectionTracking();

    /**
     * Creates an instance of promise-based service object based on original service
     *
     * @class PromiseService
     * @constructor
     * @param originalService {object} the service which should be converted into promise-based version (e.g. ContentService)
     */
    var PromiseService = function (originalService) {
        var key;

        this._generatePromiseFunction = function (originalFunction) {

            return function () {
                var toBeCalledArguments = Array.prototype.slice.call(arguments),
                    deferred = q.defer();

                if (originalFunction.length - 1 !== arguments.length) {
                    throw new CAPIError("Wrong number of arguments provided for promise-based function.");
                }

                toBeCalledArguments.push(function (error, result) {
                    if (error) {
                        deferred.reject(error);
                    } else {
                        deferred.resolve(result);
                    }

                });

                originalFunction.apply(originalService, toBeCalledArguments);

                return deferred.promise;
            };
        };

        // Auto-generating promise-based functions based on every existing service function
        // taking into account all the functions with signature different from "new....Struct"
        for(key in originalService) {
            if ( (typeof originalService[key] === "function") && !(/^function\s*(new[^\s(]+Struct)/).test(originalService[key].toString()) ) {
                this[key] = this._generatePromiseFunction(originalService[key]);
            }
        }
    };

    return PromiseService;

});

