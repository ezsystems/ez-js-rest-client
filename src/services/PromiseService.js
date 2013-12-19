/* global define */
define(["../../node_modules/q/q", "structures/CAPIError"], function (q, CAPIError) {
    "use strict";

    /**
     * Creates an instance of promise-based service object based on original service
     *
     * @class PromiseService
     * @constructor
     * @param originalService {object} the service which should be converted into promise-based version (e.g. ContentService)
     */
    var PromiseService = function (originalService) {
        var key,
            _generateMappedFunction,
            _generatePromiseFunction;

        /**
         * Generate a new function, that if called assured `this` is mapped to
         * the original service.
         *
         * @method _generateMappedFunction
         * @private
         *
         * @param {Function} originalFunction
         * @return {Function}
         */
        _generateMappedFunction = function(originalFunction) {
            return function() {
                return originalFunction.apply(originalService, Array.prototype.slice(arguments));
            };
        };

        /**
         * Generate a promise version of the given function
         *
         * The execution is mapped to the originalService in order to preserve all
         * internal state manipulations.
         *
         * @method _generatePromiseFunction
         * @private
         *
         * @param originalFunction
         * @return {Function}
         */
        _generatePromiseFunction = function (originalFunction) {
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
        /* Disabling hasOwnProperty wrapper check here, as we explicitly WANT to copy
         * over potentially inherited functions */
        /* jshint -W089 */
        for(key in originalService) {
            if (typeof originalService[key] !== "function") {
                continue;
            }

            switch(true) {
            case (/^_/).test(key):
                // Skip all private methods
                break;
            case (/^(new[^\s(]+Struct)/).test(key):
                // Simply cover over newXXXStruct functions, as they are synchronous.
                // Still make sure the method is called on the original service ;)
                this[key] = _generateMappedFunction(originalService[key]);
                break;
            default:
                // Map all other functions using the promise system, as they are supposed to be
                // asynchronous
                this[key] = _generatePromiseFunction(originalService[key]);
            }
        }
    };
    /* jshint +W089 */

    return PromiseService;
});

