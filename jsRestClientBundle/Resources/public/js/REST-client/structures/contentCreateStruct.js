var ContentCreateStruct = (function() {
    "use strict";

    var ContentCreateStruct = function(contentTypeId, locationCreateStruct, languageCode, user){

        var now = JSON.parse(JSON.stringify(new Date()));

        this.body = {};
        this.body.ContentCreate = {};

        this.body.ContentCreate.ContentType = {
                "_href" : contentTypeId
            };

        this.body.ContentCreate.mainLanguageCode = languageCode;
        this.body.ContentCreate.LocationCreate = locationCreateStruct.body.LocationCreate;

        this.body.ContentCreate.Section = null;
        this.body.ContentCreate.User = user;
        this.body.ContentCreate.alwaysAvailable = "true";
        this.body.ContentCreate.remoteId = null;
        this.body.ContentCreate.modificationDate = now;
        this.body.ContentCreate.fields = {};
        this.body.ContentCreate.fields.field = [];

        this.headers = {
            "Accept" : "application/vnd.ez.api.Content+json",
            "Content-Type" : "application/vnd.ez.api.ContentCreate+json"
        }

        return this;
    }

    return ContentCreateStruct;

}());