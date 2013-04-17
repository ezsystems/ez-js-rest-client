var ContentCreateStruct = (function() {
    "use strict";

    var createStruct = function(contentTypeId, locationCreateStruct, languageCode, user){

        var now = new Date();

        var struct = {
            "ContentCreate": {
                "ContentType": {
                    "_href" : contentTypeId
                },
                "mainLanguageCode": languageCode,
                "LocationCreate" : locationCreateStruct.LocationCreate,
                "Section" : null,
                "User" : user,
                "alwaysAvailable" : "true",
                "remoteId" : null,
                "modificationDate": now.format("isoDateTime"),
                "fields": {
                    "field": []
                }
            }
        }

        return struct;

    }

    return createStruct;

}());