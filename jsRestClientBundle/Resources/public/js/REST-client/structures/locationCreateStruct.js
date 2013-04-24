var LocationCreateStruct = (function() {
    "use strict";

    var LocationCreateStruct = function(parentLocationId){

        this.LocationCreate = {};

        this.LocationCreate.ParentLocation = {
            "_href": parentLocationId
        };

        this.LocationCreate.priority = "0";
        this.LocationCreate.hidden = "false";
        this.LocationCreate.remoteId = null;
        this.LocationCreate.sortField = "PATH";
        this.LocationCreate.sortOrder = "ASC";

        return this;

    }

    return LocationCreateStruct;

}());