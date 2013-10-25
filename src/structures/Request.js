/* global define */
define(function () {
    "use strict";

    /**
     * Request object used for storing all the data, which should be sent to the REST server.
     *
     * @class Request
     * @constructor
     * @param valuesContainer {Object} object literal containing any request properties
     */
    var Request = function (valuesContainer) {
        for (var property in valuesContainer) {
            if (valuesContainer.hasOwnProperty(property)) {
                this[property] = valuesContainer[property];
            }
        }

        return this;
    };

    return Request;

});