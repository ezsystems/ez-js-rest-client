/* global define */
define(function () {
    "use strict";

    /**
     * Returns a structure used to create a new Session. See UserService.createSession() call
     *
     * @class SessionCreateStruct
     * @constructor
     * @param login {String} login for a user, which wants to start a session
     * @param password {String} password for a user, which wants to start a session
     */
    var SessionCreateStruct = function (login, password) {

        this.body = {};
        this.body.SessionInput = {};

        this.body.SessionInput.login = login;
        this.body.SessionInput.password = password;

        this.headers = {
            "Accept" : "application/vnd.ez.api.Session+json",
            "Content-Type" : "application/vnd.ez.api.SessionInput+json"
        };

        return this;

    };

    return SessionCreateStruct;

});