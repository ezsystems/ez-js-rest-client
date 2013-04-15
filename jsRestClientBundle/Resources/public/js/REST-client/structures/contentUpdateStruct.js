var ContentUpdateStruct = (function() {
    "use strict";

    var updateStruct = function(languageCode, user){

        var now = new Date();

        var struct = {
            "VersionUpdate": {
                "user": user,
                "modificationDate": now.format("isoDateTime"),
                "initialLanguageCode": languageCode,
                "fields": {
                    "field": []
                }
            }
        }

        return struct;

    }

    return updateStruct;

}());