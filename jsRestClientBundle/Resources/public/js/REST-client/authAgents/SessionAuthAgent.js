var SessionAuthAgent = (function() {
    "use strict";

    /**
     * Creates an instance of SessionAuthAgent object
     *
     * @constructor
     * @param credentials {object}
     */
    var SessionAuthAgent = function (credentials) {

        // for now is initiated inside CAPI constructor
        this.CAPI = null;

        // Private (should be!) area
        this.login_ = credentials.login;
        this.password_ = credentials.password;

        //TODO: implement storage selection mechanism
        this.sessionName = sessionStorage.getItem('ezpRestClient.sessionName');
        this.sessionId = sessionStorage.getItem('ezpRestClient.sessionId');
        this.csrfToken = sessionStorage.getItem('ezpRestClient.csrfToken');

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
        if (this.sessionId === null) {

            var that = this;

            var userService = this.CAPI.getUserService();

            var sessionCreateStruct = userService.newSessionCreateStruct(
                this.login_,
                this.password_
            )

            // TODO: change hardcoded "sessions" path to discovered
            userService.createSession(
                "/api/ezp/v2/user/sessions",
                sessionCreateStruct,
                function(error, sessionResponse){
                    if (!error){

                        console.log(sessionResponse);

                        var session = JSON.parse(sessionResponse.body).Session;

                        that.sessionName = session.name;
                        that.sessionId = session._href;
                        that.csrfToken = session.csrfToken;

                        sessionStorage.setItem('ezpRestClient.sessionName', that.sessionName);
                        sessionStorage.setItem('ezpRestClient.sessionId', that.sessionId);
                        sessionStorage.setItem('ezpRestClient.csrfToken', that.csrfToken);

                        done(false, true);

                    } else {
                        console.log(error, session);
                    }
                }
            );

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

        request.headers["X-CSRF-Token"] = this.csrfToken;

        done(false, request);

    }

    /**
     * Log out workflow
     * Kills currently active session and resets sessionStorage params (sessionId, CSRFToken)
     *
     * @method logOut
     * @param done {function}
     */
    SessionAuthAgent.prototype.logOut = function(done) {

        var userService = this.CAPI.getUserService();
        var that = this;

        userService.deleteSession(
            this.sessionId,
            function(error, response){
                if (!error){

                    that.sessionName = null;
                    that.sessionId = null;
                    that.csrfToken = null;

                    sessionStorage.removeItem('ezpRestClient.sessionName');
                    sessionStorage.removeItem('ezpRestClient.sessionId');
                    sessionStorage.removeItem('ezpRestClient.csrfToken');

                    done(false, true);

                } else {
                    done(true, false);
                }
            }
        );
    }



    return SessionAuthAgent;

}());