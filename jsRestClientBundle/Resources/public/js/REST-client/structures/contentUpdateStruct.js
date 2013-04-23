var ContentUpdateStruct = (function() {
    "use strict";

    var ContentUpdateStruct = function(languageCode, user){

        var now = JSON.parse(JSON.stringify(new Date()));

        var struct = {
            "VersionUpdate": {
                "user": user,
                "modificationDate": now,
                "initialLanguageCode": languageCode,
                "fields": {
                    "field": []
                }
            }
        }

        return struct;

    }

    return ContentUpdateStruct;

}());