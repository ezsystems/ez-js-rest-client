/* global define */
define(["../../node_modules/q/q"], function (q) {
    "use strict";

    /**
     * Creates an instance of promise-based service object based on original service
     *
     * @class PromiseService
     * @constructor
     * @param originalService {object} the service which should be converted into promise-based version (e.g. ContentService)
     */
    var PromiseService = function(originalService) {

        var key;

        this._originalService = originalService;

        this.generatePromiseFunction = function(originalFunction) {

            var that = this;

            return function() {

                var toBeCalledArguments = Array.prototype.slice.call(arguments),
                    deferred = q.defer();

                if (originalFunction.length - 1 !== arguments.length) {
                    throw new EvalError("Wrong numner of arguments provided");
                }

                toBeCalledArguments.push(function(error, result) {

                    if (error) {
                        deferred.reject(error);
                    } else {
                        deferred.resolve(result);
                    }

                });

                originalFunction.apply(that._originalService, toBeCalledArguments);

                return deferred.promise;
            };

        };

        // Auto-generating promise-based functions based on every existing service function
        // taking into account all the functions with signature different from "new....Struct"
        for(key in this._originalService) {
            if ((typeof this._originalService[key] === "function") &&
               (Object.prototype.toString.call(this._originalService[key].toString().match(/^function\s*(new[^\s(]+Struct)/)) != '[object Array]')) {

                this[key] = this.generatePromiseFunction(this._originalService[key]);

            }
        }
    };

    return PromiseService;

});

