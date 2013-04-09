var ConnectionXHR = (function() {
    "use strict";

    /**
     * Creates an instance of XHR connection object
     *
     * @constructor
     */
    var connection = function (authenticationAgent) {

        // Private area
        var user = authenticationAgent.user;
        var password = authenticationAgent.password;
        var authMethod = authenticationAgent.authMethod;


        var getXHR = function(){
            var result = null;
            if (window.XMLHttpRequest) {
                // FireFox, Safari, etc.
                result = new XMLHttpRequest();
            }
            else if (window.ActiveXObject) {
                // MSIE Old versions
                result = new ActiveXObject("Microsoft.XMLHTTP");
            }
            else {
                console.log("No known mechanism to build XHR!");
            }
            return result;
        };


        /**
         * Basic request implemented via XHR technique
         *
         * @method request
         * @param method {string} request method ("POST", "GET" etc)
         * @param url {string} requested REST resource
         * @param data {JSON}
         * @param headers {object}
         * @param callback {function} function, which will be executed on request success
         */
        this.sendRequest = function(method, url, data, headers, callback) {
            var XHR = getXHR();

            // Create the state change handler:
            XHR.onreadystatechange = function() {
                if (XHR.readyState != 4) return; // Not ready yet
                if ((XHR.status < 200) && (XHR.status > 204)) {
                    console.log("Request failed!");
                    return;
                }
                // Request successful
                callback(XHR.responseText);
            };

            // Authentication, if possible and opening connection
            if (authMethod === "HTTPBasicAuth"){
                // Http basic authentication
                if ( (typeof user !== "undefined") && (typeof password !== "undefined") ) {
                    XHR.open(method, url, true, user, password);
                } else {
                    console.error("Incorrect or not full credentials for HTTP Basic Authentication.");
                }
            } else {
                // No specific authentication method
                XHR.open(method, url, true);
            }

            for (var headerType in headers) {
                XHR.setRequestHeader(
                    headerType,
                    headers[headerType]
                );
            }

            XHR.send(data);
        };
    };

    return connection;


}());