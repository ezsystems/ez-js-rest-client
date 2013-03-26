var RestConnectionManager = (function() {
    "use strict";


    var connectionManager = function(endPointUrl, authenticationAgent, connection) {

        var endPointUrl = endPointUrl;

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
            data = (typeof data === "undefined") ? {} : data;
            headers = (typeof headers === "undefined") ? {} : headers;
            callback = (typeof callback === "undefined") ? function(){} : callback;

            //manage authentication
            // ...

            //TODO: Suspend Requests during Authentication
            connection.sendRequest(method, endPointUrl + url, data, headers, callback);
        };
    };

    return connectionManager;

}());