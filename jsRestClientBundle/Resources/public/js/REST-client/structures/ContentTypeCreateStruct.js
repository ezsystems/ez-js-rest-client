var ContentTypeCreateStruct = (function() {
    "use strict";

    var ContentTypeCreateStruct = function(identifier, languageCode, names){

        var now = JSON.parse(JSON.stringify(new Date()));

        this.body = {};
        this.body.ContentTypeCreate = {};

        this.body.ContentTypeCreate.identifier = identifier;

        this.body.ContentTypeCreate.names = {};
        this.body.ContentTypeCreate.names.value = names;

        this.body.ContentTypeCreate.nameSchema = "&lt;title&gt;";
        this.body.ContentTypeCreate.urlAliasSchema = "&lt;title&gt;";

        this.body.ContentTypeCreate.remoteId = null;
        this.body.ContentTypeCreate.mainLanguageCode = languageCode;
        this.body.ContentTypeCreate.isContainer = "true";
        this.body.ContentTypeCreate.modificationDate = now;

        this.body.ContentTypeCreate.defalutAlwaysAvailable = "true";
        this.body.ContentTypeCreate.defalutSortField = "PATH";
        this.body.ContentTypeCreate.defalutSortOrder = "ASC";

        this.body.ContentTypeCreate.FieldDefinitions = {};
        this.body.ContentTypeCreate.FieldDefinitions.FieldDefinition = [];

        this.headers = {};
        this.headers.Accept = "application/vnd.ez.api.ContentType+json";
        this.headers["Content-Type"] = "application/vnd.ez.api.ContentTypeCreate+json";

        return this;
    };

    return ContentTypeCreateStruct;

}());