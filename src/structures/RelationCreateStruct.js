/* global define */
define(function () {
    "use strict";

    /**
     * Returns a structure used to create a new Content object. See
     * {{#crossLink "ContentService/addRelation"}}ContentService.addRelation{{/crossLink}}
     *
     * @class RelationCreateStruct
     * @constructor
     * @param destination {String} reference to the resource we want to make related
     */
    var RelationCreateStruct = function (destination) {
        this.body = {};
        this.body.RelationCreate = {};
        this.body.RelationCreate.Destination = {
            _href: destination
        };

        this.headers = {};
        this.headers.Accept = "application/vnd.ez.api.Relation+json";
        this.headers["Content-Type"] = "application/vnd.ez.api.RelationCreate+json";

        return this;
    };

    return RelationCreateStruct;

});