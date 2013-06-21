var ContentUpdateStruct = (function() {
    "use strict";

    var ContentUpdateStruct = function(languageCode, user){

        var now = JSON.parse(JSON.stringify(new Date()));

        this.body = {};
        this.body.VersionUpdate = {};

        this.body.VersionUpdate.user = user;
        this.body.VersionUpdate.modificationDate = now;
        this.body.VersionUpdate.initialLanguageCode = languageCode;
        this.body.VersionUpdate.fields = {
            "field": []
        };

        this.headers = {
            "Accept" : "application/vnd.ez.api.Version+json",
            "Content-Type" : "application/vnd.ez.api.VersionUpdate+json"
        };

        return this;

    };

    return ContentUpdateStruct;

}());