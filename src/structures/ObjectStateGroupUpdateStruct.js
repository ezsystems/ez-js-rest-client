/* global define */
define(function () {
    "use strict";

    /**
     * Returns a structure used to update an Object State group. See ContentService.updateObjectStateGroup() call
     *
     * @class ObjectStateGroupUpdateStruct
     * @constructor
     */
    var ObjectStateGroupUpdateStruct = function(){

        this.body = {};
        this.body.ObjectStateGroupUpdate = {};

        this.headers = {};
        this.headers.Accept = "application/vnd.ez.api.ObjectStateGroup+json";
        this.headers["Content-Type"] = "application/vnd.ez.api.ObjectStateGroupUpdate+json";

        return this;

    };

    return ObjectStateGroupUpdateStruct;

});