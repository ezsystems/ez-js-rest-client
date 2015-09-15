/* global define */
define(function () {
    "use strict";

    /**
     * Returns a structure used to create a new REST View. See
     * {{#crossLink "ContentService/createView"}}ContentService.createView{{/crossLink}}
     *
     * @class ViewCreateStruct
     * @constructor
     * @param identifier {String} unique view identifier
     * @param [type="ContentQuery"] {String} the view type to create, the REST API currently
     * supports only "ContentQuery" or "LocationQuery".
     */
    var ViewCreateStruct = function (identifier, type) {
        var query = {
                "Criteria": {},
                "FacetBuilders": {},
                "SortClauses": {},
            };

        if ( !type ) {
            type = "ContentQuery";
        }
        /**
         * Holds the body of the view create structs
         *
         * @property body
         * @type {Object}
         * @default {
         *     ViewInput: {
         *         identifier: <identifier>,
         *         public: false,
         *         <type>: {
         *             Criteria: {},
         *             SortClauses: {},
         *             FacetBuilders: {},
         *         },
         *     }
         * }
         */
        this.body = {ViewInput: {"identifier": identifier, "public": false}};
        this.body.ViewInput[type] = query;

        /**
         * Holds the headers sent when creating a view
         *
         * @property headers
         * @type {Object}
         * @default {
         *  "Accept": "application/vnd.ez.api.View+json; version=1.1",
         *  "Content-Type": "application/vnd.ez.api.ViewInput+json; version=1.1"
         * }
         */
        this.headers = {
            "Accept": "application/vnd.ez.api.View+json; version=1.1",
            "Content-Type": "application/vnd.ez.api.ViewInput+json; version=1.1"
        };
    };

    return ViewCreateStruct;
});
