define(function (require) {

    // Declaring dependencies
    var HttpBasicAuthAgent = require("authAgents/HttpBasicAuthAgent"),
        CAPIError = require("structures/CAPIError");

    describe("Http Basic Authorization Agent", function () {

        var testLogin = "login",
            testPassword = "password",
            mockCallback,
            mockRequest,
            httpBasicAuthAgent;

        beforeEach(function (){
            mockCallback = jasmine.createSpy('mockCallback');
        });

        describe("is correctly performing calls:", function(){

            beforeEach(function (){

                httpBasicAuthAgent = new HttpBasicAuthAgent({
                    login : testLogin,
                    password : testPassword
                });

            });

            it("ensureAuthentication", function(){

                httpBasicAuthAgent.ensureAuthentication(mockCallback);
                expect(mockCallback).toHaveBeenCalledWith(false, true);
            });

            it("authenticateRequest", function(){

                mockRequest = {};

                httpBasicAuthAgent.authenticateRequest(mockRequest, mockCallback);

                expect(mockCallback).toHaveBeenCalledWith(false, mockRequest);

                expect(mockRequest.httpBasicAuth).toEqual(true);
                expect(mockRequest.login).toEqual(testLogin);
                expect(mockRequest.password).toEqual(testPassword);
            });

            it("logOut", function(){

                httpBasicAuthAgent.logOut(mockCallback);
                expect(mockCallback).toHaveBeenCalledWith(false, true);
            });
        });

    });

});