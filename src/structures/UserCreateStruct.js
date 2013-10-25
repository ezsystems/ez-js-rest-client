/* global define */
define(function () {
    "use strict";

    /**
     * Returns a structure used to create a new User. See UserService.createUser() call
     *
     * @class UserCreateStruct
     * @constructor
     * @param languageCode {String} The language code (eng-GB, fre-FR, ...)
     * @param login {String} login for a new user
     * @param email {String} email for a new user
     * @param password {String} password for a new user
     * @param fields {Array} fields array (see example for "newUserGroupCreateStruct")
     */
    var UserCreateStruct = function (languageCode, login, email, password, fields) {
        this.body = {};
        this.body.UserCreate = {};

        this.body.UserCreate.mainLanguageCode = languageCode;
        this.body.UserCreate.login = login;
        this.body.UserCreate.email = email;
        this.body.UserCreate.password = password;

        this.body.UserCreate.fields = {};
        this.body.UserCreate.fields.field = fields;

        this.headers = {};
        this.headers.Accept = "application/vnd.ez.api.User+json";
        this.headers["Content-Type"] = "application/vnd.ez.api.UserCreate+json";

        return this;
    };

    return UserCreateStruct;

});