/* global define */
define(function () {
    "use strict";

    /**
     * Returns a structure used to create a new User group. See
     * {{#crossLink "UserService/createUserGroup"}}UserService.createUserGroup{{/crossLink}}
     *
     * @class UserGroupCreateStruct
     * @constructor
     * @param languageCode {String} The language code (eng-GB, fre-FR, ...)
     * @param fields {Array} fields array (see example in
     * {{#crossLink "UserService/newUserGroupCreateStruct"}}UserService.newUserGroupCreateStruct{{/crossLink}})
     */
    var UserGroupCreateStruct = function (languageCode, fields) {
        this.body = {};
        this.body.UserGroupCreate = {};

        this.body.UserGroupCreate.mainLanguageCode = languageCode;

        this.body.UserGroupCreate.fields = {};
        this.body.UserGroupCreate.fields.field = fields;

        this.headers = {};
        this.headers.Accept = "application/vnd.ez.api.UserGroup+json";
        this.headers["Content-Type"] = "application/vnd.ez.api.UserGroupCreate+json";

        return this;
    };

    return UserGroupCreateStruct;

});