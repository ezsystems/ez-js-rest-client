var ContentTypeGroupInputStruct = (function() {
    "use strict";

    var ContentTypeGroupInputStruct = function(identifier, languageCode){

        this.body = {};
        this.body.ContentTypeGroupInput = {};

        this.body.ContentTypeGroupInput.identifier = identifier;
        this.body.ContentTypeGroupInput.mainLanguageCode = languageCode;

        this.headers = {};
        this.headers["Accept"] = "application/vnd.ez.api.ContentTypeGroup+json";
        this.headers["Content-Type"] = "application/vnd.ez.api.ContentTypeGroupInput+json";

        return this;
    }

    return ContentTypeGroupInputStruct;

}());