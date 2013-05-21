var LocationCreateStruct = (function() {
    "use strict";

    var LocationCreateStruct = function(parentLocationId){

        this.body = {};
        this.body.LocationCreate = {};

        this.body.LocationCreate.ParentLocation = {
            "_href": parentLocationId
        };

        this.body.LocationCreate.sortField = "PATH";
        this.body.LocationCreate.sortOrder = "ASC";

        this.headers = {
            "Accept" : "application/vnd.ez.api.Location+json",
            "Content-Type" : "application/vnd.ez.api.LocationCreate+json"
        }

        return this;

    }

    return LocationCreateStruct;

}());