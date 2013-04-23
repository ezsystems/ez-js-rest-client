var ConnectionManager = (function() {
    "use strict";

    /**
     * Creates an instance of connection manager object
     *
     * @constructor
     * @param endPointUrl {string} url to REST root
     * @param authenticationAgent {object} literal object used to maintain authentication to REST server
     */
    var ConnectionManager = function(endPointUrl, authenticationAgent) {

        // Array of connections, should be filled-in in preferred order
        //TODO: consider moving to some sort of configuration file...
        var connectionStack = [
            {
                connection: ConnectionXHR,
                factory: function(Connection){
                    console.log("Hello, from injected factory!");
                    return new Connection();
                }
            }
        ];

        var connectionFeatureFactory = new ConnectionFeatureFactory(connectionStack);

        var activeConnection = connectionFeatureFactory.createConnection();



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
            activeConnection.sendRequest(method, endPointUrl + url, data, headers, callback);
        };
    };

    return ConnectionManager;

}());