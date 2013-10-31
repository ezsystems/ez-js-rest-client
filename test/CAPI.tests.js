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
            anotherUserService,
            testOptions = {
                logRequests: true,
                rootPath: '/testrootpath/',
                connectionStack: []
            };

        beforeEach(function (){
            mockAuthenticationAgent = {
                _CAPI: null,
                setCAPI: function(CAPI) {
                    this._CAPI = CAPI;
                }
            };
        });

        it("is running constructor correctly", function(){

            jsCAPI = new CAPI(
                endPointUrl,
                mockAuthenticationAgent
            );

            expect(jsCAPI).toBeDefined();
            expect(mockAuthenticationAgent._CAPI).toBe(jsCAPI);
        });

        describe("is calling services correctly (and they are singletons):", function(){

            beforeEach(function (){
                jsCAPI = new CAPI(
                    endPointUrl,
                    mockAuthenticationAgent,
                    testOptions
                );
            });

            it("ContentService", function(){

                contentService = jsCAPI.getContentService();
                anotherContentService = jsCAPI.getContentService();

                expect(contentService).toBeDefined();
                expect(contentService instanceof ContentService).toBeTruthy();
                expect(anotherContentService).toBe(contentService);

                expect(contentService._connectionManager.logRequests).toBe(testOptions.logRequests);
                expect(contentService._connectionManager._connectionFactory.connectionList).toBe(testOptions.connectionStack);
                expect(contentService._discoveryService.rootPath).toBe(testOptions.rootPath);

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