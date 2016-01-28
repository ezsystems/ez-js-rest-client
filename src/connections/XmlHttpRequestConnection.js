/* global define */
define(["structures/Response", "structures/CAPIError"], function (Response, CAPIError) {
    "use strict";

    /**
     * Creates an instance of XmlHttpRequestConnection object
     * This connection class handles low-level implementation of XHR connection for generic (non-Microsoft) browsers
     *
     * @class XmlHttpRequestConnection
     * @constructor
     */
    var XmlHttpRequestConnection = function () {
        this._xhr = new XMLHttpRequest();
    };

    /**
     * Basic request implemented via XHR technique
     *
     * @method execute
     * @param request {Request} structure containing all needed params and data
     * @param callback {Function} function, which will be executed on request success
     */
    XmlHttpRequestConnection.prototype.execute = function (request, callback) {
        var XHR = this._xhr,
            headerType,
            method = request.method,
            standardMethods = {"OPTIONS": 1, "GET": 1, "HEAD": 1, "POST": 1, "PUT": 1, "DELETE": 1, "TRACE": 1};

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
            if (XHR.status >= 400 || !XHR.status) {
                callback(
                    new CAPIError("Connection error : " + XHR.status + ".", {request: request}),
                    response
                );
                return;
            }
            callback(false, response);
        };

        // Send non-standard HTTP methods as headers using POST.
        // Avoids problems with conservative proxies, HTTP security tools and limited web servers.
        if (standardMethods[method.toUpperCase()] !== 1) {
            method = "POST";
        }

        if (request.httpBasicAuth) {
            XHR.open(method, request.url, true, request.login, request.password);
        } else {
            XHR.open(method, request.url, true);
        }

        if (method !== request.method) {
            XHR.setRequestHeader("X-HTTP-Method-Override", request.method);
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
     * @return {Boolean} whether the connection is compatible with current environment
     */
    XmlHttpRequestConnection.isCompatible = function () {
        return !!window.XMLHttpRequest;
    };

    return XmlHttpRequestConnection;
});
