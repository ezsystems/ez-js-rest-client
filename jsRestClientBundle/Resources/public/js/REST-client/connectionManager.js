var ConnectionManager = (function() {
    "use strict";

    /**
     * Creates an instance of connection manager object
     *
     * @constructor
     * @param endPointUrl {string} url to REST root
     * @param authenticationAgent {object} literal object used to maintain authentication to REST server
     */
    var ConnectionManager = function(endPointUrl, authenticationAgent, connectionFactory) {

        this.endPointUrl_ = endPointUrl;
        this.authenticationAgent_ = authenticationAgent;

        this.activeConnection_ = connectionFactory.createConnection();

        this.logRequests = false;

    };

    /**
     * Basic request function
     *
     * @method request
     * @param method {string} request method ("POST", "GET" etc)
     * @param url {string} requested REST resource
     * @param body {JSON}
     * @param headers {object}
     * @param callback {function} function, which will be executed on request success
     */
    ConnectionManager.prototype.request = function(method, url, body, headers, callback) {

        var that = this;

        // default values for all the parameters
        method = (typeof method === "undefined") ? "GET" : method;
        url = (typeof url === "undefined") ? "/" : url;
        body = (typeof body === "undefined") ? "" : body;
        headers = (typeof headers === "undefined") ? {} : headers;
        callback = (typeof callback === "undefined") ? function(){} : callback;

        var request = new Request({
            method : method,
            url : this.endPointUrl_ + url,
            body : body,
            headers : headers
        });

        // Check if we are already authenticated, make it happen if not
        this.authenticationAgent_.ensureAuthentication(
            function(error, success){
                // TODO: Suspend Requests during initial authentication
                // TODO: errors handling

                that.authenticationAgent_.authenticateRequest(
                    request,
                    function(error, authenticatedRequest) {
                        if (!error) {

                            if (that.logRequests) {
                                console.log(request);
                            }
                            // Main goal
                            that.activeConnection_.execute(authenticatedRequest, callback);
                        } else {
                            callback(
                                new Error({
                                    errorText : "An error occured during request authentication!"
                                }),
                                new Response({
                                    status : "error",
                                    body : ""
                                })
                            );
                        }
                    }
                );

            }
        );
    };


    /**
     * Not authorized request function
     * Used mainly for initial requests (e.g. createSession)
     *
     * @method notAuthorizedRequest
     * @param method {string} request method ("POST", "GET" etc)
     * @param url {string} requested REST resource
     * @param body {JSON}
     * @param headers {object}
     * @param callback {function} function, which will be executed on request success
     */
    ConnectionManager.prototype.notAuthorizedRequest = function(method, url, body, headers, callback) {

        // default values for all the parameters
        method = (typeof method === "undefined") ? "GET" : method;
        url = (typeof url === "undefined") ? "/" : url;
        body = (typeof body === "undefined") ? "" : body;
        headers = (typeof headers === "undefined") ? {} : headers;
        callback = (typeof callback === "undefined") ? function(){} : callback;

        var request = new Request({
            method : method,
            url : this.endPointUrl_ + url,
            body : body,
            headers : headers
        });

        if (this.logRequests) {
            console.log(request);
        }

        // Main goal
        this.activeConnection_.execute(request, callback);

    };



    /**
     * Delete - shortcut which handles simple deletion requests in most cases
     *
     * @method delete
     * @param url
     * @param callback
     */
    ConnectionManager.prototype.delete = function(url, callback) {

        var that = this;

        // default values for all the parameters
        url = (typeof url === "undefined") ? "/" : url;
        callback = (typeof callback === "undefined") ? function(){} : callback;

        var request = new Request({
            method : "DELETE",
            url : this.endPointUrl_ + url,
            body : "",
            headers : {}
        });

        this.authenticationAgent_.authenticateRequest(
            request,
            function(error, authenticatedRequest) {
                if (!error) {

                    if (that.logRequests) {
                        console.log(request);
                    }
                    // Main goal
                    that.activeConnection_.execute(authenticatedRequest, callback);
                } else {
                    callback(
                        new Error({
                            errorText : "An error occured during request authentication!"
                        }),
                        new Response({
                            status : "error",
                            body : ""
                        })
                    );
                }
            }
        );


    };

    /**
     * logOut - logout workflow
     * Kills currently active session and resets localStorage params (sessionId, CSRFToken)
     *
     * @method logOut
     * @param callback {function}
     */
    ConnectionManager.prototype.logOut = function(callback) {

        this.authenticationAgent_.logOut(callback);

    }



    return ConnectionManager;

}());