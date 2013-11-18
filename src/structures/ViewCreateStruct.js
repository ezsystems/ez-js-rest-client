/* global define */
define(function () {
    "use strict";

    /**
     * Returns a structure used to create a new View. See
     * {{#crossLink "ContentService/createView"}}ContentService.createView{{/crossLink}}
     *
     * @class ViewCreateStruct
     * @constructor
     * @param identifier {String} unique view identifier
     */
    var ViewCreateStruct = function (identifier) {
        this.body = {};
        this.body.ViewInput = {};

        this.body.ViewInput.identifier = identifier;
        this.body.ViewInput.public = false;
        this.body.ViewInput.Query = {};

        this.body.ViewInput.Query.Criteria = {};
        this.body.ViewInput.Query.offset = 0;
        this.body.ViewInput.Query.FacetBuilders = {};
        this.body.ViewInput.Query.SortClauses = {};
        this.body.ViewInput.Query.spellcheck = false;

        this.headers = {
            "Accept": "application/vnd.ez.api.View+json",
            "Content-Type": "application/vnd.ez.api.ViewInput+json"
        };

        return this;
    };

    return ViewCreateStruct;

});