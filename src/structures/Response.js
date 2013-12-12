/* global define */
define(function () {
    "use strict";

    /**
     * @class Response
     * @constructor
     * @param valuesContainer
     */
    var Response = function (valuesContainer) {
        /**
         * Body of the response (most times JSON string recieved from REST service via a Connection object)
         *
         * @property body
         * @type {String}
         * @default ""
         */
        this.body = "";

        /**
         * Document represents "body" property of the response parsed into structured object
         *
         * @property document
         * @type {Object}
         * @default null
         */
        this.document = null;

        for (var property in valuesContainer) {
            if (valuesContainer.hasOwnProperty(property)) {
                this[property] = valuesContainer[property];
            }
        }

        if ( this.body ) {
            try {
                this.document = JSON.parse(this.body);
            } catch(e) {
                this.document = null;
            }
        }

        return this;
    };

    return Response;

});