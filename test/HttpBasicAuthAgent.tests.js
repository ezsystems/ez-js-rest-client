/* global define, describe, it, expect, beforeEach, jasmine */
define(function (require) {

    // Declaring dependencies
    var HttpBasicAuthAgent = require("authAgents/HttpBasicAuthAgent");

    describe("Http Basic Authorization Agent", function () {

        var testLogin = "login",
            testPassword = "password",
            mockCAPI = {},
            mockCallback,
            mockRequest,
            httpBasicAuthAgent;

        beforeEach(function (){
            mockCallback = jasmine.createSpy('mockCallback');
        });

        describe("is correctly performing", function(){

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

            it("setCAPI (which does exactly nothing for this very agent, but should be present for uniformity)", function(){
                httpBasicAuthAgent.setCAPI(mockCAPI);
            });

            it("logOut", function(){

                httpBasicAuthAgent.logOut(mockCallback);
                expect(mockCallback).toHaveBeenCalledWith(false, true);
            });
        });

    });

});