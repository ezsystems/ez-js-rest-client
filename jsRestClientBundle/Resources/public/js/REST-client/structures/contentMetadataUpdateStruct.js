var ContentMetadataUpdateStruct = (function() {
    "use strict";

    var ContentMetadataUpdateStruct = function(languageCode, user){

        var now = JSON.parse(JSON.stringify(new Date()));

        this.ContentUpdate = {};

        this.ContentUpdate.MainLanguageCode = languageCode;
        this.ContentUpdate.Section = null;
        this.ContentUpdate.Owner = user;
        this.ContentUpdate.alwaysAvailable = "true";
        this.ContentUpdate.remoteId = null;
        this.ContentUpdate.modificationDate = now;
        this.ContentUpdate.publishDate = null;

        // TODO: find a way to initialize MainLocation with empty value (for now neither "null", nor "" don't work)
//        this.ContentUpdate.MainLocation = null;

        return this;

    }

    return ContentMetadataUpdateStruct;

}());