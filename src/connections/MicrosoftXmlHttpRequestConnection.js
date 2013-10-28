/* global define */
/* global ActiveXObject */
define(["structures/Response", "structures/CAPIError"], function (Response, CAPIError) {
    "use strict";

    /**
     * Creates an instance of MicrosoftXmlHttpRequestConnection object
     * This connection class handles low-level implementation of XHR connection for Microsoft browsers
     *
     * @class MicrosoftXmlHttpRequestConnection
     * @constructor
     */
    var MicrosoftXmlHttpRequestConnection = function () {

        this._xhr = new ActiveXObject("Microsoft.XMLHTTP");

        /**
         * Basic request implemented via XHR technique
         *
         * @method execute
         * @param request {Request} structure containing all needed params and data
         * @param callback {function} function, which will be executed on request success
         */
        this.execute = function(request, callback) {

            var XHR = this._xhr,
                headerType;

            // Create the state change handler:
            XHR.onreadystatechange = function() {
                if (XHR.readyState != 4) {return;} // Not ready yet
                if (XHR.status >= 400) {
                    callback(
                        new CAPIError("Connection error : " + XHR.status, {errorCode : XHR.status} + ".", {
                            errorCode : XHR.status,
                            xhr: XHR
                        }),
                        false
                    );
                    return;
                }
                // Request successful
                callback(
                    false,
                    new Response({
                        status : XHR.status,
                        headers : XHR.getAllResponseHeaders(),
                        body : XHR.responseText
                    })
                );
            };

            if (request.httpBasicAuth) {
                XHR.open(request.method, request.url, true, request.login, request.password);
            } else {
                XHR.open(request.method, request.url, true);
            }


            for (headerType in request.headers) {
                if (request.headers.hasOwnProperty(headerType)) {
                    XHR.setRequestHeader(
                        headerType,
                        request.headers[headerType]
                    );
                }
            }
            XHR.send(request.body);
        };
    };

    /**
     * Connection checks itself for compatibility with running environment
     *
     * @method isCompatible
     * @static
     * @returns {boolean} true, if connection is compatible with current environment, false otherwise
     */
    MicrosoftXmlHttpRequestConnection.isCompatible = function(){
        return !!window.ActiveXObject;
    };

    return MicrosoftXmlHttpRequestConnection;

});