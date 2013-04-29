var SessionAuthAgent = (function() {
    "use strict";

    /**
     * Creates an instance of SessionAuthAgent object
     *
     * @constructor
     * @param credentials {object}
     */
    var SessionAuthAgent = function (credentials) {

        // Private (should be!) area
        this.user = credentials.user;
        this.password = credentials.password;

        this.sessionName = null;
        this.sessionId = null;
        this.csrfToken = null;

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
    SessionAuthAgent.prototype.ensureAuthentication = function(done) {
        if (!this.sessionId) {


        } else {
            done(false, true);
        }


    }

    /**
     * Hook to allow the modification of any request, for authentication purposes, before
     * sending it out to the backend
     *
     * @method authenticateRequest
     * @param request {Request}
     * @param done {function}
     */
    SessionAuthAgent.prototype.authenticateRequest = function(request, done) {

//        request.httpBasicAuth = true;
//        request.user = this.user;
//        request.password = this.password;

        done(false, request);
    }

    return SessionAuthAgent;

}());