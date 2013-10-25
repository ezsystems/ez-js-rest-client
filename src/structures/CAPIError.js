/* global define */
define(function () {
    "use strict";

    /**
     * Class describing any error which could be thrown during CAPI workflow
     *
     * @class CAPIError
     * @constructor
     * @param valuesContainer {Object} object literal containing any error properties
     */
    var CAPIError = function (valuesContainer) {
        for (var property in valuesContainer) {
            if (valuesContainer.hasOwnProperty(property)) {
                this[property] = valuesContainer[property];
            }
        }

        return this;
    };

    return CAPIError;

});