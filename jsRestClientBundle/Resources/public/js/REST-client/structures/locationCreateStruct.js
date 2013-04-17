var LocationCreateStruct = (function() {
    "use strict";

    var createStruct = function(parentLocationId){

        var now = new Date();

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

    return createStruct;

}());