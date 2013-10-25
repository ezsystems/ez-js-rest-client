/* global define */
define(function () {
    "use strict";

    /**
     * Creates an instance of HttpBasicAuthAgent object
     * Auth agent handles low level implementation of authorization workflow
     *
     * @class HttpBasicAuthAgent
     * @constructor
     * @param credentials {Object} object literal containg credentials for the REST service access
     * @param credentials.login {String} user login
     * @param credentials.password {String} user password
     */
    var HttpBasicAuthAgent = function (credentials) {

        this.CAPI = null;

        // Private (should be!) area
        this._login = credentials.login;
        this._password = credentials.password;

    };

    /**
     * Called every time a new request cycle is started,
     * to ensure those requests are correctly authenticated.
     *
     * A cycle may contain one or more queued up requests
     *
     * @method ensureAuthentication
     * @param done {Function} Callback function, which is to be called by the implementation
     * to signal the authentication has been completed.
     */
    HttpBasicAuthAgent.prototype.ensureAuthentication = function (done) {
        // ... empty for basic auth?
        done(false, true);
    };

    /**
     * Hook to allow the modification of any request, for authentication purposes, before
     * sending it out to the backend
     *
     * @method authenticateRequest
     * @param request {Request}
     * @param done {function}
     */
    HttpBasicAuthAgent.prototype.authenticateRequest = function (request, done) {

        request.httpBasicAuth = true;
        request.login = this._login;
        request.password = this._password;

        done(false, request);

    };

    /**
     * Log out workflow
     * No actual logic for HTTP Basic Auth
     *
     * @method logOut
     * @param done {function}
     */
    HttpBasicAuthAgent.prototype.logOut = function (done) {
        done(false, true);
    };

    return HttpBasicAuthAgent;

});