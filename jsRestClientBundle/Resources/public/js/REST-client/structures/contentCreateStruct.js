var ContentCreateStruct = (function() {
    "use strict";

    var ContentCreateStruct = function(contentTypeId, locationCreateStruct, languageCode, user){

        var now = JSON.parse(JSON.stringify(new Date()));

        this.ContentCreate = {};

        this.ContentCreate.ContentType = {
                "_href" : contentTypeId
            };

        this.ContentCreate.mainLanguageCode = languageCode;
        this.ContentCreate.LocationCreate = locationCreateStruct.LocationCreate;

        this.ContentCreate.Section = null;
        this.ContentCreate.User = user;
        this.ContentCreate.alwaysAvailable = "true";
        this.ContentCreate.remoteId = null;
        this.ContentCreate.modificationDate = now;
        this.ContentCreate.fields = {
            "field": []
        };

        return this;
    }

    return ContentCreateStruct;

}());