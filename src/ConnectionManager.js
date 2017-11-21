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
     * @param [siteAccess] {String} SiteAccess to use for requests
     */
    var ConnectionManager = function (endPointUrl, authenticationAgent, connectionFactory, siteAccess, token) {
        this._endPointUrl = endPointUrl;
        this._authenticationAgent = authenticationAgent;
        this._connectionFactory = connectionFactory;
        this._siteAccess = siteAccess;
        this._token = token;

        this._requestsQueue = [];
        this._authInProgress = false;

        this.logRequests = false;
    };

    /**
     * Basic request function
     *
     * @method request
     * @param [method="GET"] {String} request method ("POST", "GET" etc)
     * @param [url="/"] {String} requested REST resource
     * @param [body=""] {String} a string which should be passed in request body to the REST service
     * @param [headers={}] {object} object literal describing request headers
     * @param [requestEventHandlers] {Object} a set of callbacks to apply on a specific XHR event like onload, onerror, onprogress, etc.
     * @param callback {Function} function, which will be executed on request success
     * @example
     *      var connectionManager = jsCAPI.getConnectionManager();
     *
     *      connectionManager.request(
     *          'GET',
     *          '/endpoint',
     *          '',
     *          {Accept: 'application/json'},
     *          {
     *              upload: {
     *                  onloadstart: someUploadCallback,
     *                  onload: someUploadCallback,
     *                  onloadend: someUploadCallback,
     *                  onprogress: someUploadCallback,
     *                  onabort: someUploadCallback,
     *                  onerror: someUploadCallback,
     *                  ontimeout: someUploadCallback,
     *              },
     *              onloadstart: someCallback,
     *              onload: someCallback,
     *              onloadend: someCallback,
     *              onprogress: someCallback,
     *              onabort: someCallback,
     *              onerror: someCallback,
     *              ontimeout: someCallback,
     *          },
     *          callback
     *      );
     */
    ConnectionManager.prototype.request = function (method, url, body, headers, requestEventHandlers, callback) {
        var that = this,
            request,
            nextRequest,
            defaultMethod = "GET",
            defaultUrl = "/",
            defaultBody = "",
            defaultHeaders = {},
            defaultRequestEventHandlers = {};

        // default values for omitted parameters (if any)
        if (arguments.length < 6) {
            if (typeof method === 'function') {
                // no optional parameteres are passed
                callback = method;
                method = defaultMethod;
                url = defaultUrl;
                body = defaultBody;
                headers = defaultHeaders;
                requestEventHandlers = defaultRequestEventHandlers;
            } else if (typeof url === 'function') {
                // only first 1 optional parameter is passed
                requestEventHandlers = body;
                callback = url;
                url = defaultUrl;
                body = defaultBody;
                headers = defaultHeaders;
                requestEventHandlers = defaultRequestEventHandlers;
            } else if (typeof body === 'function') {
                // only first 2 optional parameters are passed
                callback = body;
                body = defaultBody;
                headers = defaultHeaders;
                requestEventHandlers = defaultRequestEventHandlers;
            } else if (typeof headers === 'function') {
                // only first 3 optional parameters are passed
                callback = headers;
                headers = defaultHeaders;
                requestEventHandlers = defaultRequestEventHandlers;
            } else if (typeof requestEventHandlers === 'function') {
                // only first 4 optional parameters are passed
                callback = requestEventHandlers;
                requestEventHandlers = defaultRequestEventHandlers;
            }
        }

        if (this._siteAccess) {
            headers['X-Siteaccess'] = this._siteAccess;
        }

        if (this._token) {
            headers['X-CSRF-Token'] = this._token;
        }

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
                function (error, success) {
                    if (error) {
                        that._authInProgress = false;
                        callback(error, false);
                        return;
                    }

                    that._authInProgress = false;

                    // emptying requests Queue
                    /*jshint boss:true */
                    /*jshint -W083 */
                    while (nextRequest = that._requestsQueue.shift()) {
                        that._authenticationAgent.authenticateRequest(
                            nextRequest,
                            function (error, authenticatedRequest) {
                                if (error) {
                                    callback(
                                        new CAPIError(
                                            "An error occurred during request authentication.",
                                            {request: nextRequest}
                                        ),
                                        false
                                    );
                                    return;
                                }

                                if (that.logRequests) {
                                    console.dir(request);
                                }
                                // Main goal
                                that._connectionFactory.createConnection().execute(authenticatedRequest, requestEventHandlers, callback);
                            }
                        );
                    } // while
                    /*jshint +W083 */
                    /*jshint boss:false */
                }
            );
        }
    };

    /**
     * Not authorized request function
     * Used mainly for initial requests (e.g. createSession)
     *
     * @method notAuthorizedRequest
     * @param [method="GET"] {String} request method ("POST", "GET" etc)
     * @param [url="/"] {String} requested REST resource
     * @param [body=""] {String} a string which should be passed in request body to the REST service
     * @param [headers={}] {object} object literal describing request headers
     * @param callback {Function} function, which will be executed on request success
     */
    ConnectionManager.prototype.notAuthorizedRequest = function (method, url, body, headers, callback) {
        var request, that = this,
            defaultMethod = "GET",
            defaultUrl = "/",
            defaultBody = "",
            defaultHeaders = {};

        // default values for omitted parameters (if any)
        if (arguments.length < 5) {
            if (typeof method == "function") {
                //no optional parameteres are passed
                callback = method;
                method = defaultMethod;
                url = defaultUrl;
                body = defaultBody;
                headers = defaultHeaders;
            } else if (typeof url == "function") {
                // only first 1 optional parameter is passed
                callback = url;
                url = defaultUrl;
                body = defaultBody;
                headers = defaultHeaders;
            } else if (typeof body == "function") {
                // only first 2 optional parameters are passed
                callback = body;
                body = defaultBody;
                headers = defaultHeaders;
            } else {
                // only first 3 optional parameters are passed
                callback = headers;
                headers = defaultHeaders;
            }
        }

        if (this._siteAccess) {
            headers['X-Siteaccess'] = this._siteAccess;
        }

        request = new Request({
            method: method,
            url: this._endPointUrl + url,
            body: body,
            headers: headers
        });

        if (this.logRequests) {
            console.dir(request);
        }

        this._authenticationAgent.authenticateRequest(request, function (err, request) {
            that._connectionFactory.createConnection().execute(request, callback);
        });
    };

    return ConnectionManager;
});
