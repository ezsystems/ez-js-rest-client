var ConnectionManager = (function() {
    "use strict";

    /**
     * Creates an instance of connection manager object
     *
     * @constructor
     * @param endPointUrl {string} url to REST root
     * @param authenticationAgent {object} literal object used to maintain authentication to REST server
     * @param connectionType {string} string related to one of the special connection objects used to implement exact technique ("XHR", "JSONP" etc.)
     */
    var ConnectionManager = function(endPointUrl, authenticationAgent) {

        var endPointUrl = endPointUrl;
        var authenticationAgent = authenticationAgent;

        // Array of connections, should be filled-in in preferred order
        //TODO: consider moving to some sort of configuration file...
        var connectionStack = [ConnectionXHR];

        // Choosing and creating first compatible connection from connection stack
        for (var index = 0; index < connectionStack.length; ++index) {
            if (connectionStack[index].isCompatible()) {
                var connection = new connectionStack[index](authenticationAgent);
                break;
            }
        }

        /**
         * Basic request function
         *
         * @method request
         * @param method {string} request method ("POST", "GET" etc)
         * @param url {string} requested REST resource
         * @param data {JSON}
         * @param headers {object}
         * @param callback {function} function, which will be executed on request success
         */
        this.request = function(method, url, data, headers, callback) {

            // default values for all the parameters
            method = (typeof method === "undefined") ? "GET" : method;
            url = (typeof url === "undefined") ? "/" : url;
            data = (typeof data === "undefined") ? "" : data;
            headers = (typeof headers === "undefined") ? {} : headers;
            callback = (typeof callback === "undefined") ? function(){} : callback;


            //TODO: Suspend Requests during Authentication
            connection.sendRequest(method, endPointUrl + url, data, headers, callback);
        };
    };

    return ConnectionManager;

}());