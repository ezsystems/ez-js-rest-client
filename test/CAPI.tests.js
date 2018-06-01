/* global define, describe, it, expect, beforeEach, spyOn */
define(function (require) {

    var CAPI = require("CAPI"),
        ConnectionManager = require("ConnectionManager"),
        ContentService = require("services/ContentService"),
        ContentTypeService = require("services/ContentTypeService"),
        DiscoveryService = require("services/DiscoveryService"),
        UserService = require("services/UserService");

    describe("CAPI", function () {

        var testUrls = [
                {endPointUrl: 'http://ez.git.local', expectedOrigin: 'http://ez.git.local', expectedPath: ''},
                {endPointUrl: 'http://ez.git.local/test', expectedOrigin: 'http://ez.git.local', expectedPath: '/test'},
                {endPointUrl: '/test', expectedOrigin: '', expectedPath: '/test'}
            ],
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

        testUrls.forEach(function(testUrl) {
            describe("for every url", function() {
                beforeEach(function () {
                    testOptions = new TestOptions();
                    mockAuthenticationAgent = new MockAuthenticationAgent();

                    capi = new CAPI(
                        testUrl.endPointUrl,
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
                    describe('getContentervice', function() {
                        var contentService;

                        beforeEach(function() {
                            contentService = capi.getContentService();
                        });

                        it("should provide ContentService", function () {
                            expect(contentService).toBeDefined();
                            expect(contentService instanceof ContentService).toBeTruthy();
                        });

                        it("should provide ContentService with rootPath prefixed by path part of the url", function () {
                            expect(contentService._rootPath).toEqual(testUrl.expectedPath + testOptions.rootPath);
                        });
                    });

                    it("should provide ContentTypeService", function () {
                        var contentTypeService = capi.getContentTypeService();

                        expect(contentTypeService).toBeDefined();
                        expect(contentTypeService instanceof ContentTypeService).toBeTruthy();
                    });

                    describe('getUserService', function() {
                        var userService;

                        beforeEach(function() {
                            userService = capi.getUserService();
                        });

                        it("should provide UserService", function () {
                            expect(userService).toBeDefined();
                            expect(userService instanceof UserService).toBeTruthy();
                        });

                        it("should provide UserService with rootPath prefixed by path part of the url", function () {
                            expect(userService._rootPath).toEqual(testUrl.expectedPath + testOptions.rootPath);
                        });
                    });

                    describe('getDiscoveryService', function() {
                        var discoveryService;

                        beforeEach(function() {
                            discoveryService = capi.getDiscoveryService();
                        });

                        it("should provide DiscoveryService", function () {
                            expect(discoveryService).toBeDefined();
                            expect(discoveryService instanceof DiscoveryService).toBeTruthy();
                        });

                        it("should provide DiscoveryService with rootPath prefixed by path part of the url", function () {
                            expect(discoveryService._rootPath).toEqual(testUrl.expectedPath + testOptions.rootPath);
                        });
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

                describe("getConnectionManager", function () {
                    var connectionManager;

                    beforeEach(function () {
                        connectionManager = capi.getConnectionManager();
                    });

                    it("should provide ConnectionManager", function () {
                        expect(connectionManager).toBeDefined();
                        expect(connectionManager instanceof ConnectionManager).toBeTruthy();
                    });

                    it('should provide ConnectionManager with endPointUrl set to origin part of the url', function() {
                        var connectionManager = capi.getConnectionManager();

                        expect(connectionManager._endPointUrl).toEqual(testUrl.expectedOrigin);
                    });
                });
            });
        });
    });
});
