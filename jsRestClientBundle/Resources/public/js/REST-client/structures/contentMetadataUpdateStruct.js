var ContentMetadataUpdateStruct = (function() {
    "use strict";

    var ContentMetadataUpdateStruct = function(languageCode, user){

        var now = JSON.parse(JSON.stringify(new Date()));

        this.body = {};
        this.body.ContentUpdate = {};

        this.body.ContentUpdate.MainLanguageCode = languageCode;
        this.body.ContentUpdate.Section = null;
        this.body.ContentUpdate.Owner = user;
        this.body.ContentUpdate.alwaysAvailable = "true";
        this.body.ContentUpdate.remoteId = null;
        this.body.ContentUpdate.modificationDate = now;
        this.body.ContentUpdate.publishDate = null;

        // TODO: find a way to initialize MainLocation with empty value (for now neither "null", nor "" don't work)
//        this.body.ContentUpdate.MainLocation = null;

        this.headers = {
            "Accept" : "application/vnd.ez.api.ContentInfo+json",
            "Content-Type" : "application/vnd.ez.api.ContentUpdate+json"
        }

        return this;

    }

    return ContentMetadataUpdateStruct;

}());