/* global define */
define(function (require) {

    var CAPIError = require("structures/CAPIError");

    window.eZ = window.eZ || {};

    window.eZ.addJasmineCAPIMatchers = function () {

        this.addMatchers({
            /**
             * Custom matcher which is applied to any function. It runs the function and tests thrown error to be of CAPIError type
             *
             * @method toThrowCAPIError
             * @returns {boolean}
             */
            toThrowCAPIError: function () {
                try {
                    this.actual.call();

                    // If the call did not fail, that is also not an expected behavior
                    this.message = function () {
                        return "Expected " + this.actual + " to throw an exception";
                    };
                } catch(e) {
                    this.message = function () {
                        return "Expected " + e + " to be of CAPIError type";
                    };
                    return e instanceof CAPIError;
                }
            }
        });

    };

});

