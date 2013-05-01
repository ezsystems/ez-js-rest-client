var LocationUpdateStruct = (function() {
    "use strict";

    var LocationUpdateStruct = function(){

        this.LocationUpdate = {};

        this.LocationUpdate.priority = "0";
        this.LocationUpdate.hidden = "false";
        this.LocationUpdate.remoteId = null;
        this.LocationUpdate.sortField = "PATH";
        this.LocationUpdate.sortOrder = "ASC";

        return this;

    }

    return LocationUpdateStruct;

}());