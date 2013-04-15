var RestConnectionManager = (function() {
    "use strict";

    /**
     * Creates an instance of connection manager object
     *
     * @constructor
     * @param endPointUrl {string} url to REST root
     * @param authenticationAgent {object} literal object used to maintain authentication to REST server
     * @param connectionType {string} string related to one of the special connection objects used to implement exact technique ("XHR", "JSONP" etc.)
     */
    var connectionManager = function(endPointUrl, authenticationAgent, connectionType) {


        var endPointUrl = endPointUrl;
        var authenticationAgent = authenticationAgent;

        // Choosing and creating connection of requested type
        if (connectionType === "XHR"){
            var connection = new ConnectionXHR(authenticationAgent);
        } else if (connectionType === "JSONP") {
            // some other connection
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

    return connectionManager;

}());