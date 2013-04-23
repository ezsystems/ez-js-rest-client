var ContentCreateStruct = (function() {
    "use strict";

    var ContentCreateStruct = function(contentTypeId, locationCreateStruct, languageCode, user){

        var now = JSON.parse(JSON.stringify(new Date()));

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
                "modificationDate": now,
                "fields": {
                    "field": []
                }
            }
        }

        return struct;

    }

    return ContentCreateStruct;

}());