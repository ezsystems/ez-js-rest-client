var UserGroupUpdateStruct = (function() {
    "use strict";

    /**
     *  Creates an update structure for UserGroup
     *
     * @constructor
     * @param identifier {string}
     * @param languageCode {string}
     * @param names {Array} multiLanguageValuesType in JSON format
     */
    var UserGroupUpdateStruct = function(languageCode, fields){

        this.body = {};
        this.body.UserGroupUpdate = {};

        this.body.UserGroupUpdate.fields = {};
        this.body.UserGroupUpdate.fields.field = [];

        this.headers = {};
        this.headers.Accept = "application/vnd.ez.api.UserGroup+json";
        this.headers["Content-Type"] = "application/vnd.ez.api.UserGroupUpdate+json";

        return this;

    };

    return UserGroupUpdateStruct;

}());