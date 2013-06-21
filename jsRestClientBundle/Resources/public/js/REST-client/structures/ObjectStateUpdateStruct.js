var ObjectStateUpdateStruct = (function() {
    "use strict";

    /**
     *  Creates an update structure for ObjectState
     *
     * @constructor
     */
    var ObjectStateUpdateStruct = function(){

        this.body = {};
        this.body.ObjectStateUpdate = {};

        this.headers = {};
        this.headers.Accept = "application/vnd.ez.api.ObjectState+json";
        this.headers["Content-Type"] = "application/vnd.ez.api.ObjectStateUpdate+json";

        return this;

    };

    return ObjectStateUpdateStruct;

}());