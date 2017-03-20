/* global define, describe, it, expect, beforeEach, jasmine, spyOn */
define(function (require) {

    // Declaring dependencies
    var XmlHttpRequestConnection = require("connections/XmlHttpRequestConnection"),
        Response = require("structures/Response"),
        CAPIError = require("structures/CAPIError");


    describe("XmlHttpRequest Connection", function () {

        var connection,
            mockCallback,
            mockXMLHttpRequest,
            mockRequest,
            HeadersObject,
            testLogin = "login",
            testPassword = "password",
            testErrorCode = 400;

        HeadersObject = function () {
            this.testHeader = "testHeaderValue";
        };
        HeadersObject.prototype.dummyProperty = "prototype dummy property";

        beforeEach(function (){

            mockRequest = {
                body: {testBody: ""},
                headers: new HeadersObject(),
                httpBasicAuth: false,
                method: "GET",
                url: "/"
            };

            mockCallback = jasmine.createSpy('mockCallback');

            mockXMLHttpRequest = function (){};
            mockXMLHttpRequest.prototype.open = function(method, url, async, user, password){};
            mockXMLHttpRequest.prototype.setRequestHeader = function(headerType, header){};
            mockXMLHttpRequest.prototype.getAllResponseHeaders = function (){};

            spyOn(mockXMLHttpRequest.prototype, 'open').andCallThrough();
            spyOn(mockXMLHttpRequest.prototype, 'setRequestHeader').andCallThrough();
            spyOn(mockXMLHttpRequest.prototype, 'getAllResponseHeaders').andCallThrough();
        });

        it("is checking compatibility correctly when window.XMLHttpRequest is present", function (){

            window.XMLHttpRequest = {};

            expect(XmlHttpRequestConnection.isCompatible()).toEqual(true);

        });

        it("is checking compatibility correctly when window.XMLHttpRequest is absent", function (){

            window.XMLHttpRequest = null;

            expect(XmlHttpRequestConnection.isCompatible()).toEqual(false);

        });


        describe("is correctly using XmlHttpRequest while performing:", function (){

            beforeEach(function (){

                mockXMLHttpRequest.prototype.send = function(body){
                    this.readyState = 4;
                    this.status = 200;
                    this.onreadystatechange();
                };
                spyOn(mockXMLHttpRequest.prototype, 'send').andCallThrough();

                window.XMLHttpRequest = (function () {
                    return mockXMLHttpRequest;
                }());

                connection = new XmlHttpRequestConnection();
            });

            it("execute call", function (){

                connection.execute(
                    mockRequest,
                    mockCallback
                );

                expect(mockXMLHttpRequest.prototype.open).toHaveBeenCalledWith("GET", "/", true);

                expect(mockXMLHttpRequest.prototype.setRequestHeader).toHaveBeenCalledWith("testHeader", "testHeaderValue");
                expect(mockXMLHttpRequest.prototype.setRequestHeader.calls.length).toEqual(1);

                expect(mockXMLHttpRequest.prototype.send).toHaveBeenCalledWith({testBody: ""});

                expect(mockXMLHttpRequest.prototype.getAllResponseHeaders).toHaveBeenCalled();

                expect(mockCallback).toHaveBeenCalled();
                expect(mockCallback.mostRecentCall.args[0]).toEqual(false); // errors
                expect(mockCallback.mostRecentCall.args[1]).toEqual(jasmine.any(Response)); // response

            });

            it("execute call with BasicHttp Authorization", function (){

                mockRequest.httpBasicAuth = true;
                mockRequest.login = testLogin;
                mockRequest.password = testPassword;

                connection.execute(
                    mockRequest,
                    mockCallback
                );

                expect(mockXMLHttpRequest.prototype.open).toHaveBeenCalledWith("GET", "/", true, testLogin, testPassword);

                expect(mockXMLHttpRequest.prototype.setRequestHeader).toHaveBeenCalledWith("testHeader", "testHeaderValue");
                expect(mockXMLHttpRequest.prototype.setRequestHeader.calls.length).toEqual(1);

                expect(mockXMLHttpRequest.prototype.send).toHaveBeenCalledWith({testBody: ""});

                expect(mockXMLHttpRequest.prototype.getAllResponseHeaders).toHaveBeenCalled();

                expect(mockCallback).toHaveBeenCalled();
                expect(mockCallback.mostRecentCall.args[0]).toEqual(false); // errors
                expect(mockCallback.mostRecentCall.args[1]).toEqual(jasmine.any(Response));
            });

            it("execute call with custom http verb that needs to use POST", function (){

                mockRequest.method = "PUBLISH";

                connection.execute(
                    mockRequest,
                    mockCallback
                );

                expect(mockXMLHttpRequest.prototype.open).toHaveBeenCalledWith("POST", "/", true);
                expect(mockXMLHttpRequest.prototype.setRequestHeader).toHaveBeenCalledWith("testHeader", "testHeaderValue");
                expect(mockXMLHttpRequest.prototype.setRequestHeader).toHaveBeenCalledWith("X-HTTP-Method-Override", "PUBLISH");
                expect(mockXMLHttpRequest.prototype.setRequestHeader.calls.length).toEqual(2);
                expect(mockXMLHttpRequest.prototype.send).toHaveBeenCalledWith({testBody: ""});
            });

        });

        describe("is correctly using XmlHttpRequest and runs attached callbacks while performing:", function (){
            beforeEach(function (){
                mockXMLHttpRequest.prototype.send = function (body) {
                    this.readyState = 4;
                    this.status = 200;
                    this.onloadstart();
                    this.onload();
                    this.onloadend();
                    this.onprogress();
                    this.ontimeout();
                    this.onerror();
                    this.onabort();
                    this.upload.onloadstart();
                    this.upload.onload();
                    this.upload.onloadend();
                    this.upload.onprogress();
                    this.upload.ontimeout();
                    this.upload.onerror();
                    this.upload.onabort();
                    this.onreadystatechange();
                };
                mockXMLHttpRequest.prototype.upload = {};
                spyOn(mockXMLHttpRequest.prototype, 'send').andCallThrough();

                window.XMLHttpRequest = (function () { return mockXMLHttpRequest; }());

                connection = new XmlHttpRequestConnection();
            });

            it("execute call and invokes custom request event callbacks", function () {
                var requestEventHandlers = {
                    onreadystatechange: jasmine.createSpy('onreadystatechange'),
                    onloadstart: jasmine.createSpy('onloadstart'),
                    onload: jasmine.createSpy('onload'),
                    onloadend: jasmine.createSpy('onloadend'),
                    onprogress: jasmine.createSpy('onprogress'),
                    ontimeout: jasmine.createSpy('ontimeout'),
                    onerror: jasmine.createSpy('onerror'),
                    onabort: jasmine.createSpy('onabort'),
                    upload: {
                        onloadstart: jasmine.createSpy('uploadOnloadstart'),
                        onload: jasmine.createSpy('uploadOnload'),
                        onloadend: jasmine.createSpy('uploadOnloadend'),
                        onprogress: jasmine.createSpy('uploadOnprogress'),
                        ontimeout: jasmine.createSpy('uploadOntimeout'),
                        onerror: jasmine.createSpy('uploadOnerror'),
                        onabort: jasmine.createSpy('uploadOnabort'),
                    }
                };

                connection.execute(
                    mockRequest,
                    requestEventHandlers,
                    mockCallback
                );

                expect(requestEventHandlers.onloadstart).toHaveBeenCalled();
                expect(requestEventHandlers.onload).toHaveBeenCalled();
                expect(requestEventHandlers.onloadend).toHaveBeenCalled();
                expect(requestEventHandlers.ontimeout).toHaveBeenCalled();
                expect(requestEventHandlers.onreadystatechange).not.toHaveBeenCalled();
                expect(requestEventHandlers.onprogress).toHaveBeenCalled();
                expect(requestEventHandlers.onabort).toHaveBeenCalled();
                expect(requestEventHandlers.onerror).toHaveBeenCalled();
                expect(requestEventHandlers.upload.onloadstart).toHaveBeenCalled();
                expect(requestEventHandlers.upload.onload).toHaveBeenCalled();
                expect(requestEventHandlers.upload.onloadend).toHaveBeenCalled();
                expect(requestEventHandlers.upload.ontimeout).toHaveBeenCalled();
                expect(requestEventHandlers.upload.onprogress).toHaveBeenCalled();
                expect(requestEventHandlers.upload.onabort).toHaveBeenCalled();
                expect(requestEventHandlers.upload.onerror).toHaveBeenCalled();
            });
        });

        describe("is returning errors and retrying correctly, when ", function (){

            it("request is not finished yet", function (){

                mockXMLHttpRequest.prototype.send = function(body){
                    this.readyState = 3;
                    this.status = 0;
                    this.onreadystatechange();
                    this.readyState = 4;
                    this.status = 200;
                    this.onreadystatechange();
                };
                spyOn(mockXMLHttpRequest.prototype, 'send').andCallThrough();

                window.XMLHttpRequest = (function () {
                    return mockXMLHttpRequest;
                }());

                connection = new XmlHttpRequestConnection();

                connection.execute(
                    mockRequest,
                    mockCallback
                );

                expect(mockXMLHttpRequest.prototype.open).toHaveBeenCalledWith("GET", "/", true);

                expect(mockXMLHttpRequest.prototype.setRequestHeader).toHaveBeenCalledWith("testHeader", "testHeaderValue");
                expect(mockXMLHttpRequest.prototype.setRequestHeader.calls.length).toEqual(1);

                expect(mockXMLHttpRequest.prototype.send).toHaveBeenCalledWith({testBody: ""});

                expect(mockXMLHttpRequest.prototype.getAllResponseHeaders).toHaveBeenCalled();

                expect(mockCallback).toHaveBeenCalled();
                expect(mockCallback.mostRecentCall.args[0]).toEqual(false); // errors
                expect(mockCallback.mostRecentCall.args[1]).toEqual(jasmine.any(Response)); // response
            });

            it("request have failed", function (){

                mockXMLHttpRequest.prototype.send = function(body){
                    this.readyState = 4;
                    this.status = testErrorCode;
                    this.onreadystatechange();
                };
                spyOn(mockXMLHttpRequest.prototype, 'send').andCallThrough();

                window.XMLHttpRequest = (function () {
                    return mockXMLHttpRequest;
                }());

                connection = new XmlHttpRequestConnection();

                connection.execute(
                    mockRequest,
                    mockCallback
                );

                expect(mockCallback).toHaveBeenCalledWith(
                    jasmine.any(CAPIError), jasmine.any(Response)
                );
            });

            it("should provide the request in the error object", function () {
                mockXMLHttpRequest.prototype.send = function (body){
                    this.readyState = 4;
                    this.status = testErrorCode;
                    this.onreadystatechange();
                };
                window.XMLHttpRequest = (function () {
                    return mockXMLHttpRequest;
                }());

                connection = new XmlHttpRequestConnection();
                connection.execute(mockRequest, function (error, response) {
                    expect(error.details.request).toEqual(mockRequest);
                });
            });

            it("should handle the fail to connect error", function () {
                mockXMLHttpRequest.prototype.send = function (body){
                    this.readyState = 4;
                    this.status = 0;
                    this.onreadystatechange();
                };
                window.XMLHttpRequest = (function () {
                    return mockXMLHttpRequest;
                }());

                connection = new XmlHttpRequestConnection();
                connection.execute(
                    mockRequest,
                    mockCallback
                );

                expect(mockCallback).toHaveBeenCalledWith(
                    jasmine.any(CAPIError), jasmine.any(Response)
                );
            });
        });
    });
});
