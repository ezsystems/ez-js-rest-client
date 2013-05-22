var UserGroupCreateStruct = (function() {
    "use strict";

    /**
     *  Creates a create structure for UserGroup
     *
     * @constructor
     * @param identifier {string}
     * @param languageCode {string}
     * @param names {Array} multiLanguageValuesType in JSON format
     */
    var UserGroupCreateStruct = function(languageCode, fields){

        this.body = {};
        this.body.UserGroupCreate = {};

        this.body.UserGroupCreate.mainLanguageCode = languageCode;

        this.body.UserGroupCreate.fields = {};
        this.body.UserGroupCreate.fields.field = fields;

        this.headers = {};
        this.headers["Accept"] = "application/vnd.ez.api.UserGroup+json";
        this.headers["Content-Type"] = "application/vnd.ez.api.UserGroupCreate+json";

        return this;

    }

    return UserGroupCreateStruct;

}());