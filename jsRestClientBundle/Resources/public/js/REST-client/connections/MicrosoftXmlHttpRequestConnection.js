var MicrosoftXmlHttpRequestConnection = (function() {
    "use strict";

    /**
     * Creates an instance of MicrosoftXmlHttpRequestConnection object
     *
     * @constructor
     */
    var MicrosoftXmlHttpRequestConnection = function () {

        // Private area
        var user = "admin";
        var password = "admin";
        var authMethod = "HTTPBasicAuth";

        this.xhr_ = new ActiveXObject("Microsoft.XMLHTTP");

        /**
         * Basic request implemented via XHR technique
         *
         * @method execute
         * @param request {Request} structure containing all needed params and data
         * @param callback {function} function, which will be executed on request success
         */
        this.execute = function(request, callback) {

            var XHR = this.xhr_;

            // Create the state change handler:
            XHR.onreadystatechange = function() {
                if (XHR.readyState != 4) return; // Not ready yet
                if (XHR.status >= 400) {
                    callback(
                        new Error({
                            errorText : "Connection error : " + XHR.status,
                            errorCode : XHR.status
                        }),
                        XHR.responseText
                    );
                    return;
                }
                // Request successful
                callback(false, XHR.responseText);
            };


            if (request.httpBasicAuth) {
                XHR.open(request.method, request.url, true, request.user, request.password);
            } else {
                XHR.open(request.method, request.url, true);
            }


            for (var headerType in request.headers) {
                XHR.setRequestHeader(
                    headerType,
                    request.headers[headerType]
                );
            }

            XHR.send(request.body);
        };
    };

    // static method
    MicrosoftXmlHttpRequestConnection.isCompatible = function(){
        return !!window.ActiveXObject;
    }

    return MicrosoftXmlHttpRequestConnection;

}());