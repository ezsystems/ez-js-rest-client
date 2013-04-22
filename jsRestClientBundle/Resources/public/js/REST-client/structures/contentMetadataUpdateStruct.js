var ContentMetadataUpdateStruct = (function() {
    "use strict";

    var ContentMetadataUpdateStruct = function(languageCode, user){

        var now = new Date();

        var struct = {
            "ContentUpdate" : {
                "MainLanguageCode" : languageCode,
                "Section" : null,
// TODO: find a way to initialize MainLocation with empty value (for now neither "null", nor "" don't work)
//                "MainLocation" : null,
                "Owner" : user,
                "alwaysAvailable" : "true",
                "remoteId" : null,
                "modificationDate" : now.format("isoDateTime"),
                "publishDate" : null
            }
        }

        return struct;

    }

    return ContentMetadataUpdateStruct;

}());