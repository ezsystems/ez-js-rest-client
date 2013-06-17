var PromiseService = (function() {
    "use strict";

    /**
     * Creates an instance of promise-based service object
     *
     * @constructor
     * @param originalService {object} the service which should be converted into promise-based version
     */
    var PromiseService = function(originalService) {

        var key;

        console.log("Entered promiseService based on:", originalService);

        this.originalService_ = originalService;

        this.generatePromiseFunction = function(originalFunction) {

            var that = this;

            return function() {

                var toBeCalledArguments = Array.prototype.slice.call(arguments);
                var deferred = Q.defer();

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

                originalFunction.apply(that.originalService_, toBeCalledArguments);

                return deferred.promise;
            }

        };

        // Auto-generating promise-based functions based on every existing service function
        // taking into account all the functions with signature different from "new....Struct"
        for(key in this.originalService_) {
            if ((typeof this.originalService_[key] === "function") && ( Object.prototype.toString.call(this.originalService_[key].toString().match(/^function\s*(new[^\s(]+Struct)/)) != '[object Array]')) {

                this[key] = this.generatePromiseFunction(this.originalService_[key]);

            }
        }



    };




    return PromiseService;

}());

