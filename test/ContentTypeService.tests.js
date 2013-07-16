
describe("ContentType Service", function () {

    var mockConnectionManager,
        mockDiscoveryService,
        mockFaultyDiscoveryService,
        mockCallback,
        discoveryService,
        testContentTypeGroups = "/api/ezp/v2/content/typegroups",
        testContentTypeGroupId = "/api/ezp/v2/content/typegroups/1",
        testContentTypeGroupTypes = "/api/ezp/v2/content/typegroups/1/types",
        testContentTypeGroupIdentifier = "Media",
        testContentTypeId = "/api/ezp/v2/content/types/18",
        testContentTypes = "/api/ezp/v2/content/types",
        testContentTypeIdentifier = "blog_post",
        testContentTypeAssignedGroupId = "/api/ezp/v2/content/types/101/groups/1",
        testContentTypeDraftId = "/api/ezp/v2/content/types/18/draft",
        testContentTypeDraftFieldDefinitions = "/api/ezp/v2/content/types/18/draft/fieldDefinitions",
        testFieldDefintionId = "/api/ezp/v2/content/types/42/fieldDefinitions/311",
        testTrue = true,
        testFalse = false,
        testStructure,
        testLanguage = "eng_US",
        testArray = ["one", "two", "three"],
        testFieldDefintionType = "ezstring",
        testFieldDefintionGroup = "content";


    beforeEach(function (){

        mockConnectionManager = jasmine.createSpyObj('mockConnectionManager', ['request', 'delete']);
        mockCallback = jasmine.createSpy('mockCallback');

    });


// ******************************
// Cases without errors
// ******************************
    describe("is calling injected objects with right arguments while running calls", function () {

        // ******************************
        // Faked internal service calls
        // ******************************
        var fakedLoadContentTypeGroup = function(ContentTypeGroupId, callback){
                var mockContentTypeGroupResponse = {};
                mockContentTypeGroupResponse.body = JSON.stringify({
                    "ContentTypeGroup" : {
                        "_href" : testContentTypeGroupId,
                        "_media-type" : "application/vnd.ez.api.ContentTypeGroup+json",
                        ContentTypes : {
                            "_href" : testContentTypeGroupTypes,
                            "_media-type" : "application/vnd.ez.api.ContentTypeInfoList+json"
                        }
                    }
                });
                callback(false, mockContentTypeGroupResponse);
            },
            fakedLoadContentTypeDraft = function(ContentTypeId, callback){
                var mockContentTypeDraftResponse = {};
                mockContentTypeDraftResponse.body = JSON.stringify({
                    "ContentType" : {
                        "_href" : testContentTypeId,
                        "_media-type" : "application/vnd.ez.api.ContentType+json",
                        FieldDefinitions : {
                            "_href" : testContentTypeDraftFieldDefinitions,
                            "_media-type" : "application/vnd.ez.api.FieldDefinitionList+json"
                        }
                    }
                });
                callback(false, mockContentTypeDraftResponse);
            };

        // ******************************
        // beforeEach for positive cases
        // ******************************
        beforeEach(function (){

            mockDiscoveryService = {
                getInfoObject : function(name, callback){

                    if (name === "contentTypes"){
                        callback(
                            false,
                            {
                                "_href" : testContentTypes,
                                "_media-type" : "application/vnd.ez.api.ContentTypeInfoList+json"
                            }
                        );
                    }

                }
            }

            spyOn(mockDiscoveryService, 'getInfoObject').andCallThrough();

            contentTypeService = new ContentTypeService(mockConnectionManager, mockDiscoveryService);

        });

        // ******************************
        // Content Type groups Management
        // ******************************
        it("createContentTypeGroup", function () {

            var contentTypeGroupCreateStruct = contentTypeService.newContentTypeGroupInputStruct(
                "some-group-id" + Math.random(100)
            );

            contentTypeService.createContentTypeGroup(
                testContentTypeGroups,
                contentTypeGroupCreateStruct,
                mockCallback
            );

            expect(mockConnectionManager.request).toHaveBeenCalled();
            expect(mockConnectionManager.request.mostRecentCall.args[0]).toEqual("POST"); //method
            expect(mockConnectionManager.request.mostRecentCall.args[1]).toEqual(testContentTypeGroups); //url
            expect(mockConnectionManager.request.mostRecentCall.args[2]).toEqual(JSON.stringify(contentTypeGroupCreateStruct.body)); // body
            expect(mockConnectionManager.request.mostRecentCall.args[3]).toEqual(contentTypeGroupCreateStruct.headers); // headers
            expect(mockConnectionManager.request.mostRecentCall.args[4]).toBe(mockCallback); // callback

        });

        it("loadContentTypeGroupsList", function () {
            contentTypeService.loadContentTypeGroupsList(
                testContentTypeGroups,
                mockCallback
            );

            expect(mockConnectionManager.request).toHaveBeenCalled();
            expect(mockConnectionManager.request.mostRecentCall.args[0]).toEqual("GET"); //method
            expect(mockConnectionManager.request.mostRecentCall.args[1]).toEqual(testContentTypeGroups); //url
            expect(mockConnectionManager.request.mostRecentCall.args[2]).toEqual(""); // body
            expect(mockConnectionManager.request.mostRecentCall.args[3].Accept).toEqual("application/vnd.ez.api.ContentTypeGroupList+json"); // headers
            expect(mockConnectionManager.request.mostRecentCall.args[4]).toBe(mockCallback); // callback
        });

        it("loadContentTypeGroup", function () {
            contentTypeService.loadContentTypeGroup(
                testContentTypeGroupId,
                mockCallback
            );

            expect(mockConnectionManager.request).toHaveBeenCalled();
            expect(mockConnectionManager.request.mostRecentCall.args[0]).toEqual("GET"); //method
            expect(mockConnectionManager.request.mostRecentCall.args[1]).toEqual(testContentTypeGroupId); //url
            expect(mockConnectionManager.request.mostRecentCall.args[2]).toEqual(""); // body
            expect(mockConnectionManager.request.mostRecentCall.args[3].Accept).toEqual("application/vnd.ez.api.ContentTypeGroup+json"); // headers
            expect(mockConnectionManager.request.mostRecentCall.args[4]).toBe(mockCallback); // callback
        });

        it("loadContentTypeGroupByIdentifier", function () {
            contentTypeService.loadContentTypeGroupByIdentifier(
                testContentTypeGroups,
                testContentTypeGroupIdentifier,
                mockCallback
            );

            expect(mockConnectionManager.request).toHaveBeenCalled();
            expect(mockConnectionManager.request.mostRecentCall.args[0]).toEqual("GET"); //method
            expect(mockConnectionManager.request.mostRecentCall.args[1]).toEqual(testContentTypeGroups + '?identifier=' + testContentTypeGroupIdentifier); //url
            expect(mockConnectionManager.request.mostRecentCall.args[2]).toEqual(""); // body
            expect(mockConnectionManager.request.mostRecentCall.args[3].Accept).toEqual("application/vnd.ez.api.ContentTypeGroup+json"); // headers
            expect(mockConnectionManager.request.mostRecentCall.args[4]).toBe(mockCallback); // callback
        });


        it("updateContentTypeGroup", function () {

            var contentTypeGroupUpdateStruct = contentTypeService.newContentTypeGroupInputStruct(
                "some-group-id" + Math.random(100)
            );

            contentTypeService.updateContentTypeGroup(
                testContentTypeGroupId,
                contentTypeGroupUpdateStruct,
                mockCallback
            );

            expect(mockConnectionManager.request).toHaveBeenCalled();
            expect(mockConnectionManager.request.mostRecentCall.args[0]).toEqual("PATCH"); //method
            expect(mockConnectionManager.request.mostRecentCall.args[1]).toEqual(testContentTypeGroupId); //url
            expect(mockConnectionManager.request.mostRecentCall.args[2]).toEqual(JSON.stringify(contentTypeGroupUpdateStruct.body)); // body
            expect(mockConnectionManager.request.mostRecentCall.args[3]).toEqual(contentTypeGroupUpdateStruct.headers); // headers
            expect(mockConnectionManager.request.mostRecentCall.args[4]).toBe(mockCallback); // callback

        });

        it("deleteContentTypeGroup", function () {
            contentTypeService.deleteContentTypeGroup(
                testContentTypeGroupId,
                mockCallback
            );

            expect(mockConnectionManager.delete).toHaveBeenCalled();
            expect(mockConnectionManager.delete.mostRecentCall.args[0]).toEqual(testContentTypeGroupId); //url
            expect(mockConnectionManager.delete.mostRecentCall.args[1]).toBe(mockCallback); // callback
        });

        it("loadContentTypes", function () {

            spyOn(contentTypeService, 'loadContentTypeGroup').andCallFake(fakedLoadContentTypeGroup);

            contentTypeService.loadContentTypes(
                testContentTypeGroupId,
                mockCallback
            );

            expect(mockConnectionManager.request).toHaveBeenCalled();
            expect(mockConnectionManager.request.mostRecentCall.args[0]).toEqual("GET"); //method
            expect(mockConnectionManager.request.mostRecentCall.args[1]).toEqual(testContentTypeGroupTypes); //url
            expect(mockConnectionManager.request.mostRecentCall.args[2]).toEqual(""); // body
            expect(mockConnectionManager.request.mostRecentCall.args[3].Accept).toEqual("application/vnd.ez.api.ContentTypeInfoList+json"); // headers
            expect(mockConnectionManager.request.mostRecentCall.args[4]).toBe(mockCallback); // callback
        });


        // ******************************
        // Content Type Management
        // ******************************
        it("createContentType (and publish)", function () {

            spyOn(contentTypeService, 'loadContentTypeGroup').andCallFake(fakedLoadContentTypeGroup);

            var contentTypeCreateStruct,
                fieldDefinition;

            contentTypeCreateStruct = contentTypeService.newContentTypeCreateStruct(
                "content-type-id-" + Math.random(100),
                "eng-US",
                [
                    {
                        "_languageCode":"eng-US",
                        "#text":"Some Name " + Math.random(10000)
                    }
                ]
            );

            fieldDefinition = contentTypeService.newFieldDefinitionCreateStruct(
                "fd-id-" + Math.random(100),
                "ezstring",
                "content",
                [
                    {
                        "_languageCode":"eng-US",
                        "#text":"Some FD Name " + Math.random(10000)
                    }
                ]
            );

            contentTypeCreateStruct.body.ContentTypeCreate.FieldDefinitions.FieldDefinition.push(fieldDefinition.body.FieldDefinitionCreate);

            contentTypeService.createContentType(
                testContentTypeGroupId,
                contentTypeCreateStruct,
                testTrue,
                mockCallback
            );

            expect(mockConnectionManager.request).toHaveBeenCalled();
            expect(mockConnectionManager.request.mostRecentCall.args[0]).toEqual("POST"); //method
            expect(mockConnectionManager.request.mostRecentCall.args[1]).toEqual(testContentTypeGroupTypes + "?publish=" + testTrue); //url
            expect(mockConnectionManager.request.mostRecentCall.args[2]).toEqual(JSON.stringify(contentTypeCreateStruct.body)); // body
            expect(mockConnectionManager.request.mostRecentCall.args[3]).toEqual(contentTypeCreateStruct.headers); // headers
            expect(mockConnectionManager.request.mostRecentCall.args[4]).toBe(mockCallback); // callback
        });

        it("createContentType (and do not publish)", function () {

            spyOn(contentTypeService, 'loadContentTypeGroup').andCallFake(fakedLoadContentTypeGroup);

            var contentTypeCreateStruct,
                fieldDefinition;

            contentTypeCreateStruct = contentTypeService.newContentTypeCreateStruct(
                "content-type-id-" + Math.random(100),
                "eng-US",
                [
                    {
                        "_languageCode":"eng-US",
                        "#text":"Some Name " + Math.random(10000)
                    }
                ]
            );

            fieldDefinition = contentTypeService.newFieldDefinitionCreateStruct(
                "fd-id-" + Math.random(100),
                "ezstring",
                "content",
                [
                    {
                        "_languageCode":"eng-US",
                        "#text":"Some FD Name " + Math.random(10000)
                    }
                ]
            );

            contentTypeCreateStruct.body.ContentTypeCreate.FieldDefinitions.FieldDefinition.push(fieldDefinition.body.FieldDefinitionCreate);

            contentTypeService.createContentType(
                testContentTypeGroupId,
                contentTypeCreateStruct,
                testFalse,
                mockCallback
            );

            expect(mockConnectionManager.request).toHaveBeenCalled();
            expect(mockConnectionManager.request.mostRecentCall.args[0]).toEqual("POST"); //method
            expect(mockConnectionManager.request.mostRecentCall.args[1]).toEqual(testContentTypeGroupTypes); //url
            expect(mockConnectionManager.request.mostRecentCall.args[2]).toEqual(JSON.stringify(contentTypeCreateStruct.body)); // body
            expect(mockConnectionManager.request.mostRecentCall.args[3]).toEqual(contentTypeCreateStruct.headers); // headers
            expect(mockConnectionManager.request.mostRecentCall.args[4]).toBe(mockCallback); // callback
        });

        it("copyContentType", function () {
            contentTypeService.copyContentType(
                testContentTypeId,
                mockCallback
            );

            expect(mockConnectionManager.request).toHaveBeenCalled();
            expect(mockConnectionManager.request.mostRecentCall.args[0]).toEqual("COPY"); //method
            expect(mockConnectionManager.request.mostRecentCall.args[1]).toEqual(testContentTypeId); //url
            expect(mockConnectionManager.request.mostRecentCall.args[2]).toEqual(""); // body
            expect(mockConnectionManager.request.mostRecentCall.args[3]).toEqual({}); // headers
            expect(mockConnectionManager.request.mostRecentCall.args[4]).toBe(mockCallback); // callback
        });

        it("loadContentType", function () {
            contentTypeService.loadContentType(
                testContentTypeId,
                mockCallback
            );

            expect(mockConnectionManager.request).toHaveBeenCalled();
            expect(mockConnectionManager.request.mostRecentCall.args[0]).toEqual("GET"); //method
            expect(mockConnectionManager.request.mostRecentCall.args[1]).toEqual(testContentTypeId); //url
            expect(mockConnectionManager.request.mostRecentCall.args[2]).toEqual(""); // body
            expect(mockConnectionManager.request.mostRecentCall.args[3].Accept).toEqual("application/vnd.ez.api.ContentType+json"); // headers
            expect(mockConnectionManager.request.mostRecentCall.args[4]).toBe(mockCallback); // callback
        });

        it("loadContentTypeByIdentifier", function () {
            contentTypeService.loadContentTypeByIdentifier(
                testContentTypeIdentifier,
                mockCallback
            );

            expect(mockDiscoveryService.getInfoObject).toHaveBeenCalled();
            expect(mockDiscoveryService.getInfoObject.mostRecentCall.args[0]).toEqual("contentTypes"); //name
            expect(mockDiscoveryService.getInfoObject.mostRecentCall.args[1]).toEqual(jasmine.any(Function)); //callback

            expect(mockConnectionManager.request).toHaveBeenCalled();
            expect(mockConnectionManager.request.mostRecentCall.args[0]).toEqual("GET"); //method
            expect(mockConnectionManager.request.mostRecentCall.args[1]).toEqual(testContentTypes + "?identifier=" + testContentTypeIdentifier); //url
            expect(mockConnectionManager.request.mostRecentCall.args[2]).toEqual(""); // body
            expect(mockConnectionManager.request.mostRecentCall.args[3].Accept).toEqual("application/vnd.ez.api.ContentTypeInfoList+json"); // headers
            expect(mockConnectionManager.request.mostRecentCall.args[4]).toBe(mockCallback); // callback
        });

        it("deleteContentType", function () {
            contentTypeService.deleteContentType(
                testContentTypeId,
                mockCallback
            );

            expect(mockConnectionManager.delete).toHaveBeenCalled();
            expect(mockConnectionManager.delete.mostRecentCall.args[0]).toEqual(testContentTypeId); //url
            expect(mockConnectionManager.delete.mostRecentCall.args[1]).toBe(mockCallback); // callback
        });

        it("loadContentTypeGroups", function () {
            contentTypeService.loadContentTypeGroups(
                testContentTypeId,
                mockCallback
            );

            expect(mockConnectionManager.request).toHaveBeenCalled();
            expect(mockConnectionManager.request.mostRecentCall.args[0]).toEqual("GET"); //method
            expect(mockConnectionManager.request.mostRecentCall.args[1]).toEqual(testContentTypeId + "/groups"); //url
            expect(mockConnectionManager.request.mostRecentCall.args[2]).toEqual(""); // body
            expect(mockConnectionManager.request.mostRecentCall.args[3].Accept).toEqual("application/vnd.ez.api.ContentTypeGroupRefList+json"); // headers
            expect(mockConnectionManager.request.mostRecentCall.args[4]).toBe(mockCallback); // callback
        });

        it("assignContentTypeGroup", function () {
            contentTypeService.assignContentTypeGroup(
                testContentTypeId,
                testContentTypeGroupId,
                mockCallback
            );

            expect(mockConnectionManager.request).toHaveBeenCalled();
            expect(mockConnectionManager.request.mostRecentCall.args[0]).toEqual("POST"); //method
            expect(mockConnectionManager.request.mostRecentCall.args[1]).toEqual(testContentTypeId + "/groups" + "?group=" + testContentTypeGroupId); //url
            expect(mockConnectionManager.request.mostRecentCall.args[2]).toEqual(""); // body
            expect(mockConnectionManager.request.mostRecentCall.args[3]).toEqual({}); // headers
            expect(mockConnectionManager.request.mostRecentCall.args[4]).toBe(mockCallback); // callback
        });

        it("unassignContentTypeGroup", function () {
            contentTypeService.unassignContentTypeGroup(
                testContentTypeAssignedGroupId,
                mockCallback
            );

            expect(mockConnectionManager.delete).toHaveBeenCalled();
            expect(mockConnectionManager.delete.mostRecentCall.args[0]).toEqual(testContentTypeAssignedGroupId); //url
            expect(mockConnectionManager.delete.mostRecentCall.args[1]).toBe(mockCallback); // callback
        });

        // ******************************
        // Drafts Management
        // ******************************
        it("createContentTypeDraft", function () {

            var contentTypeUpdateStruct = contentTypeService.newContentTypeUpdateStruct();

            contentTypeUpdateStruct.names = {};
            contentTypeUpdateStruct.names.value = [
                {
                    "_languageCode":"eng-US",
                    "#text":"Some new FD Name " + Math.random(10000)
                }
            ];

            contentTypeService.createContentTypeDraft(
                testContentTypeId,
                contentTypeUpdateStruct,
                mockCallback
            );

            expect(mockConnectionManager.request).toHaveBeenCalled();
            expect(mockConnectionManager.request.mostRecentCall.args[0]).toEqual("POST"); //method
            expect(mockConnectionManager.request.mostRecentCall.args[1]).toEqual(testContentTypeId); //url
            expect(mockConnectionManager.request.mostRecentCall.args[2]).toEqual(JSON.stringify(contentTypeUpdateStruct.body)); // body
            expect(mockConnectionManager.request.mostRecentCall.args[3]).toEqual(contentTypeUpdateStruct.headers); // headers
            expect(mockConnectionManager.request.mostRecentCall.args[4]).toBe(mockCallback); // callback

        });

        it("loadContentTypeDraft", function () {
            contentTypeService.loadContentTypeDraft(
                testContentTypeId,
                mockCallback
            );

            expect(mockConnectionManager.request).toHaveBeenCalled();
            expect(mockConnectionManager.request.mostRecentCall.args[0]).toEqual("GET"); //method
            expect(mockConnectionManager.request.mostRecentCall.args[1]).toEqual(testContentTypeId + "/draft"); //url
            expect(mockConnectionManager.request.mostRecentCall.args[2]).toEqual(""); // body
            expect(mockConnectionManager.request.mostRecentCall.args[3].Accept).toEqual("application/vnd.ez.api.ContentType+json"); // headers
            expect(mockConnectionManager.request.mostRecentCall.args[4]).toBe(mockCallback); // callback
        });

        it("updateContentTypeDraftMetadata", function () {

            var contentTypeUpdateStruct = contentTypeService.newContentTypeUpdateStruct();

            contentTypeUpdateStruct.names = {};
            contentTypeUpdateStruct.names.value = [
                {
                    "_languageCode":"eng-US",
                    "#text":"Some new FD Name " + Math.random(10000)
                }
            ];

            contentTypeService.updateContentTypeDraftMetadata(
                testContentTypeDraftId,
                contentTypeUpdateStruct,
                mockCallback
            );

            expect(mockConnectionManager.request).toHaveBeenCalled();
            expect(mockConnectionManager.request.mostRecentCall.args[0]).toEqual("PATCH"); //method
            expect(mockConnectionManager.request.mostRecentCall.args[1]).toEqual(testContentTypeDraftId); //url
            expect(mockConnectionManager.request.mostRecentCall.args[2]).toEqual(JSON.stringify(contentTypeUpdateStruct.body)); // body
            expect(mockConnectionManager.request.mostRecentCall.args[3]).toEqual(contentTypeUpdateStruct.headers); // headers
            expect(mockConnectionManager.request.mostRecentCall.args[4]).toBe(mockCallback); // callback
        });

        it("publishContentTypeDraft", function () {
            contentTypeService.publishContentTypeDraft(
                testContentTypeDraftId,
                mockCallback
            );

            expect(mockConnectionManager.request).toHaveBeenCalled();
            expect(mockConnectionManager.request.mostRecentCall.args[0]).toEqual("PUBLISH"); //method
            expect(mockConnectionManager.request.mostRecentCall.args[1]).toEqual(testContentTypeDraftId); //url
            expect(mockConnectionManager.request.mostRecentCall.args[2]).toEqual(""); // body
            expect(mockConnectionManager.request.mostRecentCall.args[3]).toEqual({}); // headers
            expect(mockConnectionManager.request.mostRecentCall.args[4]).toBe(mockCallback); // callback
        });

        it("deleteContentTypeDraft", function () {
            contentTypeService.deleteContentTypeDraft(
                testContentTypeDraftId,
                mockCallback
            );

            expect(mockConnectionManager.delete).toHaveBeenCalled();
            expect(mockConnectionManager.delete.mostRecentCall.args[0]).toEqual(testContentTypeDraftId); //url
            expect(mockConnectionManager.delete.mostRecentCall.args[1]).toBe(mockCallback); // callback
        });

        // ******************************
        // Fields Definition Management
        // ******************************

        it("addFieldDefinition", function () {

            spyOn(contentTypeService, 'loadContentTypeDraft').andCallFake(fakedLoadContentTypeDraft);

            var fieldDefinitionCreateStruct = contentTypeService.newFieldDefinitionCreateStruct(
                "fd-id-" + Math.random(100),
                "ezstring",
                "content",
                [
                    {
                        "_languageCode":"eng-US",
                        "#text":"Some FD Name " + Math.random(10000)
                    }
                ]
            );

            contentTypeService.addFieldDefinition(
                testContentTypeId,
                fieldDefinitionCreateStruct,
                mockCallback
            );

            expect(mockConnectionManager.request).toHaveBeenCalled();
            expect(mockConnectionManager.request.mostRecentCall.args[0]).toEqual("POST"); //method
            expect(mockConnectionManager.request.mostRecentCall.args[1]).toEqual(testContentTypeDraftFieldDefinitions); //url
            expect(mockConnectionManager.request.mostRecentCall.args[2]).toEqual(JSON.stringify(fieldDefinitionCreateStruct.body)); // body
            expect(mockConnectionManager.request.mostRecentCall.args[3]).toEqual(fieldDefinitionCreateStruct.headers); // headers
            expect(mockConnectionManager.request.mostRecentCall.args[4]).toBe(mockCallback); // callback

        });

        it("loadFieldDefinition", function () {
            contentTypeService.loadFieldDefinition(
                testFieldDefintionId,
                mockCallback
            );

            expect(mockConnectionManager.request).toHaveBeenCalled();
            expect(mockConnectionManager.request.mostRecentCall.args[0]).toEqual("GET"); //method
            expect(mockConnectionManager.request.mostRecentCall.args[1]).toEqual(testFieldDefintionId); //url
            expect(mockConnectionManager.request.mostRecentCall.args[2]).toEqual(""); // body
            expect(mockConnectionManager.request.mostRecentCall.args[3].Accept).toEqual("application/vnd.ez.api.FieldDefinition+json"); // headers
            expect(mockConnectionManager.request.mostRecentCall.args[4]).toBe(mockCallback); // callback
        });

        it("updateFieldDefinition", function () {

            var fieldDefinitionUpdateStruct = contentTypeService.newFieldDefinitionUpdateStruct(
                "dummy",
                "dummy",
                "dummy",
                "dummy"
            );

            contentTypeService.updateFieldDefinition(
                testFieldDefintionId,
                fieldDefinitionUpdateStruct,
                mockCallback
            );

            expect(mockConnectionManager.request).toHaveBeenCalled();
            expect(mockConnectionManager.request.mostRecentCall.args[0]).toEqual("PATCH"); //method
            expect(mockConnectionManager.request.mostRecentCall.args[1]).toEqual(testFieldDefintionId); //url
            expect(mockConnectionManager.request.mostRecentCall.args[2]).toEqual(JSON.stringify(fieldDefinitionUpdateStruct.body)); // body
            expect(mockConnectionManager.request.mostRecentCall.args[3]).toEqual(fieldDefinitionUpdateStruct.headers); // headers
            expect(mockConnectionManager.request.mostRecentCall.args[4]).toBe(mockCallback); // callback
        });

        it("deleteFieldDefinition", function () {
            contentTypeService.deleteFieldDefinition(
                testFieldDefintionId,
                mockCallback
            );

            expect(mockConnectionManager.delete).toHaveBeenCalled();
            expect(mockConnectionManager.delete.mostRecentCall.args[0]).toEqual(testFieldDefintionId); //url
            expect(mockConnectionManager.delete.mostRecentCall.args[1]).toBe(mockCallback); // callback
        });

        // ******************************
        // Structures
        // ******************************
        describe("creating structures", function () {

            it("newContentTypeGroupInputStruct", function(){

                testStructure = contentTypeService.newContentTypeGroupInputStruct(
                    testContentTypeGroupIdentifier
                );

                expect(testStructure).toEqual(jasmine.any(ContentTypeGroupInputStruct));
                expect(testStructure.body.ContentTypeGroupInput.identifier).toEqual(testContentTypeGroupIdentifier);
            });

            it("newContentTypeCreateStruct", function(){

                testStructure = contentTypeService.newContentTypeCreateStruct(
                    testContentTypeIdentifier,
                    testLanguage,
                    testArray
                );

                expect(testStructure).toEqual(jasmine.any(ContentTypeCreateStruct));
                expect(testStructure.body.ContentTypeCreate.identifier).toEqual(testContentTypeIdentifier);
                expect(testStructure.body.ContentTypeCreate.mainLanguageCode).toEqual(testLanguage);
                expect(testStructure.body.ContentTypeCreate.names.value).toEqual(testArray);
            });

            it("newContentTypeUpdateStruct", function(){

                testStructure = contentTypeService.newContentTypeUpdateStruct();

                expect(testStructure).toEqual(jasmine.any(ContentTypeUpdateStruct));
            });

            it("newFieldDefinitionCreateStruct", function(){

                testStructure = contentTypeService.newFieldDefinitionCreateStruct(
                    testContentTypeIdentifier,
                    testFieldDefintionType,
                    testFieldDefintionGroup,
                    testArray
                );

                expect(testStructure).toEqual(jasmine.any(FieldDefinitionCreateStruct));
                expect(testStructure.body.FieldDefinitionCreate.identifier).toEqual(testContentTypeIdentifier);
                expect(testStructure.body.FieldDefinitionCreate.fieldType).toEqual(testFieldDefintionType);
                expect(testStructure.body.FieldDefinitionCreate.fieldGroup).toEqual(testFieldDefintionGroup);
                expect(testStructure.body.FieldDefinitionCreate.names.value).toEqual(testArray);
            });

            it("newFieldDefinitionUpdateStruct", function(){

                testStructure = contentTypeService.newFieldDefinitionUpdateStruct();

                expect(testStructure).toEqual(jasmine.any(FieldDefinitionUpdateStruct));
            });

        });

    });

// ******************************
// Cases with errors
// ******************************

    describe("is returning errors correctly, while", function (){

        // ******************************
        // Faked faulty internal service calls
        // ******************************
        var fakedFaultyLoadContentTypeGroup = function(ContentTypeGroupId, callback){
                callback(
                    new CAPIError({
                        errorText : "Content type service failed for some reason"
                    }),
                    false
                );
            },
            fakedFaultyLoadContentTypeDraft = function(ContentTypeId, callback){
                callback(
                    new CAPIError({
                        errorText : "Content type service failed for some reason"
                    }),
                    false
                );
            };

        it("running loadContentTypeByIdentifier call", function () {

            mockFaultyDiscoveryService = {
                getInfoObject : function(name, callback){
                    callback(
                        new CAPIError({
                            errorText : "Discovery service failed for some reason"
                        }),
                        false
                    );
                }
            };

            spyOn(mockFaultyDiscoveryService, 'getInfoObject').andCallThrough();

            contentTypeService = new ContentTypeService(mockConnectionManager, mockFaultyDiscoveryService);

            contentTypeService.loadContentTypeByIdentifier(
                testContentTypeIdentifier,
                mockCallback
            );

            expect(mockFaultyDiscoveryService.getInfoObject).toHaveBeenCalled();

            expect(mockCallback).toHaveBeenCalled();
            expect(mockCallback.mostRecentCall.args[0]).toEqual(jasmine.any(CAPIError)); //error
            expect(mockCallback.mostRecentCall.args[1]).toEqual(false); //response

        });

        describe("dealing with faulty inner calls", function(){

            beforeEach(function (){
                discoveryService = new DiscoveryService(
                    mockConnectionManager,
                    mockDiscoveryService
                );
            });

            it("loadContentTypes", function () {

                spyOn(contentTypeService, 'loadContentTypeGroup').andCallFake(fakedFaultyLoadContentTypeGroup);

                contentTypeService.loadContentTypes(
                    testContentTypeGroupId,
                    mockCallback
                );

                expect(mockCallback).toHaveBeenCalled();
                expect(mockCallback.mostRecentCall.args[0]).toEqual(jasmine.any(CAPIError)); //error
                expect(mockCallback.mostRecentCall.args[1]).toEqual(false); //response
            });

            it("createContentType", function () {

                spyOn(contentTypeService, 'loadContentTypeGroup').andCallFake(fakedFaultyLoadContentTypeGroup);

                var contentTypeCreateStruct,
                    fieldDefinition;

                contentTypeCreateStruct = contentTypeService.newContentTypeCreateStruct(
                    "content-type-id-" + Math.random(100),
                    "eng-US",
                    [
                        {
                            "_languageCode":"eng-US",
                            "#text":"Some Name " + Math.random(10000)
                        }
                    ]
                );

                fieldDefinition = contentTypeService.newFieldDefinitionCreateStruct(
                    "fd-id-" + Math.random(100),
                    "ezstring",
                    "content",
                    [
                        {
                            "_languageCode":"eng-US",
                            "#text":"Some FD Name " + Math.random(10000)
                        }
                    ]
                );

                contentTypeCreateStruct.body.ContentTypeCreate.FieldDefinitions.FieldDefinition.push(fieldDefinition.body.FieldDefinitionCreate);

                contentTypeService.createContentType(
                    testContentTypeGroupId,
                    contentTypeCreateStruct,
                    testTrue,
                    mockCallback
                );

                expect(mockCallback).toHaveBeenCalled();
                expect(mockCallback.mostRecentCall.args[0]).toEqual(jasmine.any(CAPIError)); //error
                expect(mockCallback.mostRecentCall.args[1]).toEqual(false); //response
            });

            it("addFieldDefinition", function () {

                spyOn(contentTypeService, 'loadContentTypeDraft').andCallFake(fakedFaultyLoadContentTypeDraft);

                var fieldDefinitionCreateStruct = contentTypeService.newFieldDefinitionCreateStruct(
                    "fd-id-" + Math.random(100),
                    "ezstring",
                    "content",
                    [
                        {
                            "_languageCode":"eng-US",
                            "#text":"Some FD Name " + Math.random(10000)
                        }
                    ]
                );

                contentTypeService.addFieldDefinition(
                    testContentTypeId,
                    fieldDefinitionCreateStruct,
                    mockCallback
                );

                expect(mockCallback).toHaveBeenCalled();
                expect(mockCallback.mostRecentCall.args[0]).toEqual(jasmine.any(CAPIError)); //error
                expect(mockCallback.mostRecentCall.args[1]).toEqual(false); //response
            });

        });
    });

});