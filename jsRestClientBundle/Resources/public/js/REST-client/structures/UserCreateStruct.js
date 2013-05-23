var UserCreateStruct = (function() {
    "use strict";

    /**
     *  Returns a create structure for User
     *
     * @constructor
     * @param languageCode {string}
     * @param login {string}
     * @param email {string}
     * @param password {string}
     * @param fields {Array}
     */
    var UserCreateStruct = function(languageCode, login, email, password, fields){

        this.body = {};
        this.body.UserCreate = {};

        this.body.UserCreate.mainLanguageCode = languageCode;
        this.body.UserCreate.login = login;
        this.body.UserCreate.email = email;
        this.body.UserCreate.password = password;

        this.body.UserCreate.fields = {};
        this.body.UserCreate.fields.field = fields;

        this.headers = {};
        this.headers["Accept"] = "application/vnd.ez.api.User+json";
        this.headers["Content-Type"] = "application/vnd.ez.api.UserCreate+json";

        return this;

    }

    return UserCreateStruct;

}());