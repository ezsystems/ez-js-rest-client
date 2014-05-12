/* global define */
define(function () {
    "use strict";

    /**
     * Creates an instance of HttpBasicAuthAgent object
     * Auth agent handles low level implementation of authorization workflow
     *
     * @class HttpBasicAuthAgent
     * @constructor
     * @param [credentials] {Object} object literal containg credentials for the REST service access
     * @param credentials.login {String} user login
     * @param credentials.password {String} user password
     */
    var HttpBasicAuthAgent = function (credentials) {
        /**
         * The login
         *
         * @property _login
         * @type {String}
         * @default ""
         * @protected
         */
        this._login = '';

        /**
         * The password
         *
         * @property _password
         * @type {String}
         * @default ""
         * @protected
         */
        this._password = '';

        if ( credentials ) {
            this.setCredentials(credentials);
        }
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
     * Log out
     * No actual logic for HTTP Basic Auth
     *
     * @method logOut
     * @param done {function}
     */
    HttpBasicAuthAgent.prototype.logOut = function (done) {
        done(false, true);
    };

    /**
     * Checks whether the user is logged in. For HttpBasicAuthAgent, it actually
     * tries to load the root resource with the provided credentials.
     *
     * @method isLoggedIn
     * @param {Function} done
     */
    HttpBasicAuthAgent.prototype.isLoggedIn = function (done) {
        if ( !this._login || !this._password ) {
            done(true, false);
            return;
        }
        this._CAPI.getContentService().loadRoot(done);
    };

    /**
     * Logs in the user by trying to load the root resource, it is the same as
     * {{#crossLink
     * "HttpBasicAuthAgent/isLoggedIn:method"}}HttpBasicAuthAgent.isLoggedIn{{/crossLink}}
     *
     * @method logIn
     * @param {Function} done
     */
    HttpBasicAuthAgent.prototype.logIn = function (done) {
        this.isLoggedIn(done);
    };

    /**
     * Set the instance of the CAPI to be used by the agent
     *
     * @method setCAPI
     * @param CAPI {CAPI} current instance of the CAPI object
     */
    HttpBasicAuthAgent.prototype.setCAPI = function (CAPI) {
        this._CAPI = CAPI;
    };

    /**
     * Set the credentials
     *
     * @method setCredentials
     * @param {Object} credentials
     * @param {String} credentials.login
     * @param {String} credentials.password
     */
    HttpBasicAuthAgent.prototype.setCredentials = function (credentials) {
        this._login = credentials.login;
        this._password = credentials.password;
    };

    return HttpBasicAuthAgent;
});
