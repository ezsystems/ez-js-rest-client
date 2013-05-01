var HttpBasicAuthAgent = (function() {
    "use strict";

    /**
     * Creates an instance of HttpBasicAuthAgent object
     *
     * @constructor
     * @param credentials {object}
     */
    var HttpBasicAuthAgent = function (credentials) {

        this.CAPI = null;

        // Private (should be!) area
        this.login_ = credentials.login;
        this.password_ = credentials.password;

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
    HttpBasicAuthAgent.prototype.ensureAuthentication = function(done) {
        // ... empty for basic auth?
    }

    /**
     * Hook to allow the modification of any request, for authentication purposes, before
     * sending it out to the backend
     *
     * @method authenticateRequest
     * @param request {Request}
     * @param done {function}
     */
    HttpBasicAuthAgent.prototype.authenticateRequest = function(request, done) {

        request.httpBasicAuth = true;
        request.login = this.login_;
        request.password = this.password_;

        done(false, request);
    }

    return HttpBasicAuthAgent;


}());