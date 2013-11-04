/* global define, describe, it, expect, beforeEach */
define(function (require) {

    var CAPI = require("CAPI"),
        ContentService = require("services/ContentService"),
        ContentTypeService = require("services/ContentTypeService"),
        UserService = require("services/UserService");

    describe("CAPI", function () {

        var endPointUrl = 'http://ez.git.local',
            mockAuthenticationAgent,
            jsCAPI,
            contentService,
            contentTypeService,
            userService,
            anotherContentService,
            anotherContentTypeService,
            anotherUserService;

        beforeEach(function (){
            mockAuthenticationAgent = {
                CAPI: null
            }
        });

        it("is running constructor correctly", function(){

            jsCAPI = new CAPI(
                endPointUrl,
                mockAuthenticationAgent
            );

            expect(jsCAPI).toBeDefined();
            expect(mockAuthenticationAgent.CAPI).toBe(jsCAPI);
        });

        describe("is calling services correctly (and they are singletons):", function(){

            beforeEach(function (){
                jsCAPI = new CAPI(
                    endPointUrl,
                    mockAuthenticationAgent
                );
            });

            it("ContentService", function(){

                contentService = jsCAPI.getContentService();
                anotherContentService = jsCAPI.getContentService();

                expect(contentService).toBeDefined();
                expect(contentService instanceof ContentService).toBeTruthy();
                expect(anotherContentService).toBe(contentService);
            });

            it("ContentTypeService", function(){

                contentTypeService = jsCAPI.getContentTypeService();
                anotherContentTypeService = jsCAPI.getContentTypeService();

                expect(contentTypeService).toBeDefined();
                expect(contentTypeService instanceof ContentTypeService).toBeTruthy();
                expect(anotherContentTypeService).toBe(contentTypeService);
            });

            it("UserService", function(){

                userService = jsCAPI.getUserService();
                anotherUserService = jsCAPI.getUserService();

                expect(userService).toBeDefined();
                expect(userService instanceof UserService).toBeTruthy();
                expect(anotherUserService).toBe(userService);
            });

        });


    });

});
