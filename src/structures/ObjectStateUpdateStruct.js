/* global define */
define(function () {
    "use strict";

    /**
     * Returns a structure used to update an Object State. See
     * {{#crossLink "ContentService/updateObjectState"}}ContentService.updateObjectState{{/crossLink}}
     *
     * @class ObjectStateUpdateStruct
     * @constructor
     */
    var ObjectStateUpdateStruct = function () {
        this.body = {};
        this.body.ObjectStateUpdate = {};

        this.headers = {};
        this.headers.Accept = "application/vnd.ez.api.ObjectState+json";
        this.headers["Content-Type"] = "application/vnd.ez.api.ObjectStateUpdate+json";

        return this;
    };

    return ObjectStateUpdateStruct;

});