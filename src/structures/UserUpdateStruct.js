/* global define */
define(function () {
    "use strict";

    /**
     * Returns a structure used to update a User. See UserService.updateUser() call
     *
     * @class UserUpdateStruct
     * @constructor
     */
    var UserUpdateStruct = function () {
        this.body = {};
        this.body.UserUpdate = {};

        this.body.UserUpdate.fields = {};
        this.body.UserUpdate.fields.field = [];

        this.headers = {};
        this.headers.Accept = "application/vnd.ez.api.User+json";
        this.headers["Content-Type"] = "application/vnd.ez.api.UserUpdate+json";

        return this;
    };

    return UserUpdateStruct;

});