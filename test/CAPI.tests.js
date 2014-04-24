/* global define, describe, it, expect, beforeEach */
define(function (require) {

    var CAPI = require("CAPI"),
        ContentService = require("services/ContentService"),
        ContentTypeService = require("services/ContentTypeService"),
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
    });
});