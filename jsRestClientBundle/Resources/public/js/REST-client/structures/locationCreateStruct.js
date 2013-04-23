var LocationCreateStruct = (function() {
    "use strict";

    var LocationCreateStruct = function(parentLocationId){

        var struct = {
            "LocationCreate": {
                "ParentLocation": {
                    "_href": parentLocationId
                },
                "priority": "0",
                "hidden": "false",
                "remoteId" : null,
                "sortField": "PATH",
                "sortOrder": "ASC"
            }
        }

        return struct;

    }

    return LocationCreateStruct;

}());