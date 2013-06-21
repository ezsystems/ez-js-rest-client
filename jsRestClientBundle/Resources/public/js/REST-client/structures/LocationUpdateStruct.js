var LocationUpdateStruct = (function() {
    "use strict";

    var LocationUpdateStruct = function(){

        this.body = {};
        this.body.LocationUpdate = {};

        this.body.LocationUpdate.sortField = "PATH";
        this.body.LocationUpdate.sortOrder = "ASC";

        this.headers = {
            "Accept" : "application/vnd.ez.api.Location+json",
            "Content-Type" : "application/vnd.ez.api.LocationUpdate+json"
        };

        return this;

    };

    return LocationUpdateStruct;

}());