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

        mockRequest = {
            body: {testBody: ""},
            headers: new HeadersObject(),
            httpBasicAuth: false,
            method: "GET",
            url: "/"
        };

        beforeEach(function (){

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

                expect(mockXMLHttpRequest.prototype.open).toHaveBeenCalled();
                expect(mockXMLHttpRequest.prototype.open.mostRecentCall.args[0]).toEqual("GET"); //method
                expect(mockXMLHttpRequest.prototype.open.mostRecentCall.args[1]).toEqual("/"); //url
                expect(mockXMLHttpRequest.prototype.open.mostRecentCall.args[2]).toEqual(true); //async

                expect(mockXMLHttpRequest.prototype.setRequestHeader).toHaveBeenCalled();
                expect(mockXMLHttpRequest.prototype.setRequestHeader.mostRecentCall.args[0]).toEqual("testHeader"); //header type
                expect(mockXMLHttpRequest.prototype.setRequestHeader.mostRecentCall.args[1]).toEqual("testHeaderValue"); //header value

                expect(mockXMLHttpRequest.prototype.send).toHaveBeenCalled();
                expect(mockXMLHttpRequest.prototype.send.mostRecentCall.args[0]).toEqual({testBody: ""}); //body

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

                expect(mockXMLHttpRequest.prototype.open).toHaveBeenCalled();
                expect(mockXMLHttpRequest.prototype.open.mostRecentCall.args[0]).toEqual("GET"); //method
                expect(mockXMLHttpRequest.prototype.open.mostRecentCall.args[1]).toEqual("/"); //url
                expect(mockXMLHttpRequest.prototype.open.mostRecentCall.args[2]).toEqual(true); //async
                expect(mockXMLHttpRequest.prototype.open.mostRecentCall.args[3]).toEqual(testLogin); //login
                expect(mockXMLHttpRequest.prototype.open.mostRecentCall.args[4]).toEqual(testPassword); //password

                expect(mockXMLHttpRequest.prototype.setRequestHeader).toHaveBeenCalled();
                expect(mockXMLHttpRequest.prototype.setRequestHeader.calls.length).toEqual(1);
                expect(mockXMLHttpRequest.prototype.setRequestHeader.mostRecentCall.args[0]).toEqual("testHeader"); //header type
                expect(mockXMLHttpRequest.prototype.setRequestHeader.mostRecentCall.args[1]).toEqual("testHeaderValue"); //header value
                expect(mockXMLHttpRequest.prototype.send).toHaveBeenCalled();
                expect(mockXMLHttpRequest.prototype.send.mostRecentCall.args[0]).toEqual({testBody: ""}); //body

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

                expect(mockXMLHttpRequest.prototype.open).toHaveBeenCalled();
                expect(mockXMLHttpRequest.prototype.open.mostRecentCall.args[0]).toEqual("POST"); //method
                expect(mockXMLHttpRequest.prototype.open.mostRecentCall.args[1]).toEqual("/"); //url
                expect(mockXMLHttpRequest.prototype.open.mostRecentCall.args[2]).toEqual(true); //async

                expect(mockXMLHttpRequest.prototype.setRequestHeader).toHaveBeenCalled();
                expect(mockXMLHttpRequest.prototype.setRequestHeader.calls.length).toEqual(2);
                expect(mockXMLHttpRequest.prototype.setRequestHeader.mostRecentCall.args[0]).toEqual("testHeader"); //header type
                expect(mockXMLHttpRequest.prototype.setRequestHeader.mostRecentCall.args[1]).toEqual("testHeaderValue"); //header value
                expect(mockXMLHttpRequest.prototype.setRequestHeader.calls[0].args[0]).toEqual("X-HTTP-Method-Override"); //header type
                expect(mockXMLHttpRequest.prototype.setRequestHeader.calls[0].args[1]).toEqual("PUBLISH"); //header value

                expect(mockXMLHttpRequest.prototype.send).toHaveBeenCalled();
                expect(mockXMLHttpRequest.prototype.send.mostRecentCall.args[0]).toEqual({testBody: ""}); //body

                expect(mockXMLHttpRequest.prototype.getAllResponseHeaders).toHaveBeenCalled();

                expect(mockCallback).toHaveBeenCalled();
                expect(mockCallback.mostRecentCall.args[0]).toEqual(false); // errors
                expect(mockCallback.mostRecentCall.args[1]).toEqual(jasmine.any(Response)); // response

                // cleanup
                mockRequest.method = "GET";
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

                expect(mockXMLHttpRequest.prototype.open).toHaveBeenCalled();
                expect(mockXMLHttpRequest.prototype.open.mostRecentCall.args[0]).toEqual("GET"); //method
                expect(mockXMLHttpRequest.prototype.open.mostRecentCall.args[1]).toEqual("/"); //url
                expect(mockXMLHttpRequest.prototype.open.mostRecentCall.args[2]).toEqual(true); //async
                expect(mockXMLHttpRequest.prototype.open.mostRecentCall.args[3]).toEqual(testLogin); //login
                expect(mockXMLHttpRequest.prototype.open.mostRecentCall.args[4]).toEqual(testPassword); //password

                expect(mockXMLHttpRequest.prototype.setRequestHeader).toHaveBeenCalled();
                expect(mockXMLHttpRequest.prototype.setRequestHeader.mostRecentCall.args[0]).toEqual("testHeader"); //header type
                expect(mockXMLHttpRequest.prototype.setRequestHeader.mostRecentCall.args[1]).toEqual("testHeaderValue"); //header value

                expect(mockXMLHttpRequest.prototype.send).toHaveBeenCalled();
                expect(mockXMLHttpRequest.prototype.send.mostRecentCall.args[0]).toEqual({testBody: ""}); //body

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
