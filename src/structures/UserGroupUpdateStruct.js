/* global define */
define(function () {
    "use strict";

    /**
     * Returns a structure used to update a User group. See UserService.updateUserGroup() call
     *
     * @class UserGroupUpdateStruct
     * @constructor
     * @param languageCode {String} The language code (eng-GB, fre-FR, ...)
     * @param fields {Array} fields array (see example in UserService.newUserGroupCreateStruct() doc)
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

});