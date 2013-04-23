var XmlHttpRequestConnection = (function() {
    "use strict";

    /**
     * Creates an instance of XmlHttpRequestConnection object
     *
     * @constructor
     */
    var XmlHttpRequestConnection = function () {

        // Private area
        var user = "admin";
        var password = "admin";
        var authMethod = "HTTPBasicAuth";

        this.xhr_ = new XMLHttpRequest();

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
        this.execute = function(method, url, data, headers, callback) {

            var XHR = this.xhr_;

            // Create the state change handler:
            XHR.onreadystatechange = function() {
                if (XHR.readyState != 4) return; // Not ready yet
                if (XHR.status >= 400) {
                    callback(XHR.status, false);
                    return;
                }
                // Request successful
                callback(false, XHR.responseText);
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

    // static method
    XmlHttpRequestConnection.isCompatible = function(){
        return !!window.XMLHttpRequest;
    }

    return XmlHttpRequestConnection;


}());