var ContentUpdateStruct = (function() {
    "use strict";

    var ContentUpdateStruct = function(languageCode, user){

        var now = JSON.parse(JSON.stringify(new Date()));

        this.VersionUpdate = {};

        this.VersionUpdate.user = user;
        this.VersionUpdate.modificationDate = now;
        this.VersionUpdate.initialLanguageCode = languageCode;
        this.VersionUpdate.fields = {
            "field": []
        };

        return this;

    }

    return ContentUpdateStruct;

}());