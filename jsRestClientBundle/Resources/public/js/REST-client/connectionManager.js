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

        var activeConnection = connectionFactory.createConnection();

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
        this.request = function(method, url, body, headers, callback) {

            // default values for all the parameters
            method = (typeof method === "undefined") ? "GET" : method;
            url = (typeof url === "undefined") ? "/" : url;
            body = (typeof body === "undefined") ? "" : body;
            headers = (typeof headers === "undefined") ? {} : headers;
            callback = (typeof callback === "undefined") ? function(){} : callback;

            var request = new Request({
                method : method,
                url : endPointUrl + url,
                body : body,
                headers : headers
            });

            // TODO: Initial authentication
            // TODO: Suspend Requests during initial authentication

            authenticationAgent.authenticateRequest(
                request,
                function(error, authenticatedRequest) {
                    if (!error) {
                        activeConnection.execute(authenticatedRequest, callback);
                    } else {
                        callback(
                            "An error occured during request authentication!",
                            null
                        );
                    }
                }
            );

        };
    };

    return ConnectionManager;

}());