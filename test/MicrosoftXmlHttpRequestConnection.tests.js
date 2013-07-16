describe("Microsoft XmlHttpRequest Connection", function () {

    var connection,
        mockCallback,
        mockXMLHttpRequest,
        mockRequest = {
            body : { testBody : ""},
            headers : { testHeader : "testHeaderValue"},
            httpBasicAuth : false,
            method : "GET",
            url : "/"
        },
        testLogin = "login",
        testPassword = "password",
        testErrorCode = 400;

    beforeEach(function (){

        mockCallback = jasmine.createSpy('mockCallback');

        mockXMLHttpRequest = function(){};
        mockXMLHttpRequest.prototype.open = function(method, url, async, user, password){};
        mockXMLHttpRequest.prototype.setRequestHeader = function(headerType, header){};
        mockXMLHttpRequest.prototype.getAllResponseHeaders = function(){};

        spyOn(mockXMLHttpRequest.prototype, 'open').andCallThrough();
        spyOn(mockXMLHttpRequest.prototype, 'setRequestHeader').andCallThrough();
        spyOn(mockXMLHttpRequest.prototype, 'getAllResponseHeaders').andCallThrough();
    });

    describe("is correctly using XmlHttpRequest while performing:", function(){

        beforeEach(function (){

            mockXMLHttpRequest.prototype.send = function(body){
                this.readyState = 4;
                this.status = 200;
                this.onreadystatechange();
            };
            spyOn(mockXMLHttpRequest.prototype, 'send').andCallThrough();

            ActiveXObject = (function (what) {
                return mockXMLHttpRequest;
            }());

            connection = new MicrosoftXmlHttpRequestConnection();
        });

        it("execute call", function(){

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
            expect(mockXMLHttpRequest.prototype.send.mostRecentCall.args[0]).toEqual({ testBody : ""}); //body

            expect(mockXMLHttpRequest.prototype.getAllResponseHeaders).toHaveBeenCalled();

            expect(mockCallback).toHaveBeenCalled();
            expect(mockCallback.mostRecentCall.args[0]).toEqual(false); // errors
            expect(mockCallback.mostRecentCall.args[1]).toEqual(jasmine.any(Response)); // errors

        });

        it("execute call with BasicHttp Authorization", function(){

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
            expect(mockXMLHttpRequest.prototype.setRequestHeader.mostRecentCall.args[0]).toEqual("testHeader"); //header type
            expect(mockXMLHttpRequest.prototype.setRequestHeader.mostRecentCall.args[1]).toEqual("testHeaderValue"); //header value

            expect(mockXMLHttpRequest.prototype.send).toHaveBeenCalled();
            expect(mockXMLHttpRequest.prototype.send.mostRecentCall.args[0]).toEqual({ testBody : ""}); //body

            expect(mockXMLHttpRequest.prototype.getAllResponseHeaders).toHaveBeenCalled();

            expect(mockCallback).toHaveBeenCalled();
            expect(mockCallback.mostRecentCall.args[0]).toEqual(false); // errors
            expect(mockCallback.mostRecentCall.args[1]).toEqual(jasmine.any(Response)); // errors
        });

    });

    describe("is returning errors and retrying correctly, when ", function(){

        it("request is not finished yet", function(){

            mockXMLHttpRequest.prototype.send = function(body){
                this.readyState = 3;
                this.status = 0;
                this.onreadystatechange();
                this.readyState = 4;
                this.status = 200;
                this.onreadystatechange();
            };
            spyOn(mockXMLHttpRequest.prototype, 'send').andCallThrough();

            ActiveXObject = (function () {
                return mockXMLHttpRequest;
            }())

            connection = new MicrosoftXmlHttpRequestConnection();

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
            expect(mockXMLHttpRequest.prototype.send.mostRecentCall.args[0]).toEqual({ testBody : ""}); //body

            expect(mockXMLHttpRequest.prototype.getAllResponseHeaders).toHaveBeenCalled();

            expect(mockCallback).toHaveBeenCalled();
            expect(mockCallback.mostRecentCall.args[0]).toEqual(false); // errors
            expect(mockCallback.mostRecentCall.args[1]).toEqual(jasmine.any(Response)); // response
        });

        it("request have failed", function(){

            mockXMLHttpRequest.prototype.send = function(body){
                this.readyState = 4;
                this.status = testErrorCode;
                this.onreadystatechange();
            };
            spyOn(mockXMLHttpRequest.prototype, 'send').andCallThrough();

            ActiveXObject = (function () {
                return mockXMLHttpRequest;
            }())

            connection = new MicrosoftXmlHttpRequestConnection();

            connection.execute(
                mockRequest,
                mockCallback
            );

            expect(mockCallback).toHaveBeenCalled();
            expect(mockCallback.mostRecentCall.args[0]).toEqual(jasmine.any(CAPIError)); // errors
            expect(mockCallback.mostRecentCall.args[1]).toEqual(jasmine.any(Response)); // response
            expect(mockCallback.mostRecentCall.args[1].status).toEqual(testErrorCode);
        });

    });
});