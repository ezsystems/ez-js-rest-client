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
         * Holds the view type 
         *
         * @property _type
         * @protected
         * @type {String}
         */
        this._type = type;
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

    /**
     * Gets the Criteria property
     *
     * @method getCriteria
     * @return {Object} the criteria property.
     * @deprecated
     */
    ViewCreateStruct.prototype.getCriteria = function () {
        return this.body.ViewInput[this._type].Criteria;
    };

    /**
     * Gets the Query property
     *
     * @method getQuery
     * @return {Object} the query property.
     */
    ViewCreateStruct.prototype.getQuery = function () {
        return this.body.ViewInput[this._type].Query;
    };

    /**
     * Gets the Filter property
     *
     * @method getFilter
     * @return {Object} the Filter property.
     */
    ViewCreateStruct.prototype.getFilter = function () {
        return this.body.ViewInput[this._type].Filter;
    };

    /**
     * Sets the Criteria property
     *
     * @method setCriteria
     * @deprecated
     */
    ViewCreateStruct.prototype.setCriteria = function (criteria) {
        this.body.ViewInput[this._type].Criteria = criteria;
    };

    /**
     * Sets the Query property
     *
     * @method setQuery
     */
    ViewCreateStruct.prototype.setQuery = function (query) {
        this.body.ViewInput[this._type].Query = query;
    };

    /**
     * Sets the Filter property
     *
     * @method setFilter
     */
    ViewCreateStruct.prototype.setFilter = function (filter) {
        this.body.ViewInput[this._type].Filter = filter;
    };

    /**
     * Sets the SortClauses property
     *
     * @method setSortClauses
     */
    ViewCreateStruct.prototype.setSortClauses = function (sortClauses) {
        this.body.ViewInput[this._type].SortClauses = sortClauses;
    };

    /**
     * Sets the FacetBuilders property
     *
     * @method setFacetBuilders
     */
    ViewCreateStruct.prototype.setFacetBuilders = function (facetBuilders) {
        this.body.ViewInput[this._type].FacetBuilders = facetBuilders;
    };

    /**
     * Sets the limit and offset properties
     *
     * @method setLimitAndOffset
     */
    ViewCreateStruct.prototype.setLimitAndOffset = function (limit, offset) {
        this.body.ViewInput[this._type].limit = limit;
        this.body.ViewInput[this._type].offset = offset;
    };

    return ViewCreateStruct;
});
