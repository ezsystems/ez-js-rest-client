/* global define */
define(["structures/CAPIError", "storages/LocalStorage"], function (CAPIError, LocalStorage) {
    "use strict";

    /**
     * Creates an instance of SessionAuthAgent object
     *
     * Auth agent handles low level implementation of authorization workflow
     *
     * @class SessionAuthAgent
     * @constructor
     * @param credentials {Object} object literal containg credentials for the REST service access
     * @param credentials.login {String} user login
     * @param credentials.password {String} user password
     * @param storage {StorageAbstraction?} storage to be used. By default a LocalStorage will be utilized
     */
    var SessionAuthAgent = function (credentials, storage) {
        // is initiated inside CAPI constructor by using setCAPI() method
        this._CAPI = null;

        this._login = credentials.login;
        this._password = credentials.password;


        // StorageAbstraction is optional. Use a LocalStorage by default if nothing else
        // is provided
        this._storage = storage || new LocalStorage();
    };

    /**
     * Constant to be used as storage key for the sessionName
     *
     * @static
     * @const
     * @type {string}
     */
    SessionAuthAgent.KEY_SESSION_NAME = 'ezpRestClient.sessionName';

    /**
     * Constant to be used as storage key for the sessionId
     *
     * @static
     * @const
     * @type {string}
     */
    SessionAuthAgent.KEY_SESSION_ID = 'ezpRestClient.sessionId';

    /**
     * Constant to be used as storage key for the csrfToken
     *
     * @static
     * @const
     * @type {string}
     */
    SessionAuthAgent.KEY_CSRF_TOKEN = 'ezpRestClient.csrfToken';

    /**
     * Called every time a new request cycle is started,
     * to ensure those requests are correctly authenticated.
     *
     * A cycle may contain one or more queued up requests
     *
     * @method ensureAuthentication
     * @param done {Function} Callback function, which is to be called by the implementation to signal the authentication has been completed.
     */
    SessionAuthAgent.prototype.ensureAuthentication = function (done) {
        if (this._storage.getItem(SessionAuthAgent.KEY_SESSION_ID) !== null) {
            done(false, true);
            return;
        }

        var that = this,
            userService = this._CAPI.getUserService(),
            sessionCreateStruct = userService.newSessionCreateStruct(
                this._login,
                this._password
            );

        userService.createSession(
            sessionCreateStruct,
            function (error, sessionResponse) {
                if (error) {
                    done(
                        new CAPIError(
                            "Failed to create new session.",
                            {sessionCreateStruct: sessionCreateStruct}
                        ),
                        false
                    );
                    return;
                }

                var session = JSON.parse(sessionResponse.body).Session;

                that._storage.setItem(SessionAuthAgent.KEY_SESSION_NAME, session.name);
                that._storage.setItem(SessionAuthAgent.KEY_SESSION_ID, session._href);
                that._storage.setItem(SessionAuthAgent.KEY_CSRF_TOKEN, session.csrfToken);

                done(false, true);
            }
        );
    };

    /**
     * Hook to allow the modification of any request, for authentication purposes, before
     * sending it out to the backend
     *
     * @method authenticateRequest
     * @param request {Request}
     * @param done {function}
     */
    SessionAuthAgent.prototype.authenticateRequest = function (request, done) {
        if (request.method !== "GET" && request.method !== "HEAD" && request.method !== "OPTIONS" && request.method !== "TRACE" ) {
            request.headers["X-CSRF-Token"] = this._storage.getItem(SessionAuthAgent.KEY_CSRF_TOKEN);
        }

        done(false, request);
    };

    /**
     * Log out workflow
     * Kills currently active session and resets Storage params (sessionId, CSRFToken)
     *
     * @method logOut
     * @param done {function}
     */
    SessionAuthAgent.prototype.logOut = function (done) {
        var userService = this._CAPI.getUserService(),
            that = this;

        userService.deleteSession(
            this._storage.getItem(SessionAuthAgent.KEY_SESSION_ID),
            function (error, response) {
                if (error) {
                    done(true, false);
                    return;
                }

                that._storage.removeItem(SessionAuthAgent.KEY_SESSION_NAME);
                that._storage.removeItem(SessionAuthAgent.KEY_SESSION_ID);
                that._storage.removeItem(SessionAuthAgent.KEY_CSRF_TOKEN);

                done(false, true);
            }
        );
    };

    /**
     * Set the instance of the CAPI to be used by the agent
     *
     * @method setCAPI
     * @param CAPI {CAPI} current instance of the CAPI object
     */
    SessionAuthAgent.prototype.setCAPI = function (CAPI) {
        this._CAPI = CAPI;
    };

    return SessionAuthAgent;

});
