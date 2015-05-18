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
    };

    /**
     * Basic request implemented via XHR technique
     *
     * @method execute
     * @param request {Request} structure containing all needed params and data
     * @param callback {function} function, which will be executed on request success
     */
    MicrosoftXmlHttpRequestConnection.prototype.execute = function (request, callback) {
        var XHR = this._xhr,
            headerType;

        // Create the state change handler:
        XHR.onreadystatechange = function () {
            var response;

            if (XHR.readyState != 4) {return;} // Not ready yet

            response = new Response({
                status: XHR.status,
                headers: XHR.getAllResponseHeaders(),
                body: XHR.responseText,
                xhr: XHR,
            });
            if (XHR.status >= 400) {
                callback(
                    new CAPIError("Connection error : " + XHR.status + ".", {request: request}),
                    response
                );
                return;
            }
            callback(false, response);
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

    /**
     * Connection checks itself for compatibility with running environment
     *
     * @method isCompatible
     * @static
     * @return {boolean} whether the connection is compatible with current environment
     */
    MicrosoftXmlHttpRequestConnection.isCompatible = function () {
        return !!window.ActiveXObject;
    };

    return MicrosoftXmlHttpRequestConnection;
});
