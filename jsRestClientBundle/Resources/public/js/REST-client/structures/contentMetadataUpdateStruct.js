var ContentMetadataUpdateStruct = (function() {
    "use strict";

    var ContentMetadataUpdateStruct = function(languageCode, user){

        var now = JSON.parse(JSON.stringify(new Date()));

        var struct = {
            "ContentUpdate" : {
                "MainLanguageCode" : languageCode,
                "Section" : null,
// TODO: find a way to initialize MainLocation with empty value (for now neither "null", nor "" don't work)
//                "MainLocation" : null,
                "Owner" : user,
                "alwaysAvailable" : "true",
                "remoteId" : null,
                "modificationDate" : now,
                "publishDate" : null
            }
        }

        return struct;

    }

    return ContentMetadataUpdateStruct;

}());