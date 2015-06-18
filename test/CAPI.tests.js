/* global define, describe, it, expect, beforeEach, spyOn */
define(function (require) {

    var CAPI = require("CAPI"),
        ContentService = require("services/ContentService"),
        ContentTypeService = require("services/ContentTypeService"),
        DiscoveryService = require("services/DiscoveryService"),
        UserService = require("services/UserService");

    describe("CAPI", function () {

        var endPointUrl = 'http://ez.git.local',
            capi,
            MockAuthenticationAgent,
            mockAuthenticationAgent,
            TestOptions,
            testOptions;

        TestOptions = function () {
            this.logRequests = true;
            this.rootPath = '/testrootpath/';
            this.connectionStack = [];
        };
        TestOptions.prototype.dummyProperty = "dummy prototype property";

        MockAuthenticationAgent = function () {
            this._CAPI = null;
            this.setCAPI = function (capi) {
                this._CAPI = capi;
            };

            this.isLoggedIn = function (callback) { };

            this.logOut = function (callback) { };

            this.logIn = function (callback) { };

            this.setCredentials = function (credentials) { };
        };

        beforeEach(function () {
            testOptions = new TestOptions();
            mockAuthenticationAgent = new MockAuthenticationAgent();

            capi = new CAPI(
                endPointUrl,
                mockAuthenticationAgent,
                testOptions
            );
        });

        describe("Construction", function () {
            it("should be constructable", function () {
                expect(capi).toBeDefined();
                expect(capi instanceof CAPI).toBeTruthy();
            });

            it("should update authenticationAgent with a reference to CAPI", function () {
                expect(mockAuthenticationAgent._CAPI).toBe(capi);
            });
        });
        describe("Service API", function () {
            it("should provide ContentService", function () {
                var contentService = capi.getContentService();

                expect(contentService).toBeDefined();
                expect(contentService instanceof ContentService).toBeTruthy();
            });

            it("should provide ContentTypeService", function () {
                var contentTypeService = capi.getContentTypeService();

                expect(contentTypeService).toBeDefined();
                expect(contentTypeService instanceof ContentTypeService).toBeTruthy();
            });

            it("should provide UserService", function () {
                var userService = capi.getUserService();

                expect(userService).toBeDefined();
                expect(userService instanceof UserService).toBeTruthy();
            });

            it("should provide DiscoveryService", function () {
                var discoveryService = capi.getDiscoveryService();

                expect(discoveryService).toBeDefined();
                expect(discoveryService instanceof DiscoveryService).toBeTruthy();
            });
        });

        describe("Singleton Behaviour", function () {
            it("should only create one ContentService", function () {
                var contentService,
                    anotherContentService;

                contentService = capi.getContentService();
                anotherContentService = capi.getContentService();

                expect(anotherContentService).toBe(contentService);
            });

            it("should only create one ContentTypeService", function () {
                var contentTypeService,
                    anotherContentTypeService;

                contentTypeService = capi.getContentTypeService();
                anotherContentTypeService = capi.getContentTypeService();

                expect(anotherContentTypeService).toBe(contentTypeService);
            });

            it("should only create one UserService", function () {
                var anotherUserService,
                    userService;

                userService = capi.getUserService();
                anotherUserService = capi.getUserService();

                expect(anotherUserService).toBe(userService);
            });
        });

        describe("isLoggedIn", function () {
            it("should call the authentification agent isLoggedIn method", function () {
                var mockCallback = function () {};

                spyOn(mockAuthenticationAgent, 'isLoggedIn');
                capi.isLoggedIn(mockCallback);

                expect(mockAuthenticationAgent.isLoggedIn).toHaveBeenCalledWith(mockCallback);
            });
        });

        describe("logOut", function () {
            it("should call the authentification agent logOut method", function () {
                var mockCallback = function () {};

                spyOn(mockAuthenticationAgent, 'logOut');
                capi.logOut(mockCallback);

                expect(mockAuthenticationAgent.logOut).toHaveBeenCalledWith(mockCallback);
            });
        });

        describe('logIn', function () {
            it("should call the authentication agent logIn method", function () {
                var mockCallback = function () {};

                spyOn(mockAuthenticationAgent, 'logIn');
                capi.logIn(mockCallback);

                expect(mockAuthenticationAgent.logIn).toHaveBeenCalledWith(mockCallback);
            });

            it("should set the credentials and call the authentication agent logIn method", function () {
                var mockCallback = function () {},
                    credentials = {};

                spyOn(mockAuthenticationAgent, 'logIn');
                spyOn(mockAuthenticationAgent, 'setCredentials');
                capi.logIn(credentials, mockCallback);

                expect(mockAuthenticationAgent.setCredentials).toHaveBeenCalledWith(credentials);
                expect(mockAuthenticationAgent.logIn).toHaveBeenCalledWith(mockCallback);
            });
        });
    });
});
