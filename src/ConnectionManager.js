/* global define */
define(["structures/Response", "structures/Request", "structures/CAPIError"],
    function (Response, Request, CAPIError) {
    "use strict";

    /**
     * Creates an instance of connection manager object
     *
     * @class ConnectionManager
     * @constructor
     * @param endPointUrl {String} url to REST root
     * @param authenticationAgent {object} Instance of one of the AuthAgents (e.g. SessionAuthAgent, HttpBasicAuthAgent)
     * @param connectionFactory {ConnectionFeatureFactory}  the factory which is choosing compatible connection from connections list
     */
    var ConnectionManager = function(endPointUrl, authenticationAgent, connectionFactory) {

        this._endPointUrl = endPointUrl;
        this._authenticationAgent = authenticationAgent;
        this._connectionFactory = connectionFactory;

        this._requestsQueue = [];
        this._authInProgress = false;

        this.logRequests = false;

    };

    /**
     * Basic request function
     *
     * @method request
     * @param method {String} request method ("POST", "GET" etc)
     * @param url {String} requested REST resource
     * @param body {JSON}
     * @param headers {object}
     * @param callback {function} function, which will be executed on request success
     */
    ConnectionManager.prototype.request = function(method, url, body, headers, callback) {

        // default values for all the parameters
        method = (typeof method === "undefined") ? "GET" : method;
        url = (typeof url === "undefined") ? "/" : url;
        body = (typeof body === "undefined") ? "" : body;
        headers = (typeof headers === "undefined") ? {} : headers;
        callback = (typeof callback === "undefined") ? function(){} : callback;

        var that = this,
            nextRequest,
            request = new Request({
                method : method,
                url : this._endPointUrl + url,
                body : body,
                headers : headers
            });

        // Requests suspending workflow
        // first, put any request in queue anyway (the queue will be emptied after ensuring authentication)
        this._requestsQueue.push(request);

        // if our request is the first one, or authorization is not in progress, go on
        if (!this._authInProgress || (this._requestsQueue.length === 1)) {

            // queue all other requests, until this one is authenticated
            this._authInProgress = true;

            // check if we are already authenticated, make it happen if not
            this._authenticationAgent.ensureAuthentication(
                function(error, success){
                    if (!error) {

                        that._authInProgress = false;

                        // emptying requests Queue
                        /*jshint boss:true */
                        /*jshint -W083 */
                        while (nextRequest = that._requestsQueue.shift()) {

                            that._authenticationAgent.authenticateRequest(
                                nextRequest,
                                function(error, authenticatedRequest) {
                                    if (!error) {

                                        if (that.logRequests) {
                                            console.dir(request);
                                        }
                                        // Main goal
                                        that._connectionFactory.createConnection().execute(authenticatedRequest, callback);
                                    } else {
                                        callback(
                                            new CAPIError("An error occured during request authentication!"),
                                            false
                                        );
                                    }
                                }
                            );
                        } // while
                        /*jshint +W083 */
                        /*jshint boss:false */

                    } else {

                        that._authInProgress = false;

                        callback(
                            new CAPIError("An error occured during ensureAuthentication call!"),
                            false
                        );
                    }
                }
            );
        }
    };


    /**
     * Not authorized request function
     * Used mainly for initial requests (e.g. createSession)
     *
     * @method notAuthorizedRequest
     * @param method {String} request method ("POST", "GET" etc)
     * @param url {String} requested REST resource
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
            url : this._endPointUrl + url,
            body : body,
            headers : headers
        });

        if (this.logRequests) {
            console.dir(request);
        }

        // Main goal
        this._connectionFactory.createConnection().execute(request, callback);

    };



    /**
     * Delete - shortcut which handles simple deletion requests in most cases
     *
     * @method delete
     * @param url
     * @param callback
     */
    ConnectionManager.prototype.delete = function(url, callback) {

        // default values for all the parameters
        url = (typeof url === "undefined") ? "/" : url;
        callback = (typeof callback === "undefined") ? function(){} : callback;

        this.request(
            "DELETE",
            url,
            "",
            {},
            callback
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

        this._authenticationAgent.logOut(callback);

    };

    return ConnectionManager;

});
