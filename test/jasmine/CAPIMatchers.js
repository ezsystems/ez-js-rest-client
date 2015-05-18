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
             * @returns {Boolean}
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
            },

            /**
             * Custom matcher which is applied to any function. It compares comparisonObject with the first argument of the function for being equal
             * Attention: since we are using quite simple and fast check - ORDER of properties also MATTERS: {a: 1, b: 2} <> {b: 2, a: 1}
             *
             * @method toHaveBeenCalledWithObject
             * @param comparisonObject {object}
             * @returns {Boolean}
             */
            toHaveBeenCalledWithObject: function (comparisonObject) {

                this.message = function () {
                    return "Expected " + JSON.stringify(comparisonObject) + " to be equal to " + JSON.stringify(this.actual.mostRecentCall.args[0]);
                };

                return JSON.stringify(this.actual.mostRecentCall.args[0]) === JSON.stringify(comparisonObject);
            }
        });
    };
});

