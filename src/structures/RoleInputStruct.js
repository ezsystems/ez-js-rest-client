/* global define */
define(function () {
    "use strict";

    /**
     * Returns a structure used to create and update a Role. See
     * {{#crossLink "UserService/createRole"}}UserService.createRole{{/crossLink}}
     *
     * @class RoleInputStruct
     * @constructor
     * @param identifier {String} unique Role identifier
     */
    var RoleInputStruct = function (identifier) {
        this.body = {};
        this.body.RoleInput = {};

        this.body.RoleInput.identifier = identifier;

        this.headers = {};
        this.headers.Accept = "application/vnd.ez.api.Role+json";
        this.headers["Content-Type"] = "application/vnd.ez.api.RoleInput+json";

        return this;
    };

    return RoleInputStruct;

});