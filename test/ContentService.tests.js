define(function (require) {

    // Declaring dependencies
    var ContentService = require("services/ContentService"),
        CAPIError = require("structures/CAPIError"),

        ContentCreateStruct = require("structures/ContentCreateStruct"),
        ContentUpdateStruct = require("structures/ContentUpdateStruct"),
        SectionInputStruct = require("structures/SectionInputStruct"),
        LocationCreateStruct = require("structures/LocationCreateStruct"),
        LocationUpdateStruct = require("structures/LocationUpdateStruct"),
        ContentMetadataUpdateStruct = require("structures/ContentMetadataUpdateStruct"),
        ObjectStateGroupCreateStruct = require("structures/ObjectStateGroupCreateStruct"),
        ObjectStateGroupUpdateStruct = require("structures/ObjectStateGroupUpdateStruct"),
        ObjectStateCreateStruct = require("structures/ObjectStateCreateStruct"),
        ObjectStateUpdateStruct = require("structures/ObjectStateUpdateStruct"),
        ViewCreateStruct = require("structures/ViewCreateStruct"),
        UrlAliasCreateStruct = require("structures/UrlAliasCreateStruct"),
        UrlWildcardCreateStruct = require("structures/UrlWildcardCreateStruct"),
        RelationCreateStruct = require('structures/RelationCreateStruct');


    describe("ContentService", function () {

        var mockDiscoveryService,
            mockFaultyDiscoveryService,
            mockConnectionManager,
            mockCallback,
            contentService,

            rootId = '/api/ezp/v2/',
            testContentObjects = '/api/ezp/v2/content/objects',
            testContentId = '/api/ezp/v2/content/objects/173',
            testRemoteId = '30847bec12a8a398777493a4bdb10398',
            testVersionedContentId = '/api/ezp/v2/content/objects/173/version/1',
            testVersionsList = '/api/ezp/v2/content/objects/173/versions',
            testContentLocations = '/api/ezp/v2/content/objects/173/locations',
            testLocation = '/api/ezp/v2/content/locations/1/2/102',
            testLocationChildren = '/api/ezp/v2/content/locations/1/2/102/children',
            testVersionRelations = '/api/ezp/v2/content/objects/173/version/1/relations',
            testRelationId = '/api/ezp/v2/content/objects/102/versions/5/relations/1',
            testViews = '/api/ezp/v2/content/views',
            testUrlAliases = '/api/ezp/v2/content/urlaliases',
            testUrlAlias = '/api/ezp/v2/content/urlaliases/0-a903c03b86eb2987889afa5fe17004eb',
            testUrlWildcards = '/api/ezp/v2/content/urlwildcards',
            testUrlWildcard = '/api/ezp/v2/content/urlwildcards/1',
            testObjectStateGroups = '/api/ezp/v2/content/objectstategroups',
            testObjectStateGroup = '/api/ezp/v2/content/objectstategroups/1',
            testObjectState = '/api/ezp/v2/content/objectstategroups/7/objectstates/5',
            testTrashItem = '/api/ezp/v2/content/trash/1',
            testSections = '/api/ezp/v2/content/sections',
            testSection = '/api/ezp/v2/content/sections/1',
            trash = '/api/ezp/v2/content/trash',
            testOffset = 2,
            testLimit = 5,
            defaultOffset = 0,
            defaultLimit = -1,
            testStructure,
            testLanguage = "eng-US",
            testUser = {testUser : {}},
            testContentTypeId = "/api/ezp/v2/content/types/18",
            testLocationCreateStruct = {
                body : {
                    LocationCreate : {
                        sortField : "PATH"
                    }
                }
            },
            testIdentifier = "some-test-id",
            testArray = ["one", "two", "three"],
            testUrl = "/something-or-other/",
            testTrue = true,
            testSectionName = "Some Section";


    // ******************************
    // Cases without errors
    // ******************************
        describe("is calling injected objects with right arguments while performing:", function () {

            // ******************************
            // Faked internal service calls
            // ******************************
            var fakedLoadContentInfo = function(contentId, callback){
                    var mockContentResponse = {};
                    mockContentResponse.document = {
                        "Content" : {
                            "Versions" : {
                                "_href" : testVersionsList,
                                "_media-type" : "application/vnd.ez.api.VersionList+json"
                            },
                            "CurrentVersion" : {
                                "_href" : testVersionedContentId,
                                "_media-type" : "application/vnd.ez.api.Version+json"
                            },
                            "Locations" : {
                                "_href" : testContentLocations,
                                "_media-type" : "application/vnd.ez.api.LocationList+json"
                            }
                        }
                    };
                    callback(false, mockContentResponse);
                },

                fakedLoadCurrentVersion = function(contentId, callback){
                    var mockVersionResponse = {};
                    mockVersionResponse.document = {
                        "Version" : {
                            "_href" : testVersionedContentId,
                            "_media-type" : "application/vnd.ez.api.Version+json",
                            Relations : {
                                "_href" : testVersionRelations,
                                "_media-type" : "application/vnd.ez.api.RelationList+json"
                            }
                        }
                    };
                    callback(false, mockVersionResponse);
                },

                fakedLoadContent = function(versionedContentId, params, callback){
                    var mockVersionResponse = {};
                    mockVersionResponse.document = {
                        "Version" : {
                            "_href" : testVersionedContentId,
                            "_media-type" : "application/vnd.ez.api.Version+json",
                            Relations : {
                                "_href" : testVersionRelations,
                                "_media-type" : "application/vnd.ez.api.RelationList+json"
                            }
                        }
                    };
                    callback(false, mockVersionResponse);
                },

                fakedLoadLocation = function(locationId, callback){
                    var mockLocationResponse = {};
                    mockLocationResponse.document = {
                        "Location" : {
                            "_href" : testLocation,
                            "_media-type" : "application/vnd.ez.api.Location+json",
                            Children : {
                                "_href" : testLocationChildren ,
                                "_media-type" : "application/vnd.ez.api.LocationList+json"
                            }
                        }
                    };
                    callback(false, mockLocationResponse);
                };

            // ******************************
            // beforeEach for positive cases
            // ******************************
            beforeEach(function (){
                mockConnectionManager = jasmine.createSpyObj('mockConnectionManager', ['request', 'delete']);
                mockCallback = jasmine.createSpy('mockCallback');

                mockDiscoveryService = {
                    getInfoObject : function(name, callback){

                        if (name === "content"){
                            callback(
                                false,
                                {
                                    "_href" : testContentObjects,
                                    "_media-type" : ""
                                }
                            );
                        }

                        if (name === "sections"){
                            callback(
                                false,
                                {
                                    "_href" : testSections,
                                    "_media-type" : "application/vnd.ez.api.SectionList+json"
                                }
                            );
                        }

                        if (name === "views"){
                            callback(
                                false,
                                {
                                    "_href" : testViews,
                                    "_media-type" : "application/vnd.ez.api.RefList+json"
                                }
                            );
                        }

                        if (name === "trash"){
                            callback(
                                false,
                                {
                                    "_href" : trash,
                                    "_media-type" : "application/vnd.ez.api.Trash+json"
                                }
                            );
                        }

                    }
                }

                spyOn(mockDiscoveryService, 'getInfoObject').andCallThrough();

                contentService = new ContentService(mockConnectionManager, mockDiscoveryService);
            });

            it("loadRoot", function () {

                contentService.loadRoot(
                    rootId,
                    mockCallback
                );

                expect(mockConnectionManager.request).toHaveBeenCalled();
                expect(mockConnectionManager.request.mostRecentCall.args[0]).toEqual("GET"); //method
                expect(mockConnectionManager.request.mostRecentCall.args[1]).toEqual(rootId); //url
                expect(mockConnectionManager.request.mostRecentCall.args[2]).toEqual(""); // body
                expect(mockConnectionManager.request.mostRecentCall.args[3].Accept).toEqual("application/vnd.ez.api.Root+json"); // headers
                expect(mockConnectionManager.request.mostRecentCall.args[4]).toBe(mockCallback); // callback

            });

            it("createView", function () {

                var viewCreateStruct = contentService.newViewCreateStruct('some-test-id');

                viewCreateStruct.body.ViewInput.Query.Criteria = {
                    FullTextCriterion : "title"
                };

                contentService.createView(
                    viewCreateStruct,
                    mockCallback
                );

                expect(mockDiscoveryService.getInfoObject).toHaveBeenCalledWith("views", jasmine.any(Function));

                expect(mockConnectionManager.request).toHaveBeenCalled();
                expect(mockConnectionManager.request.mostRecentCall.args[0]).toEqual("POST"); //method
                expect(mockConnectionManager.request.mostRecentCall.args[1]).toEqual(testViews); //url
                expect(mockConnectionManager.request.mostRecentCall.args[2]).toEqual(JSON.stringify(viewCreateStruct.body)); // body
                expect(mockConnectionManager.request.mostRecentCall.args[3]).toEqual(viewCreateStruct.headers); // headers
                expect(mockConnectionManager.request.mostRecentCall.args[4]).toBe(mockCallback); // callback

            });


            // ******************************
            // Content management
            // ******************************
            describe("Content management request:", function () {

                it("createContent", function () {

                    var locationCreateStruct = contentService.newLocationCreateStruct("/api/ezp/v2/content/locations/1/2/118"),
                        contentCreateStruct = contentService.newContentCreateStruct(
                            "/api/ezp/v2/content/types/18",
                            locationCreateStruct,
                            "eng-US",
                            "DummyUser"
                        ),
                        fieldInfo = {
                            "fieldDefinitionIdentifier": "title",
                            "languageCode": "eng-US",
                            "fieldValue": "This is a title"
                        };

                    contentCreateStruct.body.ContentCreate.fields.field.push(fieldInfo);

                    contentService.createContent(
                        contentCreateStruct,
                        mockCallback
                    );

                    expect(mockDiscoveryService.getInfoObject).toHaveBeenCalledWith("content", jasmine.any(Function));

                    expect(mockConnectionManager.request).toHaveBeenCalled();
                    expect(mockConnectionManager.request.mostRecentCall.args[0]).toEqual("POST"); //method
                    expect(mockConnectionManager.request.mostRecentCall.args[1]).toEqual(testContentObjects); //url
                    expect(mockConnectionManager.request.mostRecentCall.args[2]).toEqual(JSON.stringify(contentCreateStruct.body)); // body
                    expect(mockConnectionManager.request.mostRecentCall.args[3]).toEqual(contentCreateStruct.headers); // headers
                    expect(mockConnectionManager.request.mostRecentCall.args[4]).toBe(mockCallback); // callback
                });

                it("updateContentMetadata", function () {

                    var updateStruct = contentService.newContentMetadataUpdateStruct(
                        "eng-US"
                    );

                    updateStruct.body.ContentUpdate.Section = "/api/ezp/v2/content/sections/2";
                    updateStruct.body.ContentUpdate.remoteId = "random-id-" + Math.random()*1000000;

                    contentService.updateContentMetadata(
                        testContentId,
                        updateStruct,
                        mockCallback
                    );

                    expect(mockConnectionManager.request).toHaveBeenCalled();
                    expect(mockConnectionManager.request.mostRecentCall.args[0]).toEqual("PATCH"); //method
                    expect(mockConnectionManager.request.mostRecentCall.args[1]).toEqual(testContentId); //url
                    expect(mockConnectionManager.request.mostRecentCall.args[2]).toEqual(JSON.stringify(updateStruct.body)); // body
                    expect(mockConnectionManager.request.mostRecentCall.args[3]).toEqual(updateStruct.headers); // headers
                    expect(mockConnectionManager.request.mostRecentCall.args[4]).toBe(mockCallback); // callback
                });

                it("loadContentInfo", function () {
                    contentService.loadContentInfo(
                        testContentId,
                        mockCallback
                    );

                    expect(mockConnectionManager.request).toHaveBeenCalled();
                    expect(mockConnectionManager.request.mostRecentCall.args[0]).toEqual("GET"); //method
                    expect(mockConnectionManager.request.mostRecentCall.args[1]).toEqual(testContentId); //url
                    expect(mockConnectionManager.request.mostRecentCall.args[2]).toEqual(""); // body
                    expect(mockConnectionManager.request.mostRecentCall.args[3].Accept).toEqual("application/vnd.ez.api.ContentInfo+json"); // headers
                    expect(mockConnectionManager.request.mostRecentCall.args[4]).toBe(mockCallback); // callback
                });

                it("loadContentInfoAndCurrentVersion", function () {
                    contentService.loadContentInfoAndCurrentVersion(
                        testContentId,
                        mockCallback
                    );

                    expect(mockConnectionManager.request).toHaveBeenCalled();
                    expect(mockConnectionManager.request.mostRecentCall.args[0]).toEqual("GET"); //method
                    expect(mockConnectionManager.request.mostRecentCall.args[1]).toEqual(testContentId); //url
                    expect(mockConnectionManager.request.mostRecentCall.args[2]).toEqual(""); // body
                    expect(mockConnectionManager.request.mostRecentCall.args[3].Accept).toEqual("application/vnd.ez.api.Content+json"); // headers
                    expect(mockConnectionManager.request.mostRecentCall.args[4]).toBe(mockCallback); // callback
                });

                it("deleteContent", function () {
                    contentService.deleteContent(
                        testContentId,
                        mockCallback
                    );

                    expect(mockConnectionManager.delete).toHaveBeenCalled();
                    expect(mockConnectionManager.delete.mostRecentCall.args[0]).toEqual(testContentId); //url
                    expect(mockConnectionManager.delete.mostRecentCall.args[1]).toBe(mockCallback); // callback
                });

                it("copyContent", function () {
                    contentService.copyContent(
                        testContentId,
                        testLocation,
                        mockCallback
                    );

                    expect(mockConnectionManager.request).toHaveBeenCalled();
                    expect(mockConnectionManager.request.mostRecentCall.args[0]).toEqual("COPY"); //method
                    expect(mockConnectionManager.request.mostRecentCall.args[1]).toEqual(testContentId); //url
                    expect(mockConnectionManager.request.mostRecentCall.args[2]).toEqual(""); // body
                    expect(mockConnectionManager.request.mostRecentCall.args[3].Destination).toEqual(testLocation); // headers
                    expect(mockConnectionManager.request.mostRecentCall.args[4]).toBe(mockCallback); // callback
                });

                it("loadContentByRemoteId", function () {
                    contentService.loadContentByRemoteId(
                        testRemoteId,
                        mockCallback
                    );

                    expect(mockDiscoveryService.getInfoObject).toHaveBeenCalledWith("content", jasmine.any(Function));

                    expect(mockConnectionManager.request).toHaveBeenCalled();
                    expect(mockConnectionManager.request.mostRecentCall.args[0]).toEqual("GET"); //method
                    expect(mockConnectionManager.request.mostRecentCall.args[1]).toEqual(testContentObjects + "?remoteId=" + testRemoteId); //url
                    expect(mockConnectionManager.request.mostRecentCall.args[2]).toEqual(""); // body
                    expect(mockConnectionManager.request.mostRecentCall.args[3].Accept).toEqual(""); // headers
                    expect(mockConnectionManager.request.mostRecentCall.args[4]).toBe(mockCallback); // callback
                });

            });

            // ******************************
            // Versions management
            // ******************************
            describe("Versions management request:", function () {

                it("loadCurrentVersion", function () {

                    spyOn(contentService, 'loadContentInfo').andCallFake(fakedLoadContentInfo);

                    contentService.loadCurrentVersion(
                        testContentId,
                        mockCallback
                    );

                    expect(mockConnectionManager.request).toHaveBeenCalled();
                    expect(mockConnectionManager.request.mostRecentCall.args[0]).toEqual("GET"); //method
                    expect(mockConnectionManager.request.mostRecentCall.args[1]).toEqual(testVersionedContentId); //url
                    expect(mockConnectionManager.request.mostRecentCall.args[2]).toEqual(""); // body
                    expect(mockConnectionManager.request.mostRecentCall.args[3].Accept).toEqual("application/vnd.ez.api.Version+json"); // headers
                    expect(mockConnectionManager.request.mostRecentCall.args[4]).toBe(mockCallback); // callback
                });

                it("loadVersions", function () {

                    spyOn(contentService, 'loadContentInfo').andCallFake(fakedLoadContentInfo);

                    contentService.loadVersions(
                        testContentId,
                        mockCallback
                    );

                    expect(mockConnectionManager.request).toHaveBeenCalled();
                    expect(mockConnectionManager.request.mostRecentCall.args[0]).toEqual("GET"); //method
                    expect(mockConnectionManager.request.mostRecentCall.args[1]).toEqual(testVersionsList); //url
                    expect(mockConnectionManager.request.mostRecentCall.args[2]).toEqual(""); // body
                    expect(mockConnectionManager.request.mostRecentCall.args[3].Accept).toEqual("application/vnd.ez.api.VersionList+json"); // headers
                    expect(mockConnectionManager.request.mostRecentCall.args[4]).toBe(mockCallback); // callback
                });

                it("loadContent", function () {

                    contentService.loadContent(
                        testVersionedContentId,
                        'testFields',
                        'testResponseGroups',
                        'testLanguages',
                        mockCallback
                    );

                    expect(mockConnectionManager.request).toHaveBeenCalled();
                    expect(mockConnectionManager.request.mostRecentCall.args[0]).toEqual("GET"); //method
                    expect(mockConnectionManager.request.mostRecentCall.args[1]).toEqual(testVersionedContentId + '?fields=testFields&responseGroups="testResponseGroups"&languages=testLanguages'); //url
                    expect(mockConnectionManager.request.mostRecentCall.args[2]).toEqual(""); // body
                    expect(mockConnectionManager.request.mostRecentCall.args[3].Accept).toEqual("application/vnd.ez.api.Version+json"); // headers
                    expect(mockConnectionManager.request.mostRecentCall.args[4]).toBe(mockCallback); // callback
                });

                it("loadContent with omitted params", function () {

                    contentService.loadContent(
                        testVersionedContentId,
                        mockCallback
                    );

                    expect(mockConnectionManager.request).toHaveBeenCalled();
                    expect(mockConnectionManager.request.mostRecentCall.args[0]).toEqual("GET"); //method
                    expect(mockConnectionManager.request.mostRecentCall.args[1]).toEqual(testVersionedContentId); //url
                    expect(mockConnectionManager.request.mostRecentCall.args[2]).toEqual(""); // body
                    expect(mockConnectionManager.request.mostRecentCall.args[3].Accept).toEqual("application/vnd.ez.api.Version+json"); // headers
                    expect(mockConnectionManager.request.mostRecentCall.args[4]).toBe(mockCallback); // callback
                });

                it("loadContent with 1 optional parameter", function () {

                    contentService.loadContent(
                        testVersionedContentId,
                        'testFields',
                        mockCallback
                    );

                    expect(mockConnectionManager.request).toHaveBeenCalled();
                    expect(mockConnectionManager.request.mostRecentCall.args[0]).toEqual("GET"); //method
                    expect(mockConnectionManager.request.mostRecentCall.args[1]).toEqual(testVersionedContentId + '?fields=testFields'); //url
                    expect(mockConnectionManager.request.mostRecentCall.args[2]).toEqual(""); // body
                    expect(mockConnectionManager.request.mostRecentCall.args[3].Accept).toEqual("application/vnd.ez.api.Version+json"); // headers
                    expect(mockConnectionManager.request.mostRecentCall.args[4]).toBe(mockCallback); // callback
                });

                it("loadContent with 2 optional parameters", function () {

                    contentService.loadContent(
                        testVersionedContentId,
                        'testFields',
                        'testResponseGroups',
                        mockCallback
                    );

                    expect(mockConnectionManager.request).toHaveBeenCalled();
                    expect(mockConnectionManager.request.mostRecentCall.args[0]).toEqual("GET"); //method
                    expect(mockConnectionManager.request.mostRecentCall.args[1]).toEqual(testVersionedContentId + '?fields=testFields&responseGroups="testResponseGroups"'); //url
                    expect(mockConnectionManager.request.mostRecentCall.args[2]).toEqual(""); // body
                    expect(mockConnectionManager.request.mostRecentCall.args[3].Accept).toEqual("application/vnd.ez.api.Version+json"); // headers
                    expect(mockConnectionManager.request.mostRecentCall.args[4]).toBe(mockCallback); // callback
                });

                it("updateContent", function () {

                    var contentUpdateStruct = contentService.newContentUpdateStruct(
                        "eng-US"
                    );

                    var fieldInfo = {
                        "fieldDefinitionIdentifier": "title",
                        "languageCode": "eng-US",
                        "fieldValue": "This is a new title" + Math.random()*1000000
                    };

                    contentUpdateStruct.body.VersionUpdate.fields.field.push(fieldInfo);

                    contentService.updateContent(
                        testVersionedContentId,
                        contentUpdateStruct,
                        mockCallback
                    );

                    expect(mockConnectionManager.request).toHaveBeenCalled();
                    expect(mockConnectionManager.request.mostRecentCall.args[0]).toEqual("PATCH"); //method
                    expect(mockConnectionManager.request.mostRecentCall.args[1]).toEqual(testVersionedContentId); //url
                    expect(mockConnectionManager.request.mostRecentCall.args[2]).toEqual(JSON.stringify(contentUpdateStruct.body)); // body
                    expect(mockConnectionManager.request.mostRecentCall.args[3]).toEqual(contentUpdateStruct.headers); // headers
                    expect(mockConnectionManager.request.mostRecentCall.args[4]).toBe(mockCallback); // callback

                });

                it("createContentDraft from current version", function () {

                    spyOn(contentService, 'loadContentInfo').andCallFake(fakedLoadContentInfo);

                    contentService.createContentDraft(
                        testContentId,
                        mockCallback
                    );

                    expect(mockConnectionManager.request).toHaveBeenCalled();
                    expect(mockConnectionManager.request.mostRecentCall.args[0]).toEqual("COPY"); //method
                    expect(mockConnectionManager.request.mostRecentCall.args[1]).toEqual(testVersionedContentId); //url
                    expect(mockConnectionManager.request.mostRecentCall.args[2]).toEqual(""); // body
                    expect(mockConnectionManager.request.mostRecentCall.args[3].Accept).toEqual("application/vnd.ez.api.Version+json"); // headers
                    expect(mockConnectionManager.request.mostRecentCall.args[4]).toBe(mockCallback); // callback
                });

                it("createContentDraft from specified version", function () {

                    spyOn(contentService, 'loadContentInfo').andCallFake(fakedLoadContentInfo);

                    contentService.createContentDraft(
                        testContentId,
                        1,
                        mockCallback
                    );

                    expect(mockConnectionManager.request).toHaveBeenCalled();
                    expect(mockConnectionManager.request.mostRecentCall.args[0]).toEqual("COPY"); //method
                    expect(mockConnectionManager.request.mostRecentCall.args[1]).toEqual(testVersionsList + "/" + 1); //url
                    expect(mockConnectionManager.request.mostRecentCall.args[2]).toEqual(""); // body
                    expect(mockConnectionManager.request.mostRecentCall.args[3].Accept).toEqual("application/vnd.ez.api.Version+json"); // headers
                    expect(mockConnectionManager.request.mostRecentCall.args[4]).toBe(mockCallback); // callback
                });

                it("deleteVersion", function () {

                    contentService.deleteVersion(
                        testVersionedContentId,
                        mockCallback
                    );

                    expect(mockConnectionManager.delete).toHaveBeenCalled();
                    expect(mockConnectionManager.delete.mostRecentCall.args[0]).toEqual(testVersionedContentId); //url
                    expect(mockConnectionManager.delete.mostRecentCall.args[1]).toBe(mockCallback); // callback
                });

                it("publishVersion", function () {

                    contentService.publishVersion(
                        testVersionedContentId,
                        mockCallback
                    );

                    expect(mockConnectionManager.request).toHaveBeenCalled();
                    expect(mockConnectionManager.request.mostRecentCall.args[0]).toEqual("PUBLISH"); //method
                    expect(mockConnectionManager.request.mostRecentCall.args[1]).toEqual(testVersionedContentId); //url
                    expect(mockConnectionManager.request.mostRecentCall.args[2]).toEqual(""); // body
                    expect(mockConnectionManager.request.mostRecentCall.args[3]).toEqual({}); // headers
                    expect(mockConnectionManager.request.mostRecentCall.args[4]).toBe(mockCallback); // callback
                });

            });

            // ******************************
            // Relations management
            // ******************************
            describe("Relations management request:", function () {

                it("loadCurrentRelations", function () {

                    spyOn(contentService, 'loadCurrentVersion').andCallFake(fakedLoadCurrentVersion);

                    contentService.loadCurrentRelations(
                        testContentId,
                        testLimit,
                        testOffset,
                        mockCallback
                    );

                    expect(mockConnectionManager.request).toHaveBeenCalled();
                    expect(mockConnectionManager.request.mostRecentCall.args[0]).toEqual("GET"); //method
                    expect(mockConnectionManager.request.mostRecentCall.args[1]).toEqual(testVersionRelations + '?offset=' + testOffset + '&limit=' + testLimit); //url
                    expect(mockConnectionManager.request.mostRecentCall.args[2]).toEqual(""); // body
                    expect(mockConnectionManager.request.mostRecentCall.args[3].Accept).toEqual("application/vnd.ez.api.RelationList+json"); // headers
                    expect(mockConnectionManager.request.mostRecentCall.args[4]).toBe(mockCallback); // callback
                });

                it("loadCurrentRelations with omitted params", function () {

                    spyOn(contentService, 'loadCurrentVersion').andCallFake(fakedLoadCurrentVersion);

                    contentService.loadCurrentRelations(
                        testContentId,
                        mockCallback
                    );

                    expect(mockConnectionManager.request).toHaveBeenCalled();
                    expect(mockConnectionManager.request.mostRecentCall.args[0]).toEqual("GET"); //method
                    expect(mockConnectionManager.request.mostRecentCall.args[1]).toEqual(testVersionRelations + '?offset=' + defaultOffset + '&limit=' + defaultLimit); //url
                    expect(mockConnectionManager.request.mostRecentCall.args[2]).toEqual(""); // body
                    expect(mockConnectionManager.request.mostRecentCall.args[3].Accept).toEqual("application/vnd.ez.api.RelationList+json"); // headers
                    expect(mockConnectionManager.request.mostRecentCall.args[4]).toBe(mockCallback); // callback
                });

                it("loadCurrentRelations with 1 optional param", function () {

                    spyOn(contentService, 'loadCurrentVersion').andCallFake(fakedLoadCurrentVersion);

                    contentService.loadCurrentRelations(
                        testContentId,
                        testLimit,
                        mockCallback
                    );

                    expect(mockConnectionManager.request).toHaveBeenCalled();
                    expect(mockConnectionManager.request.mostRecentCall.args[0]).toEqual("GET"); //method
                    expect(mockConnectionManager.request.mostRecentCall.args[1]).toEqual(testVersionRelations + '?offset=' + defaultOffset + '&limit=' + testLimit); //url
                    expect(mockConnectionManager.request.mostRecentCall.args[2]).toEqual(""); // body
                    expect(mockConnectionManager.request.mostRecentCall.args[3].Accept).toEqual("application/vnd.ez.api.RelationList+json"); // headers
                    expect(mockConnectionManager.request.mostRecentCall.args[4]).toBe(mockCallback); // callback
                });

                it("loadRelations", function () {

                    spyOn(contentService, 'loadContent').andCallFake(fakedLoadContent);

                    contentService.loadRelations(
                        testVersionedContentId,
                        testLimit,
                        testOffset,
                        mockCallback
                    );

                    expect(mockConnectionManager.request).toHaveBeenCalled();
                    expect(mockConnectionManager.request.mostRecentCall.args[0]).toEqual("GET"); //method
                    expect(mockConnectionManager.request.mostRecentCall.args[1]).toEqual(testVersionRelations + '?offset=' + testOffset + '&limit=' + testLimit); //url
                    expect(mockConnectionManager.request.mostRecentCall.args[2]).toEqual(""); // body
                    expect(mockConnectionManager.request.mostRecentCall.args[3].Accept).toEqual("application/vnd.ez.api.RelationList+json"); // headers
                    expect(mockConnectionManager.request.mostRecentCall.args[4]).toBe(mockCallback); // callback
                });

                it("loadRelations with omitted params", function () {

                    spyOn(contentService, 'loadContent').andCallFake(fakedLoadContent);

                    contentService.loadRelations(
                        testVersionedContentId,
                        mockCallback
                    );

                    expect(mockConnectionManager.request).toHaveBeenCalled();
                    expect(mockConnectionManager.request.mostRecentCall.args[0]).toEqual("GET"); //method
                    expect(mockConnectionManager.request.mostRecentCall.args[1]).toEqual(testVersionRelations + '?offset=' + defaultOffset + '&limit=' + defaultLimit); //url
                    expect(mockConnectionManager.request.mostRecentCall.args[2]).toEqual(""); // body
                    expect(mockConnectionManager.request.mostRecentCall.args[3].Accept).toEqual("application/vnd.ez.api.RelationList+json"); // headers
                    expect(mockConnectionManager.request.mostRecentCall.args[4]).toBe(mockCallback); // callback
                });

                it("loadRelations with 1 optional param", function () {

                    spyOn(contentService, 'loadContent').andCallFake(fakedLoadContent);

                    contentService.loadRelations(
                        testVersionedContentId,
                        testLimit,
                        mockCallback
                    );

                    expect(mockConnectionManager.request).toHaveBeenCalled();
                    expect(mockConnectionManager.request.mostRecentCall.args[0]).toEqual("GET"); //method
                    expect(mockConnectionManager.request.mostRecentCall.args[1]).toEqual(testVersionRelations + '?offset=' + defaultOffset + '&limit=' + testLimit); //url
                    expect(mockConnectionManager.request.mostRecentCall.args[2]).toEqual(""); // body
                    expect(mockConnectionManager.request.mostRecentCall.args[3].Accept).toEqual("application/vnd.ez.api.RelationList+json"); // headers
                    expect(mockConnectionManager.request.mostRecentCall.args[4]).toBe(mockCallback); // callback
                });


                it("loadRelation", function () {
                    contentService.loadRelation(
                        testRelationId,
                        mockCallback
                    );

                    expect(mockConnectionManager.request).toHaveBeenCalled();
                    expect(mockConnectionManager.request.mostRecentCall.args[0]).toEqual("GET"); //method
                    expect(mockConnectionManager.request.mostRecentCall.args[1]).toEqual(testRelationId); //url
                    expect(mockConnectionManager.request.mostRecentCall.args[2]).toEqual(""); // body
                    expect(mockConnectionManager.request.mostRecentCall.args[3].Accept).toEqual("application/vnd.ez.api.Relation+json"); // headers
                    expect(mockConnectionManager.request.mostRecentCall.args[4]).toBe(mockCallback); // callback
                });

                it("createRelation", function () {
                    var relationCreateStruct = contentService.newRelationCreateStruct("/api/ezp/v2/content/objects/132");

                    spyOn(contentService, 'loadContent').andCallFake(fakedLoadContent);

                    contentService.addRelation(
                        testVersionedContentId,
                        relationCreateStruct,
                        mockCallback
                    );

                    expect(mockConnectionManager.request).toHaveBeenCalled();
                    expect(mockConnectionManager.request.mostRecentCall.args[0]).toEqual("POST"); //method
                    expect(mockConnectionManager.request.mostRecentCall.args[1]).toEqual(testVersionRelations); //url
                    expect(mockConnectionManager.request.mostRecentCall.args[2]).toEqual(JSON.stringify(relationCreateStruct.body)); // body
                    expect(mockConnectionManager.request.mostRecentCall.args[3]).toEqual(relationCreateStruct.headers); // headers
                    expect(mockConnectionManager.request.mostRecentCall.args[4]).toBe(mockCallback); // callback
                });

                it("deleteRelation", function () {
                    contentService.deleteRelation(
                        testRelationId,
                        mockCallback
                    );

                    expect(mockConnectionManager.delete).toHaveBeenCalled();
                    expect(mockConnectionManager.delete.mostRecentCall.args[0]).toEqual(testRelationId); //url
                    expect(mockConnectionManager.delete.mostRecentCall.args[1]).toBe(mockCallback); // callback
                });

            });

            // ******************************
            // Locations management
            // ******************************
            describe("Locations management request:", function () {

                it("createLocation", function () {
                    var locationCreateStruct = contentService.newLocationCreateStruct(
                        "/api/ezp/v2/content/locations/1/2/113"
                    );

                    spyOn(contentService, 'loadContentInfo').andCallFake(fakedLoadContentInfo);

                    contentService.createLocation(
                        testContentId,
                        locationCreateStruct,
                        mockCallback
                    );

                    expect(mockConnectionManager.request).toHaveBeenCalled();
                    expect(mockConnectionManager.request.mostRecentCall.args[0]).toEqual("POST"); //method
                    expect(mockConnectionManager.request.mostRecentCall.args[1]).toEqual(testContentLocations); //url
                    expect(mockConnectionManager.request.mostRecentCall.args[2]).toEqual(JSON.stringify(locationCreateStruct.body)); // body
                    expect(mockConnectionManager.request.mostRecentCall.args[3]).toEqual(locationCreateStruct.headers); // headers
                    expect(mockConnectionManager.request.mostRecentCall.args[4]).toBe(mockCallback); // callback
                });

                it("updateLocation", function () {
                    var locationUpdateStruct = contentService.newLocationUpdateStruct();
                    locationUpdateStruct.remoteId = "random-remote-id-" + Math.random()*100000;

                    contentService.updateLocation(
                        testLocation,
                        locationUpdateStruct,
                        mockCallback
                    );

                    expect(mockConnectionManager.request).toHaveBeenCalled();
                    expect(mockConnectionManager.request.mostRecentCall.args[0]).toEqual("PATCH"); //method
                    expect(mockConnectionManager.request.mostRecentCall.args[1]).toEqual(testLocation); //url
                    expect(mockConnectionManager.request.mostRecentCall.args[2]).toEqual(JSON.stringify(locationUpdateStruct.body)); // body
                    expect(mockConnectionManager.request.mostRecentCall.args[3]).toEqual(locationUpdateStruct.headers); // headers
                    expect(mockConnectionManager.request.mostRecentCall.args[4]).toBe(mockCallback); // callback

                });

                it("loadLocation", function () {
                    contentService.loadLocation(
                        testLocation,
                        mockCallback
                    );

                    expect(mockConnectionManager.request).toHaveBeenCalled();
                    expect(mockConnectionManager.request.mostRecentCall.args[0]).toEqual("GET"); //method
                    expect(mockConnectionManager.request.mostRecentCall.args[1]).toEqual(testLocation); //url
                    expect(mockConnectionManager.request.mostRecentCall.args[2]).toEqual(""); // body
                    expect(mockConnectionManager.request.mostRecentCall.args[3].Accept).toEqual("application/vnd.ez.api.Location+json"); // headers
                    expect(mockConnectionManager.request.mostRecentCall.args[4]).toBe(mockCallback); // callback

                });

                it("loadLocations", function () {
                    spyOn(contentService, 'loadContentInfo').andCallFake(fakedLoadContentInfo);

                    contentService.loadLocations(
                        testContentId,
                        mockCallback
                    );

                    expect(mockConnectionManager.request).toHaveBeenCalled();
                    expect(mockConnectionManager.request.mostRecentCall.args[0]).toEqual("GET"); //method
                    expect(mockConnectionManager.request.mostRecentCall.args[1]).toEqual(testContentLocations); //url
                    expect(mockConnectionManager.request.mostRecentCall.args[2]).toEqual(""); // body
                    expect(mockConnectionManager.request.mostRecentCall.args[3].Accept).toEqual("application/vnd.ez.api.LocationList+json"); // headers
                    expect(mockConnectionManager.request.mostRecentCall.args[4]).toBe(mockCallback); // callback

                });

                it("loadLocationChildren", function () {

                    spyOn(contentService, 'loadLocation').andCallFake(fakedLoadLocation);

                    contentService.loadLocationChildren(
                        testContentId,
                        testLimit,
                        testOffset,
                        mockCallback
                    );

                    expect(mockConnectionManager.request).toHaveBeenCalled();
                    expect(mockConnectionManager.request.mostRecentCall.args[0]).toEqual("GET"); //method
                    expect(mockConnectionManager.request.mostRecentCall.args[1]).toEqual(testLocationChildren + '?offset=' + testOffset + '&limit=' + testLimit); //url
                    expect(mockConnectionManager.request.mostRecentCall.args[2]).toEqual(""); // body
                    expect(mockConnectionManager.request.mostRecentCall.args[3].Accept).toEqual("application/vnd.ez.api.LocationList+json"); // headers
                    expect(mockConnectionManager.request.mostRecentCall.args[4]).toBe(mockCallback); // callback

                });

                it("loadLocationChildren with omitted params", function () {

                    spyOn(contentService, 'loadLocation').andCallFake(fakedLoadLocation);

                    contentService.loadLocationChildren(
                        testContentId,
                        mockCallback
                    );

                    expect(mockConnectionManager.request).toHaveBeenCalled();
                    expect(mockConnectionManager.request.mostRecentCall.args[0]).toEqual("GET"); //method
                    expect(mockConnectionManager.request.mostRecentCall.args[1]).toEqual(testLocationChildren + '?offset=' + defaultOffset + '&limit=' + defaultLimit); //url
                    expect(mockConnectionManager.request.mostRecentCall.args[2]).toEqual(""); // body
                    expect(mockConnectionManager.request.mostRecentCall.args[3].Accept).toEqual("application/vnd.ez.api.LocationList+json"); // headers
                    expect(mockConnectionManager.request.mostRecentCall.args[4]).toBe(mockCallback); // callback

                });

                it("loadLocationChildren with 1 optional parameter", function () {

                    spyOn(contentService, 'loadLocation').andCallFake(fakedLoadLocation);

                    contentService.loadLocationChildren(
                        testContentId,
                        testLimit,
                        mockCallback
                    );

                    expect(mockConnectionManager.request).toHaveBeenCalled();
                    expect(mockConnectionManager.request.mostRecentCall.args[0]).toEqual("GET"); //method
                    expect(mockConnectionManager.request.mostRecentCall.args[1]).toEqual(testLocationChildren + '?offset=' + defaultOffset + '&limit=' + testLimit); //url
                    expect(mockConnectionManager.request.mostRecentCall.args[2]).toEqual(""); // body
                    expect(mockConnectionManager.request.mostRecentCall.args[3].Accept).toEqual("application/vnd.ez.api.LocationList+json"); // headers
                    expect(mockConnectionManager.request.mostRecentCall.args[4]).toBe(mockCallback); // callback

                });

                it("loadLocationByRemoteId", function () {
                    contentService.loadLocationByRemoteId(
                        "/api/ezp/v2/content/locations",
                        "0bae96bd419e141ff3200ccbf2822e4f",
                        mockCallback
                    );

                    expect(mockConnectionManager.request).toHaveBeenCalled();
                    expect(mockConnectionManager.request.mostRecentCall.args[0]).toEqual("GET"); //method
                    expect(mockConnectionManager.request.mostRecentCall.args[1]).toEqual("/api/ezp/v2/content/locations" + '?remoteId=' + "0bae96bd419e141ff3200ccbf2822e4f"); //url
                    expect(mockConnectionManager.request.mostRecentCall.args[2]).toEqual(""); // body
                    expect(mockConnectionManager.request.mostRecentCall.args[3].Accept).toEqual("application/vnd.ez.api.Location+json"); // headers
                    expect(mockConnectionManager.request.mostRecentCall.args[4]).toBe(mockCallback); // callback

                });

                it("copySubtree", function () {
                    contentService.copySubtree(
                        "/api/ezp/v2/content/locations/1/2/113",
                        testLocation,
                        mockCallback
                    );

                    expect(mockConnectionManager.request).toHaveBeenCalled();
                    expect(mockConnectionManager.request.mostRecentCall.args[0]).toEqual("COPY"); //method
                    expect(mockConnectionManager.request.mostRecentCall.args[1]).toEqual("/api/ezp/v2/content/locations/1/2/113"); //url
                    expect(mockConnectionManager.request.mostRecentCall.args[2]).toEqual(""); // body
                    expect(mockConnectionManager.request.mostRecentCall.args[3].Destination).toEqual(testLocation); // headers
                    expect(mockConnectionManager.request.mostRecentCall.args[4]).toBe(mockCallback); // callback

                });

                it("moveSubtree", function () {
                    contentService.moveSubtree(
                        "/api/ezp/v2/content/locations/1/2/119",
                        testLocation,
                        mockCallback
                    );

                    expect(mockConnectionManager.request).toHaveBeenCalled();
                    expect(mockConnectionManager.request.mostRecentCall.args[0]).toEqual("MOVE"); //method
                    expect(mockConnectionManager.request.mostRecentCall.args[1]).toEqual("/api/ezp/v2/content/locations/1/2/119"); //url
                    expect(mockConnectionManager.request.mostRecentCall.args[2]).toEqual(""); // body
                    expect(mockConnectionManager.request.mostRecentCall.args[3].Destination).toEqual(testLocation); // headers
                    expect(mockConnectionManager.request.mostRecentCall.args[4]).toBe(mockCallback); // callback

                });

                it("swapLocation", function () {
                    contentService.swapLocation(
                        "/api/ezp/v2/content/locations/1/2/113",
                        testLocation,
                        mockCallback
                    );

                    expect(mockConnectionManager.request).toHaveBeenCalled();
                    expect(mockConnectionManager.request.mostRecentCall.args[0]).toEqual("SWAP"); //method
                    expect(mockConnectionManager.request.mostRecentCall.args[1]).toEqual("/api/ezp/v2/content/locations/1/2/113"); //url
                    expect(mockConnectionManager.request.mostRecentCall.args[2]).toEqual(""); // body
                    expect(mockConnectionManager.request.mostRecentCall.args[3].Destination).toEqual(testLocation); // headers
                    expect(mockConnectionManager.request.mostRecentCall.args[4]).toBe(mockCallback); // callback

                });

                it("deleteLocation", function () {
                    contentService.deleteLocation(
                        testLocation,
                        mockCallback
                    );

                    expect(mockConnectionManager.delete).toHaveBeenCalled();
                    expect(mockConnectionManager.delete.mostRecentCall.args[0]).toEqual(testLocation); //url
                    expect(mockConnectionManager.delete.mostRecentCall.args[1]).toBe(mockCallback); // callback

                });


            });

            // ******************************
            // Sections management
            // ******************************
            describe("Sections management request:", function () {

                it("createSection", function () {
                    var sectionInputStruct = contentService.newSectionInputStruct(
                        "testSection" + Math.random()*1000000,
                        "Test Section " + Math.round(Math.random()*1000)
                    );

                    contentService.createSection(
                        sectionInputStruct,
                        mockCallback
                    );

                    expect(mockDiscoveryService.getInfoObject).toHaveBeenCalledWith("sections", jasmine.any(Function));

                    expect(mockConnectionManager.request).toHaveBeenCalled();
                    expect(mockConnectionManager.request.mostRecentCall.args[0]).toEqual("POST"); //method
                    expect(mockConnectionManager.request.mostRecentCall.args[1]).toEqual(testSections); //url
                    expect(mockConnectionManager.request.mostRecentCall.args[2]).toEqual(JSON.stringify(sectionInputStruct.body)); // body
                    expect(mockConnectionManager.request.mostRecentCall.args[3]).toEqual(sectionInputStruct.headers); // headers
                    expect(mockConnectionManager.request.mostRecentCall.args[4]).toBe(mockCallback); // callback

                });

                it("updateSection", function () {
                    var sectionInputStruct = new SectionInputStruct(
                        "testSection" + Math.random()*1000000,
                        "Test Section " + Math.round(Math.random()*1000)
                    );

                    contentService.updateSection(
                        testSection,
                        sectionInputStruct,
                        mockCallback
                    );

                    expect(mockConnectionManager.request).toHaveBeenCalled();
                    expect(mockConnectionManager.request.mostRecentCall.args[0]).toEqual("PATCH"); //method
                    expect(mockConnectionManager.request.mostRecentCall.args[1]).toEqual(testSection); //url
                    expect(mockConnectionManager.request.mostRecentCall.args[2]).toEqual(JSON.stringify(sectionInputStruct.body)); // body
                    expect(mockConnectionManager.request.mostRecentCall.args[3]).toEqual(sectionInputStruct.headers); // headers
                    expect(mockConnectionManager.request.mostRecentCall.args[4]).toBe(mockCallback); // callback

                });


                it("loadSection", function () {
                    contentService.loadSection(
                        testSection,
                        mockCallback
                    );

                    expect(mockConnectionManager.request).toHaveBeenCalled();
                    expect(mockConnectionManager.request.mostRecentCall.args[0]).toEqual("GET"); //method
                    expect(mockConnectionManager.request.mostRecentCall.args[1]).toEqual(testSection); //url
                    expect(mockConnectionManager.request.mostRecentCall.args[2]).toEqual(""); // body
                    expect(mockConnectionManager.request.mostRecentCall.args[3].Accept).toEqual("application/vnd.ez.api.Section+json"); // headers
                    expect(mockConnectionManager.request.mostRecentCall.args[4]).toBe(mockCallback); // callback

                });

                it("loadSections", function () {
                    contentService.loadSections(
                        mockCallback
                    );

                    expect(mockDiscoveryService.getInfoObject).toHaveBeenCalledWith("sections", jasmine.any(Function));

                    expect(mockConnectionManager.request).toHaveBeenCalled();
                    expect(mockConnectionManager.request.mostRecentCall.args[0]).toEqual("GET"); //method
                    expect(mockConnectionManager.request.mostRecentCall.args[1]).toEqual(testSections); //url
                    expect(mockConnectionManager.request.mostRecentCall.args[2]).toEqual(""); // body
                    expect(mockConnectionManager.request.mostRecentCall.args[3].Accept).toEqual("application/vnd.ez.api.SectionList+json"); // headers
                    expect(mockConnectionManager.request.mostRecentCall.args[4]).toBe(mockCallback); // callback

                });

                it("deleteSection", function () {
                    contentService.deleteSection(
                        testSection,
                        mockCallback
                    );

                    expect(mockConnectionManager.delete).toHaveBeenCalled();
                    expect(mockConnectionManager.delete.mostRecentCall.args[0]).toEqual(testSection); //url
                    expect(mockConnectionManager.delete.mostRecentCall.args[1]).toBe(mockCallback); // callback
                });

            });

            // ******************************
            // Thrash management
            // ******************************
            describe("Trash management request:", function () {

                it("loadTrashItems", function () {
                    contentService.loadTrashItems(
                        testLimit,
                        testOffset,
                        mockCallback
                    );

                    expect(mockDiscoveryService.getInfoObject).toHaveBeenCalledWith("trash", jasmine.any(Function));

                    expect(mockConnectionManager.request).toHaveBeenCalled();
                    expect(mockConnectionManager.request.mostRecentCall.args[0]).toEqual("GET"); //method
                    expect(mockConnectionManager.request.mostRecentCall.args[1]).toEqual(trash  + '?offset=' + testOffset + '&limit=' + testLimit); //url
                    expect(mockConnectionManager.request.mostRecentCall.args[2]).toEqual(""); // body
                    expect(mockConnectionManager.request.mostRecentCall.args[3].Accept).toEqual("application/vnd.ez.api.Trash+json"); // headers
                    expect(mockConnectionManager.request.mostRecentCall.args[4]).toBe(mockCallback); // callback

                });

                it("loadTrashItems with omitted params", function () {
                    contentService.loadTrashItems(
                        mockCallback
                    );

                    expect(mockDiscoveryService.getInfoObject).toHaveBeenCalledWith("trash", jasmine.any(Function));

                    expect(mockConnectionManager.request).toHaveBeenCalled();
                    expect(mockConnectionManager.request.mostRecentCall.args[0]).toEqual("GET"); //method
                    expect(mockConnectionManager.request.mostRecentCall.args[1]).toEqual(trash  + '?offset=' + defaultOffset + '&limit=' + defaultLimit); //url
                    expect(mockConnectionManager.request.mostRecentCall.args[2]).toEqual(""); // body
                    expect(mockConnectionManager.request.mostRecentCall.args[3].Accept).toEqual("application/vnd.ez.api.Trash+json"); // headers
                    expect(mockConnectionManager.request.mostRecentCall.args[4]).toBe(mockCallback); // callback

                });

                it("loadTrashItems with 1 optional param", function () {
                    contentService.loadTrashItems(
                        testLimit,
                        mockCallback
                    );

                    expect(mockDiscoveryService.getInfoObject).toHaveBeenCalledWith("trash", jasmine.any(Function));

                    expect(mockConnectionManager.request).toHaveBeenCalled();
                    expect(mockConnectionManager.request.mostRecentCall.args[0]).toEqual("GET"); //method
                    expect(mockConnectionManager.request.mostRecentCall.args[1]).toEqual(trash  + '?offset=' + defaultOffset + '&limit=' + testLimit); //url
                    expect(mockConnectionManager.request.mostRecentCall.args[2]).toEqual(""); // body
                    expect(mockConnectionManager.request.mostRecentCall.args[3].Accept).toEqual("application/vnd.ez.api.Trash+json"); // headers
                    expect(mockConnectionManager.request.mostRecentCall.args[4]).toBe(mockCallback); // callback

                });

                it("loadTrashItem", function () {
                    contentService.loadTrashItem(
                        testTrashItem,
                        mockCallback
                    );

                    expect(mockConnectionManager.request).toHaveBeenCalled();
                    expect(mockConnectionManager.request.mostRecentCall.args[0]).toEqual("GET"); //method
                    expect(mockConnectionManager.request.mostRecentCall.args[1]).toEqual(testTrashItem); //url
                    expect(mockConnectionManager.request.mostRecentCall.args[2]).toEqual(""); // body
                    expect(mockConnectionManager.request.mostRecentCall.args[3].Accept).toEqual("application/vnd.ez.api.TrashItem+json"); // headers
                    expect(mockConnectionManager.request.mostRecentCall.args[4]).toBe(mockCallback); // callback

                });

                it("recover TrashItem to specified location", function () {
                    contentService.recover(
                        testTrashItem,
                        testLocation,
                        mockCallback
                    );

                    expect(mockConnectionManager.request).toHaveBeenCalled();
                    expect(mockConnectionManager.request.mostRecentCall.args[0]).toEqual("MOVE"); //method
                    expect(mockConnectionManager.request.mostRecentCall.args[1]).toEqual(testTrashItem); //url
                    expect(mockConnectionManager.request.mostRecentCall.args[2]).toEqual(""); // body
                    expect(mockConnectionManager.request.mostRecentCall.args[3].Accept).toEqual("application/vnd.ez.api.TrashItem+json"); // headers
                    expect(mockConnectionManager.request.mostRecentCall.args[3].Destination).toEqual(testLocation); // headers
                    expect(mockConnectionManager.request.mostRecentCall.args[4]).toBe(mockCallback); // callback

                });

                it("recover TrashItem to it's previous location", function () {
                    contentService.recover(
                        testTrashItem,
                        mockCallback
                    );

                    expect(mockConnectionManager.request).toHaveBeenCalled();
                    expect(mockConnectionManager.request.mostRecentCall.args[0]).toEqual("MOVE"); //method
                    expect(mockConnectionManager.request.mostRecentCall.args[1]).toEqual(testTrashItem); //url
                    expect(mockConnectionManager.request.mostRecentCall.args[2]).toEqual(""); // body
                    expect(mockConnectionManager.request.mostRecentCall.args[3].Accept).toEqual("application/vnd.ez.api.TrashItem+json"); // headers
                    expect(mockConnectionManager.request.mostRecentCall.args[3].Destination).toBeUndefined; // headers
                    expect(mockConnectionManager.request.mostRecentCall.args[4]).toBe(mockCallback); // callback

                });


                it("deleteTrashItem", function () {
                    contentService.deleteTrashItem(
                        testTrashItem,
                        mockCallback
                    );

                    expect(mockConnectionManager.delete).toHaveBeenCalled();
                    expect(mockConnectionManager.delete.mostRecentCall.args[0]).toEqual(testTrashItem); //url
                    expect(mockConnectionManager.delete.mostRecentCall.args[1]).toBe(mockCallback); // callback

                });

                it("emptyTrash", function () {
                    contentService.emptyThrash(
                        mockCallback
                    );

                    expect(mockDiscoveryService.getInfoObject).toHaveBeenCalledWith("trash", jasmine.any(Function));

                    expect(mockConnectionManager.request).toHaveBeenCalled();
                    expect(mockConnectionManager.request.mostRecentCall.args[0]).toEqual("DELETE"); //method
                    expect(mockConnectionManager.request.mostRecentCall.args[1]).toEqual(trash); //url
                    expect(mockConnectionManager.request.mostRecentCall.args[2]).toEqual(""); // body
                    expect(mockConnectionManager.request.mostRecentCall.args[3]).toEqual({}); // headers
                    expect(mockConnectionManager.request.mostRecentCall.args[4]).toBe(mockCallback); // callback

                });

            });

            // ******************************
            // Content State groups management
            // ******************************
            describe("Content State groups management request:", function () {

                it("createObjectStateGroup", function () {
                    var objectStateGroupCreateStruct = contentService.newObjectStateGroupCreateStruct(
                        "some-id" + Math.random(10000),
                        "eng-US",
                        [
                            {
                                "_languageCode":"eng-US",
                                "#text":"Some Name " + Math.random(10000)
                            }
                        ]
                    );

                    contentService.createObjectStateGroup(
                        testObjectStateGroups,
                        objectStateGroupCreateStruct,
                        mockCallback
                    );

                    expect(mockConnectionManager.request).toHaveBeenCalled();
                    expect(mockConnectionManager.request.mostRecentCall.args[0]).toEqual("POST"); //method
                    expect(mockConnectionManager.request.mostRecentCall.args[1]).toEqual(testObjectStateGroups); //url
                    expect(mockConnectionManager.request.mostRecentCall.args[2]).toEqual(JSON.stringify(objectStateGroupCreateStruct.body)); // body
                    expect(mockConnectionManager.request.mostRecentCall.args[3]).toEqual(objectStateGroupCreateStruct.headers); // headers
                    expect(mockConnectionManager.request.mostRecentCall.args[4]).toBe(mockCallback); // callback

                });


                it("updateObjectStateGroup", function () {
                    var objectStateGroupUpdateStruct = contentService.newObjectStateGroupUpdateStruct();

                    objectStateGroupUpdateStruct.body.ObjectStateGroupUpdate.identifier = "some-id" + Math.random(10000);

                    contentService.updateObjectStateGroup(
                        testObjectStateGroup,
                        objectStateGroupUpdateStruct,
                        mockCallback
                    );

                    expect(mockConnectionManager.request).toHaveBeenCalled();
                    expect(mockConnectionManager.request.mostRecentCall.args[0]).toEqual("PATCH"); //method
                    expect(mockConnectionManager.request.mostRecentCall.args[1]).toEqual(testObjectStateGroup); //url
                    expect(mockConnectionManager.request.mostRecentCall.args[2]).toEqual(JSON.stringify(objectStateGroupUpdateStruct.body)); // body
                    expect(mockConnectionManager.request.mostRecentCall.args[3]).toEqual(objectStateGroupUpdateStruct.headers); // headers
                    expect(mockConnectionManager.request.mostRecentCall.args[4]).toBe(mockCallback); // callback
                });

                it("loadObjectStateGroups", function () {
                    contentService.loadObjectStateGroups(
                        testObjectStateGroups,
                        mockCallback
                    );

                    expect(mockConnectionManager.request).toHaveBeenCalled();
                    expect(mockConnectionManager.request.mostRecentCall.args[0]).toEqual("GET"); //method
                    expect(mockConnectionManager.request.mostRecentCall.args[1]).toEqual(testObjectStateGroups); //url
                    expect(mockConnectionManager.request.mostRecentCall.args[2]).toEqual(""); // body
                    expect(mockConnectionManager.request.mostRecentCall.args[3].Accept).toEqual("application/vnd.ez.api.ObjectStateGroupList+json"); // headers
                    expect(mockConnectionManager.request.mostRecentCall.args[4]).toBe(mockCallback); // callback
                });

                it("loadObjectStateGroup", function () {
                    contentService.loadObjectStateGroup(
                        testObjectStateGroup,
                        mockCallback
                    );

                    expect(mockConnectionManager.request).toHaveBeenCalled();
                    expect(mockConnectionManager.request.mostRecentCall.args[0]).toEqual("GET"); //method
                    expect(mockConnectionManager.request.mostRecentCall.args[1]).toEqual(testObjectStateGroup); //url
                    expect(mockConnectionManager.request.mostRecentCall.args[2]).toEqual(""); // body
                    expect(mockConnectionManager.request.mostRecentCall.args[3].Accept).toEqual("application/vnd.ez.api.ObjectStateGroup+json"); // headers
                    expect(mockConnectionManager.request.mostRecentCall.args[4]).toBe(mockCallback); // callback

                });

                //TODO: Take value created during previous tests
                it("deleteObjectStateGroup", function () {
                    contentService.deleteObjectStateGroup(
                        testObjectStateGroup,
                        mockCallback
                    );

                    expect(mockConnectionManager.delete).toHaveBeenCalled();
                    expect(mockConnectionManager.delete.mostRecentCall.args[0]).toEqual(testObjectStateGroup); //url
                    expect(mockConnectionManager.delete.mostRecentCall.args[1]).toBe(mockCallback); // callback
                });

            });

            // ******************************
            // Content States management
            // ******************************
            describe("Content States management request:", function () {

                it("createObjectState", function () {
                    objectStateCreateStruct = contentService.newObjectStateCreateStruct(
                        "some-id" + Math.random(10000),
                        "eng-US",
                        0,
                        [
                            {
                                "_languageCode":"eng-US",
                                "#text":"Some Name " + Math.random(10000)
                            }
                        ],
                        []
                    );

                    contentService.createObjectState(
                        testObjectStateGroup,
                        objectStateCreateStruct,
                        mockCallback
                    );

                    expect(mockConnectionManager.request).toHaveBeenCalled();
                    expect(mockConnectionManager.request.mostRecentCall.args[0]).toEqual("POST"); //method
                    expect(mockConnectionManager.request.mostRecentCall.args[1]).toEqual(testObjectStateGroup + '/objectstates'); //url
                    expect(mockConnectionManager.request.mostRecentCall.args[2]).toEqual(JSON.stringify(objectStateCreateStruct.body)); // body
                    expect(mockConnectionManager.request.mostRecentCall.args[3]).toEqual(objectStateCreateStruct.headers); // headers
                    expect(mockConnectionManager.request.mostRecentCall.args[4]).toBe(mockCallback); // callback

                });

                it("updateObjectState", function () {
                    var objectStateUpdateStruct = contentService.newObjectStateUpdateStruct();

                    objectStateUpdateStruct.body.ObjectStateUpdate.identifier = "some-id" + Math.random(10000);

                    contentService.updateObjectState(
                        testObjectState,
                        objectStateUpdateStruct,
                        mockCallback
                    );

                    expect(mockConnectionManager.request).toHaveBeenCalled();
                    expect(mockConnectionManager.request.mostRecentCall.args[0]).toEqual("PATCH"); //method
                    expect(mockConnectionManager.request.mostRecentCall.args[1]).toEqual(testObjectState); //url
                    expect(mockConnectionManager.request.mostRecentCall.args[2]).toEqual(JSON.stringify(objectStateUpdateStruct.body)); // body
                    expect(mockConnectionManager.request.mostRecentCall.args[3]).toEqual(objectStateUpdateStruct.headers); // headers
                    expect(mockConnectionManager.request.mostRecentCall.args[4]).toBe(mockCallback); // callback

                });

                it("loadObjectState", function () {
                    contentService.loadObjectState(
                        testObjectState,
                        mockCallback
                    );

                    expect(mockConnectionManager.request).toHaveBeenCalled();
                    expect(mockConnectionManager.request.mostRecentCall.args[0]).toEqual("GET"); //method
                    expect(mockConnectionManager.request.mostRecentCall.args[1]).toEqual(testObjectState); //url
                    expect(mockConnectionManager.request.mostRecentCall.args[2]).toEqual(""); // body
                    expect(mockConnectionManager.request.mostRecentCall.args[3].Accept).toEqual("application/vnd.ez.api.ObjectState+json"); // headers
                    expect(mockConnectionManager.request.mostRecentCall.args[4]).toBe(mockCallback); // callback
                });

                it("deleteObjectState", function () {
                    contentService.deleteObjectState(
                        testObjectState,
                        mockCallback
                    );

                    expect(mockConnectionManager.delete).toHaveBeenCalled();
                    expect(mockConnectionManager.delete.mostRecentCall.args[0]).toEqual(testObjectState); //url
                    expect(mockConnectionManager.delete.mostRecentCall.args[1]).toBe(mockCallback); // callback
                });

                it("getContentState", function () {
                    contentService.getContentState(
                        testContentId + '/objectstates',
                        mockCallback
                    );

                    expect(mockConnectionManager.request).toHaveBeenCalled();
                    expect(mockConnectionManager.request.mostRecentCall.args[0]).toEqual("GET"); //method
                    expect(mockConnectionManager.request.mostRecentCall.args[1]).toEqual(testContentId + '/objectstates'); //url
                    expect(mockConnectionManager.request.mostRecentCall.args[2]).toEqual(""); // body
                    expect(mockConnectionManager.request.mostRecentCall.args[3].Accept).toEqual("application/vnd.ez.api.ContentObjectStates+json"); // headers
                    expect(mockConnectionManager.request.mostRecentCall.args[4]).toBe(mockCallback); // callback
                });

                it("setContentState", function () {
                    var objectStates = {};

                    contentService.setContentState(
                        testContentId + '/objectstates',
                        objectStates,
                        mockCallback
                    );

                    expect(mockConnectionManager.request).toHaveBeenCalled();
                    expect(mockConnectionManager.request.mostRecentCall.args[0]).toEqual("PATCH"); //method
                    expect(mockConnectionManager.request.mostRecentCall.args[1]).toEqual(testContentId + '/objectstates'); //url
                    expect(mockConnectionManager.request.mostRecentCall.args[2]).toEqual(JSON.stringify(objectStates)); // body
                    expect(mockConnectionManager.request.mostRecentCall.args[3].Accept).toEqual("application/vnd.ez.api.ContentObjectStates+json"); // headers
                    expect(mockConnectionManager.request.mostRecentCall.args[3]["Content-Type"]).toEqual("application/vnd.ez.api.ContentObjectStates+json"); // headers
                    expect(mockConnectionManager.request.mostRecentCall.args[4]).toBe(mockCallback); // callback

                });

            });

            // ******************************
            // URL Aliases management
            // ******************************
            describe("URL Aliases management request:", function () {

                it("createUrlAlias", function () {
                    var urlAliasCreateStruct = contentService.newUrlAliasCreateStruct(
                        "eng-US",
                        "content/search",
                        "findme-alias"
                    );

                    contentService.createUrlAlias(
                        testUrlAliases,
                        urlAliasCreateStruct,
                        mockCallback
                    );

                    expect(mockConnectionManager.request).toHaveBeenCalled();
                    expect(mockConnectionManager.request.mostRecentCall.args[0]).toEqual("POST"); //method
                    expect(mockConnectionManager.request.mostRecentCall.args[1]).toEqual(testUrlAliases); //url
                    expect(mockConnectionManager.request.mostRecentCall.args[2]).toEqual(JSON.stringify(urlAliasCreateStruct.body)); // body
                    expect(mockConnectionManager.request.mostRecentCall.args[3]).toEqual(urlAliasCreateStruct.headers); // headers
                    expect(mockConnectionManager.request.mostRecentCall.args[4]).toBe(mockCallback); // callback

                });

                it("listGlobalAliases", function () {
                    contentService.listGlobalAliases(
                        testUrlAliases,
                        mockCallback
                    );

                    expect(mockConnectionManager.request).toHaveBeenCalled();
                    expect(mockConnectionManager.request.mostRecentCall.args[0]).toEqual("GET"); //method
                    expect(mockConnectionManager.request.mostRecentCall.args[1]).toEqual(testUrlAliases); //url
                    expect(mockConnectionManager.request.mostRecentCall.args[2]).toEqual(""); // body
                    expect(mockConnectionManager.request.mostRecentCall.args[3].Accept).toEqual("application/vnd.ez.api.UrlAliasRefList+json"); // headers
                    expect(mockConnectionManager.request.mostRecentCall.args[4]).toBe(mockCallback); // callback

                });

                it("listLocatonAliases (autogenerated)", function () {
                    contentService.listLocationAliases(
                        testLocation,
                        false,
                        mockCallback
                    );

                    expect(mockConnectionManager.request).toHaveBeenCalled();
                    expect(mockConnectionManager.request.mostRecentCall.args[0]).toEqual("GET"); //method
                    expect(mockConnectionManager.request.mostRecentCall.args[1]).toEqual(testLocation + '/urlaliases' + '?custom=false'); //url
                    expect(mockConnectionManager.request.mostRecentCall.args[2]).toEqual(""); // body
                    expect(mockConnectionManager.request.mostRecentCall.args[3].Accept).toEqual("application/vnd.ez.api.UrlAliasRefList+json"); // headers
                    expect(mockConnectionManager.request.mostRecentCall.args[4]).toBe(mockCallback); // callback

                });

                it("listLocatonAliases (custom)", function () {
                    contentService.listLocationAliases(
                        testLocation,
                        true,
                        mockCallback
                    );

                    expect(mockConnectionManager.request).toHaveBeenCalled();
                    expect(mockConnectionManager.request.mostRecentCall.args[0]).toEqual("GET"); //method
                    expect(mockConnectionManager.request.mostRecentCall.args[1]).toEqual(testLocation + '/urlaliases'); //url
                    expect(mockConnectionManager.request.mostRecentCall.args[2]).toEqual(""); // body
                    expect(mockConnectionManager.request.mostRecentCall.args[3].Accept).toEqual("application/vnd.ez.api.UrlAliasRefList+json"); // headers
                    expect(mockConnectionManager.request.mostRecentCall.args[4]).toBe(mockCallback); // callback

                });

                it("listLocatonAliases (omitting 'custom' parameter)", function () {
                    contentService.listLocationAliases(
                        testLocation,
                        mockCallback
                    );

                    expect(mockConnectionManager.request).toHaveBeenCalled();
                    expect(mockConnectionManager.request.mostRecentCall.args[0]).toEqual("GET"); //method
                    expect(mockConnectionManager.request.mostRecentCall.args[1]).toEqual(testLocation + '/urlaliases'); //url
                    expect(mockConnectionManager.request.mostRecentCall.args[2]).toEqual(""); // body
                    expect(mockConnectionManager.request.mostRecentCall.args[3].Accept).toEqual("application/vnd.ez.api.UrlAliasRefList+json"); // headers
                    expect(mockConnectionManager.request.mostRecentCall.args[4]).toBe(mockCallback); // callback

                });

                it("loadUrlAlias", function () {
                    contentService.loadUrlAlias(
                        testUrlAlias,
                        mockCallback
                    );

                    expect(mockConnectionManager.request).toHaveBeenCalled();
                    expect(mockConnectionManager.request.mostRecentCall.args[0]).toEqual("GET"); //method
                    expect(mockConnectionManager.request.mostRecentCall.args[1]).toEqual(testUrlAlias); //url
                    expect(mockConnectionManager.request.mostRecentCall.args[2]).toEqual(""); // body
                    expect(mockConnectionManager.request.mostRecentCall.args[3].Accept).toEqual("application/vnd.ez.api.UrlAlias+json"); // headers
                    expect(mockConnectionManager.request.mostRecentCall.args[4]).toBe(mockCallback); // callback

                });

                it("deleteUrlAlias", function () {
                    contentService.deleteUrlAlias(
                        testUrlAlias,
                        mockCallback
                    );

                    expect(mockConnectionManager.delete).toHaveBeenCalled();
                    expect(mockConnectionManager.delete.mostRecentCall.args[0]).toEqual(testUrlAlias); //url
                    expect(mockConnectionManager.delete.mostRecentCall.args[1]).toBe(mockCallback); // callback

                });

            });

            // ******************************
            // URL Wildcards management
            // ******************************
            describe("URL Wildcards management request:", function () {

                it("createUrlWildCard", function () {
                    var urlWildcardCreateStruct = contentService.newUrlWildcardCreateStruct(
                            "some-new-wildcard-" + Math.random(100) * 1000,
                            "testLocation",
                            "false"
                        );
                    contentService.createUrlWildcard(
                        testUrlWildcards,
                        urlWildcardCreateStruct,
                        mockCallback
                    );

                    expect(mockConnectionManager.request).toHaveBeenCalled();
                    expect(mockConnectionManager.request.mostRecentCall.args[0]).toEqual("POST"); //method
                    expect(mockConnectionManager.request.mostRecentCall.args[1]).toEqual(testUrlWildcards); //url
                    expect(mockConnectionManager.request.mostRecentCall.args[2]).toEqual(JSON.stringify(urlWildcardCreateStruct.body)); // body
                    expect(mockConnectionManager.request.mostRecentCall.args[3]).toEqual(urlWildcardCreateStruct.headers); // headers
                    expect(mockConnectionManager.request.mostRecentCall.args[4]).toBe(mockCallback); // callback

                });

                it("loadUrlWildcards", function () {
                    contentService.loadUrlWildcards(
                        testUrlWildcards,
                        mockCallback
                    );

                    expect(mockConnectionManager.request).toHaveBeenCalled();
                    expect(mockConnectionManager.request.mostRecentCall.args[0]).toEqual("GET"); //method
                    expect(mockConnectionManager.request.mostRecentCall.args[1]).toEqual(testUrlWildcards); //url
                    expect(mockConnectionManager.request.mostRecentCall.args[2]).toEqual(""); // body
                    expect(mockConnectionManager.request.mostRecentCall.args[3].Accept).toEqual("application/vnd.ez.api.UrlWildcardList+json"); // headers
                    expect(mockConnectionManager.request.mostRecentCall.args[4]).toBe(mockCallback); // callback

                });

                it("loadUrlWildcard", function () {
                    contentService.loadUrlWildcard(
                        testUrlWildcard,
                        mockCallback
                    );

                    expect(mockConnectionManager.request).toHaveBeenCalled();
                    expect(mockConnectionManager.request.mostRecentCall.args[0]).toEqual("GET"); //method
                    expect(mockConnectionManager.request.mostRecentCall.args[1]).toEqual(testUrlWildcard); //url
                    expect(mockConnectionManager.request.mostRecentCall.args[2]).toEqual(""); // body
                    expect(mockConnectionManager.request.mostRecentCall.args[3].Accept).toEqual("application/vnd.ez.api.UrlWildcard+json"); // headers
                    expect(mockConnectionManager.request.mostRecentCall.args[4]).toBe(mockCallback); // callback

                });

                //TODO: Take value created during previous tests
                it("deleteUrlWildcard", function () {
                    contentService.deleteUrlWildcard(
                        testUrlWildcard,
                        mockCallback
                    );

                    expect(mockConnectionManager.delete).toHaveBeenCalled();
                    expect(mockConnectionManager.delete.mostRecentCall.args[0]).toEqual(testUrlWildcard); //url
                    expect(mockConnectionManager.delete.mostRecentCall.args[1]).toBe(mockCallback); // callback

                });

            });

            // ******************************
            // Structures
            // ******************************
            describe("structures creation", function () {

                it("newContentUpdateStruct", function(){

                    testStructure = contentService.newContentUpdateStruct(
                        testLanguage
                    );

                    expect(testStructure).toEqual(jasmine.any(ContentUpdateStruct));
                    expect(testStructure.body.VersionUpdate.initialLanguageCode).toEqual(testLanguage);
                });

                it("newContentMetadataUpdateStruct", function(){

                    testStructure = contentService.newContentMetadataUpdateStruct(
                        testLanguage
                    );

                    expect(testStructure).toEqual(jasmine.any(ContentMetadataUpdateStruct));
                    expect(testStructure.body.ContentUpdate.MainLanguageCode).toEqual(testLanguage);
                });

                it("newContentCreateStruct", function(){

                    testStructure = contentService.newContentCreateStruct(
                        testContentTypeId,
                        testLocationCreateStruct,
                        testLanguage
                    );

                    expect(testStructure).toEqual(jasmine.any(ContentCreateStruct));
                    expect(testStructure.body.ContentCreate.LocationCreate).toEqual(testLocationCreateStruct.body.LocationCreate);
                    expect(testStructure.body.ContentCreate.ContentType._href).toEqual(testContentTypeId);
                    expect(testStructure.body.ContentCreate.mainLanguageCode).toEqual(testLanguage);
                });

                it("newSectionInputStruct", function(){

                    testStructure = contentService.newSectionInputStruct(
                        testIdentifier,
                        testSectionName
                    );

                    expect(testStructure).toEqual(jasmine.any(SectionInputStruct));
                    expect(testStructure.body.SectionInput.identifier).toEqual(testIdentifier);
                    expect(testStructure.body.SectionInput.name).toEqual(testSectionName);
                });


                it("newLocationCreateStruct", function(){

                    testStructure = contentService.newLocationCreateStruct(
                        testLocation
                    );

                    expect(testStructure).toEqual(jasmine.any(LocationCreateStruct));
                    expect(testStructure.body.LocationCreate.ParentLocation._href).toEqual(testLocation);
                });

                it("newLocationUpdateStruct", function(){

                    testStructure = contentService.newLocationUpdateStruct();

                    expect(testStructure).toEqual(jasmine.any(LocationUpdateStruct));
                });

                it("newViewCreateStruct", function(){

                    testStructure = contentService.newViewCreateStruct(
                        testIdentifier
                    );

                    expect(testStructure).toEqual(jasmine.any(ViewCreateStruct));
                    expect(testStructure.body.ViewInput.identifier).toEqual(testIdentifier);
                });

                it("newRelationCreateStruct", function(){

                    testStructure = contentService.newRelationCreateStruct(
                        testVersionedContentId
                    );

                    expect(testStructure).toEqual(jasmine.any(RelationCreateStruct));
                    expect(testStructure.body.RelationCreate.Destination._href).toEqual(testVersionedContentId);
                });

                it("newObjectStateGroupCreateStruct", function(){

                    testStructure = contentService.newObjectStateGroupCreateStruct(
                        testIdentifier,
                        testLanguage,
                        testArray
                    );

                    expect(testStructure).toEqual(jasmine.any(ObjectStateGroupCreateStruct));
                    expect(testStructure.body.ObjectStateGroupCreate.identifier).toEqual(testIdentifier);
                    expect(testStructure.body.ObjectStateGroupCreate.defaultLanguageCode).toEqual(testLanguage);
                    expect(testStructure.body.ObjectStateGroupCreate.names.value).toEqual(testArray);
                });

                it("newObjectStateGroupUpdateStruct", function(){

                    testStructure = contentService.newObjectStateGroupUpdateStruct(
                        testLanguage,
                        testUser
                    );

                    expect(testStructure).toEqual(jasmine.any(ObjectStateGroupUpdateStruct));
                });

                it("newUrlAliasCreateStruct", function(){

                    testStructure = contentService.newUrlAliasCreateStruct(
                        testLanguage,
                        testLocation,
                        testIdentifier
                    );

                    expect(testStructure).toEqual(jasmine.any(UrlAliasCreateStruct));
                    expect(testStructure.body.UrlAliasCreate.languageCode).toEqual(testLanguage);
                    expect(testStructure.body.UrlAliasCreate.resource).toEqual(testLocation);
                    expect(testStructure.body.UrlAliasCreate.path).toEqual(testIdentifier);

                });

                it("newUrlWildcardCreateStruct", function(){

                    testStructure = contentService.newUrlWildcardCreateStruct(
                        testUrl,
                        testLocation,
                        testTrue
                    );

                    expect(testStructure).toEqual(jasmine.any(UrlWildcardCreateStruct));
                    expect(testStructure.body.UrlWildcardCreate.sourceUrl).toEqual(testUrl);
                    expect(testStructure.body.UrlWildcardCreate.destinationUrl).toEqual(testLocation);
                    expect(testStructure.body.UrlWildcardCreate.forward).toEqual(testTrue);
                });

            });

        });


    // ******************************
    // Errors handling
    // ******************************

        // ******************************
        // Discovery service errors
        // ******************************
        describe("is returning errors correctly, when discovery service fails, while performing:", function () {

            // ******************************
            // beforeEach for discovery service errors
            // ******************************
            beforeEach(function (){
                mockConnectionManager = jasmine.createSpyObj('mockConnectionManager', ['request', 'delete']);
                mockCallback = jasmine.createSpy('mockCallback');

                mockFaultyDiscoveryService = {
                    getInfoObject : function(name, callback){

                        // Very faulty indeed
                        callback(
                            new CAPIError({
                                errorText : "Discover service failed to find object with name '" + name + "'"
                            }),
                            false
                        );

                    }
                };

                spyOn(mockFaultyDiscoveryService, 'getInfoObject').andCallThrough();

                contentService = new ContentService(mockConnectionManager, mockFaultyDiscoveryService);
            });

            it("createSection", function () {
                var sectionInputStruct = new SectionInputStruct(
                    "testSection" + Math.random()*1000000,
                    "Test Section " + Math.round(Math.random()*1000)
                );

                contentService.createSection(
                    sectionInputStruct,
                    mockCallback
                );

                expect(mockFaultyDiscoveryService.getInfoObject).toHaveBeenCalledWith("sections", jasmine.any(Function));
                expect(mockCallback).toHaveBeenCalledWith(jasmine.any(CAPIError), false);
            });

            it("loadSections", function () {
                contentService.loadSections(
                    mockCallback
                );

                expect(mockFaultyDiscoveryService.getInfoObject).toHaveBeenCalledWith("sections", jasmine.any(Function));
                expect(mockCallback).toHaveBeenCalledWith(jasmine.any(CAPIError), false);
            });

            it("createContent", function () {

                var locationCreateStruct = contentService.newLocationCreateStruct("/api/ezp/v2/content/locations/1/2/118"),
                    contentCreateStruct = contentService.newContentCreateStruct(
                        "/api/ezp/v2/content/types/18",
                        locationCreateStruct,
                        "eng-US",
                        "DummyUser"
                    ),
                    fieldInfo = {
                        "fieldDefinitionIdentifier": "title",
                        "languageCode": "eng-US",
                        "fieldValue": "This is a title"
                    };

                contentCreateStruct.body.ContentCreate.fields.field.push(fieldInfo);

                contentService.createContent(
                    contentCreateStruct,
                    mockCallback
                );

                expect(mockFaultyDiscoveryService.getInfoObject).toHaveBeenCalledWith("content", jasmine.any(Function));
                expect(mockCallback).toHaveBeenCalledWith(jasmine.any(CAPIError), false);
            });

            it("loadContentByRemoteId", function () {
                contentService.loadContentByRemoteId(
                    testRemoteId,
                    mockCallback
                );

                expect(mockFaultyDiscoveryService.getInfoObject).toHaveBeenCalledWith("content", jasmine.any(Function));
                expect(mockCallback).toHaveBeenCalledWith(jasmine.any(CAPIError), false);
            });

            it("createView", function () {

                var viewCreateStruct = contentService.newViewCreateStruct('some-test-id');

                viewCreateStruct.body.ViewInput.Query.Criteria = {
                    FullTextCriterion : "title"
                };

                contentService.createView(
                    viewCreateStruct,
                    mockCallback
                );

                expect(mockFaultyDiscoveryService.getInfoObject).toHaveBeenCalledWith("views", jasmine.any(Function));
                expect(mockCallback).toHaveBeenCalledWith(jasmine.any(CAPIError), false);
            });

            it("loadTrashItems", function () {
                contentService.loadTrashItems(
                    testLimit,
                    testOffset,
                    mockCallback
                );

                expect(mockFaultyDiscoveryService.getInfoObject).toHaveBeenCalledWith("trash", jasmine.any(Function));
                expect(mockCallback).toHaveBeenCalledWith(jasmine.any(CAPIError), false);
            });

            it("emptyTrash", function () {
                contentService.emptyThrash(
                    mockCallback
                );

                expect(mockFaultyDiscoveryService.getInfoObject).toHaveBeenCalledWith("trash", jasmine.any(Function));
                expect(mockCallback).toHaveBeenCalledWith(jasmine.any(CAPIError), false);
            });
        });

        // ******************************
        // Service internal calls errors
        // ******************************
        describe("is returning errors correctly, when internal service calls fail, while performing:", function () {

            // ******************************
            // Faked faulty internal calls
            // ******************************
            var fakedFaultyLoadContentInfo = function(contentId, callback){
                    callback(
                        new CAPIError({
                            errorText : "Content service failed for some reason"
                        }),
                        false
                    );
                },

                fakedFaultyLoadCurrentVersion = function(contentId, callback){
                    callback(
                        new CAPIError({
                            errorText : "Content service failed for some reason"
                        }),
                        false
                    );
                },

                fakedFaultyLoadContent = function(versionedContentId, params, callback){
                    callback(
                        new CAPIError({
                            errorText : "Content service failed for some reason"
                        }),
                        false
                    );
                },

                fakedFaultyLoadLocation = function(locationId, callback){
                    callback(
                        new CAPIError({
                            errorText : "Content service failed for some reason"
                        }),
                        false
                    );
                };

            // ******************************
            // beforeEach for discovery service errors
            // ******************************
            beforeEach(function (){
                mockConnectionManager = jasmine.createSpyObj('mockConnectionManager', ['request', 'delete']);
                mockDiscoveryService = jasmine.createSpy('mockDiscoveryService');
                mockCallback = jasmine.createSpy('mockCallback');

                contentService = new ContentService(mockConnectionManager, mockDiscoveryService);
            });

            it("loadCurrentVersion", function () {

                spyOn(contentService, 'loadContentInfo').andCallFake(fakedFaultyLoadContentInfo);

                contentService.loadCurrentVersion(
                    testContentId,
                    mockCallback
                );

                expect(mockCallback).toHaveBeenCalledWith(jasmine.any(CAPIError), false);
            });

            it("loadVersions", function () {

                spyOn(contentService, 'loadContentInfo').andCallFake(fakedFaultyLoadContentInfo);

                contentService.loadVersions(
                    testContentId,
                    mockCallback
                );

                expect(mockCallback).toHaveBeenCalledWith(jasmine.any(CAPIError), false);
            });

            it("createContentDraft from current version", function () {

                spyOn(contentService, 'loadContentInfo').andCallFake(fakedFaultyLoadContentInfo);

                contentService.createContentDraft(
                    testContentId,
                    null,
                    mockCallback
                );

                expect(mockCallback).toHaveBeenCalledWith(jasmine.any(CAPIError), false);
            });

            it("createLocation", function () {
                var locationCreateStruct = contentService.newLocationCreateStruct(
                    "/api/ezp/v2/content/locations/1/2/113"
                );

                spyOn(contentService, 'loadContentInfo').andCallFake(fakedFaultyLoadContentInfo);

                contentService.createLocation(
                    testContentId,
                    locationCreateStruct,
                    mockCallback
                );

                expect(mockCallback).toHaveBeenCalledWith(jasmine.any(CAPIError), false);
            });

            it("loadLocations", function () {

                spyOn(contentService, 'loadContentInfo').andCallFake(fakedFaultyLoadContentInfo);

                contentService.loadLocations(
                    testContentId,
                    mockCallback
                );

                expect(mockCallback).toHaveBeenCalledWith(jasmine.any(CAPIError), false);
            });

            it("loadLocationChildren", function () {

                spyOn(contentService, 'loadLocation').andCallFake(fakedFaultyLoadLocation);

                contentService.loadLocationChildren(
                    testContentId,
                    testLimit,
                    testOffset,
                    mockCallback
                );

                expect(mockCallback).toHaveBeenCalledWith(jasmine.any(CAPIError), false);
            });

            it("loadRelations", function () {

                spyOn(contentService, 'loadContent').andCallFake(fakedFaultyLoadContent);

                contentService.loadRelations(
                    testVersionedContentId,
                    testLimit,
                    testOffset,
                    mockCallback
                );

                expect(mockCallback).toHaveBeenCalledWith(jasmine.any(CAPIError), false);
            });

            it("loadCurrentRelations", function () {

                spyOn(contentService, 'loadCurrentVersion').andCallFake(fakedFaultyLoadCurrentVersion);

                contentService.loadCurrentRelations(
                    testContentId,
                    testLimit,
                    testOffset,
                    mockCallback
                );

                expect(mockCallback).toHaveBeenCalledWith(jasmine.any(CAPIError), false);
            });

            it("createRelation", function () {
                var relationCreateStruct = contentService.newRelationCreateStruct("/api/ezp/v2/content/objects/132");

                spyOn(contentService, 'loadContent').andCallFake(fakedFaultyLoadContent);

                contentService.addRelation(
                    testVersionedContentId,
                    relationCreateStruct,
                    mockCallback
                );

                expect(mockCallback).toHaveBeenCalledWith(jasmine.any(CAPIError), false);
            });

        });
    });

});