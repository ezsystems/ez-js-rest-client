/* global define, describe, it, expect, beforeEach, jasmine, spyOn */
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
            testContentObjectsTemplate = '/api/ezp/v2/content/objects{?remoteId}',
            testContentId = '/api/ezp/v2/content/objects/173',
            testLocationByRemoteId = '/api/ezp/v2/content/locations',
            testLocationByRemoteIdTemplate = '/api/ezp/v2/content/locations{?remoteId}',
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

                        if (name === "contentByRemoteId"){
                            callback(
                                false,
                                {
                                    "_href" : testContentObjectsTemplate
                                }
                            );
                        }

                        if (name === "locationByRemoteId"){
                            callback(
                                false,
                                {
                                    "_href" : testLocationByRemoteIdTemplate
                                }
                            );
                        }
                    }
                };

                spyOn(mockDiscoveryService, 'getInfoObject').andCallThrough();

                contentService = new ContentService(mockConnectionManager, mockDiscoveryService, rootId);
            });

            it("loadRoot", function () {

                contentService.loadRoot(
                    mockCallback
                );

                expect(mockConnectionManager.request).toHaveBeenCalledWith(
                    "GET",
                    rootId,
                    "",
                    {Accept: "application/vnd.ez.api.Root+json"},
                    mockCallback
                );
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

                expect(mockConnectionManager.request).toHaveBeenCalledWith(
                    "POST",
                    testViews,
                    JSON.stringify(viewCreateStruct.body),
                    viewCreateStruct.headers,
                    mockCallback
                );
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

                    expect(mockConnectionManager.request).toHaveBeenCalledWith(
                        "POST",
                        testContentObjects,
                        JSON.stringify(contentCreateStruct.body),
                        contentCreateStruct.headers,
                        mockCallback
                    );
                });

                it("updateContentMetadata", function () {

                    var updateStruct = contentService.newContentMetadataUpdateStruct(
                        "eng-US"
                    );

                    updateStruct.body.ContentUpdate.Section = "/api/ezp/v2/content/sections/2";
                    updateStruct.body.ContentUpdate.remoteId = "random-id-";

                    contentService.updateContentMetadata(
                        testContentId,
                        updateStruct,
                        mockCallback
                    );

                    expect(mockConnectionManager.request).toHaveBeenCalledWith(
                        "PATCH",
                        testContentId,
                        JSON.stringify(updateStruct.body),
                        updateStruct.headers,
                        mockCallback
                    );
                });

                it("loadContentInfo", function () {
                    contentService.loadContentInfo(
                        testContentId,
                        mockCallback
                    );

                    expect(mockConnectionManager.request).toHaveBeenCalledWith(
                        "GET",
                        testContentId,
                        "",
                        {Accept: "application/vnd.ez.api.ContentInfo+json"},
                        mockCallback
                    );
                });

                it("loadContentInfoAndCurrentVersion", function () {
                    contentService.loadContentInfoAndCurrentVersion(
                        testContentId,
                        mockCallback
                    );

                    expect(mockConnectionManager.request).toHaveBeenCalledWith(
                        "GET",
                        testContentId,
                        "",
                        {Accept: "application/vnd.ez.api.Content+json"},
                        mockCallback
                    );
                });

                it("deleteContent", function () {
                    contentService.deleteContent(
                        testContentId,
                        mockCallback
                    );

                    expect(mockConnectionManager.request).toHaveBeenCalledWith(
                        "DELETE",
                        testContentId,
                        "",
                        {},
                        mockCallback
                    );
                });

                it("copyContent", function () {
                    contentService.copyContent(
                        testContentId,
                        testLocation,
                        mockCallback
                    );

                    expect(mockConnectionManager.request).toHaveBeenCalledWith(
                        "COPY",
                        testContentId,
                        "",
                        {Destination: testLocation},
                        mockCallback
                    );
                });

                it("loadContentByRemoteId", function () {
                    contentService.loadContentByRemoteId(
                        testRemoteId,
                        mockCallback
                    );

                    expect(mockDiscoveryService.getInfoObject).toHaveBeenCalledWith("contentByRemoteId", jasmine.any(Function));

                    expect(mockConnectionManager.request).toHaveBeenCalledWith(
                        "GET",
                        testContentObjects + "?remoteId=" + testRemoteId,
                        "",
                        {Accept: "application/vnd.ez.api.ContentInfo+json"},
                        mockCallback
                    );
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

                    expect(mockConnectionManager.request).toHaveBeenCalledWith(
                        "GET",
                        testVersionedContentId,
                        "",
                        {Accept: "application/vnd.ez.api.Version+json"},
                        mockCallback
                    );
                });

                it("loadVersions", function () {

                    spyOn(contentService, 'loadContentInfo').andCallFake(fakedLoadContentInfo);

                    contentService.loadVersions(
                        testContentId,
                        mockCallback
                    );

                    expect(mockConnectionManager.request).toHaveBeenCalledWith(
                        "GET",
                        testVersionsList,
                        "",
                        {Accept: "application/vnd.ez.api.VersionList+json"},
                        mockCallback
                    );
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
                    expect(
                        mockConnectionManager.request.mostRecentCall.args[1]
                    ).toEqual(testVersionedContentId + '?fields=testFields&responseGroups="testResponseGroups"&languages=testLanguages'); //url
                    expect(mockConnectionManager.request.mostRecentCall.args[2]).toEqual(""); // body
                    expect(mockConnectionManager.request.mostRecentCall.args[3].Accept).toEqual("application/vnd.ez.api.Version+json"); // headers
                    expect(mockConnectionManager.request.mostRecentCall.args[4]).toBe(mockCallback); // callback
                });

                it("loadContent with omitted params", function () {

                    contentService.loadContent(
                        testVersionedContentId,
                        mockCallback
                    );

                    expect(mockConnectionManager.request).toHaveBeenCalledWith(
                        "GET",
                        testVersionedContentId,
                        "",
                        {Accept: "application/vnd.ez.api.Version+json"},
                        mockCallback
                    );
                });

                it("loadContent with 1 optional parameter", function () {

                    contentService.loadContent(
                        testVersionedContentId,
                        'testFields',
                        mockCallback
                    );

                    expect(mockConnectionManager.request).toHaveBeenCalledWith(
                        "GET",
                        testVersionedContentId + '?fields=testFields',
                        "",
                        {Accept: "application/vnd.ez.api.Version+json"},
                        mockCallback
                    );
                });

                it("loadContent with 2 optional parameters", function () {

                    contentService.loadContent(
                        testVersionedContentId,
                        'testFields',
                        'testResponseGroups',
                        mockCallback
                    );

                    expect(mockConnectionManager.request).toHaveBeenCalledWith(
                        "GET",
                        testVersionedContentId + '?fields=testFields&responseGroups="testResponseGroups"',
                        "",
                        {Accept: "application/vnd.ez.api.Version+json"},
                        mockCallback
                    );
                });

                it("updateContent", function () {

                    var contentUpdateStruct = contentService.newContentUpdateStruct(
                            "eng-US"
                        ),
                        fieldInfo = {
                            "fieldDefinitionIdentifier": "title",
                            "languageCode": "eng-US",
                            "fieldValue": "This is a new title"
                        };

                    contentUpdateStruct.body.VersionUpdate.fields.field.push(fieldInfo);

                    contentService.updateContent(
                        testVersionedContentId,
                        contentUpdateStruct,
                        mockCallback
                    );

                    expect(mockConnectionManager.request).toHaveBeenCalledWith(
                        "PATCH",
                        testVersionedContentId,
                        JSON.stringify(contentUpdateStruct.body),
                        contentUpdateStruct.headers,
                        mockCallback
                    );
                });

                it("createContentDraft from current version", function () {

                    spyOn(contentService, 'loadContentInfo').andCallFake(fakedLoadContentInfo);

                    contentService.createContentDraft(
                        testContentId,
                        mockCallback
                    );

                    expect(mockConnectionManager.request).toHaveBeenCalledWith(
                        "COPY",
                        testVersionedContentId,
                        "",
                        {Accept: "application/vnd.ez.api.Version+json"},
                        mockCallback
                    );
                });

                it("createContentDraft from specified version", function () {

                    spyOn(contentService, 'loadContentInfo').andCallFake(fakedLoadContentInfo);

                    contentService.createContentDraft(
                        testContentId,
                        1,
                        mockCallback
                    );

                    expect(mockConnectionManager.request).toHaveBeenCalledWith(
                        "COPY",
                        testVersionsList + "/" + 1,
                        "",
                        {Accept: "application/vnd.ez.api.Version+json"},
                        mockCallback
                    );
                });

                it("deleteVersion", function () {

                    contentService.deleteVersion(
                        testVersionedContentId,
                        mockCallback
                    );

                    expect(mockConnectionManager.request).toHaveBeenCalledWith(
                        "DELETE",
                        testVersionedContentId,
                        "",
                        {},
                        mockCallback
                    );
                });

                it("publishVersion", function () {

                    contentService.publishVersion(
                        testVersionedContentId,
                        mockCallback
                    );

                    expect(mockConnectionManager.request).toHaveBeenCalledWith(
                        "PUBLISH",
                        testVersionedContentId,
                        "",
                        {},
                        mockCallback
                    );
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

                    expect(mockConnectionManager.request).toHaveBeenCalledWith(
                        "GET",
                        testVersionRelations + '?offset=' + testOffset + '&limit=' + testLimit,
                        "",
                        {Accept: "application/vnd.ez.api.RelationList+json"},
                        mockCallback
                    );
                });

                it("loadCurrentRelations with omitted params", function () {

                    spyOn(contentService, 'loadCurrentVersion').andCallFake(fakedLoadCurrentVersion);

                    contentService.loadCurrentRelations(
                        testContentId,
                        mockCallback
                    );

                    expect(mockConnectionManager.request).toHaveBeenCalledWith(
                        "GET",
                        testVersionRelations + '?offset=' + defaultOffset + '&limit=' + defaultLimit,
                        "",
                        {Accept: "application/vnd.ez.api.RelationList+json"},
                        mockCallback
                    );
                });

                it("loadCurrentRelations with 1 optional param", function () {

                    spyOn(contentService, 'loadCurrentVersion').andCallFake(fakedLoadCurrentVersion);

                    contentService.loadCurrentRelations(
                        testContentId,
                        testLimit,
                        mockCallback
                    );

                    expect(mockConnectionManager.request).toHaveBeenCalledWith(
                        "GET",
                        testVersionRelations + '?offset=' + defaultOffset + '&limit=' + testLimit,
                        "",
                        {Accept: "application/vnd.ez.api.RelationList+json"},
                        mockCallback
                    );
                });

                it("loadRelations", function () {

                    spyOn(contentService, 'loadContent').andCallFake(fakedLoadContent);

                    contentService.loadRelations(
                        testVersionedContentId,
                        testLimit,
                        testOffset,
                        mockCallback
                    );

                    expect(mockConnectionManager.request).toHaveBeenCalledWith(
                        "GET",
                        testVersionRelations + '?offset=' + testOffset + '&limit=' + testLimit,
                        "",
                        {Accept: "application/vnd.ez.api.RelationList+json"},
                        mockCallback
                    );
                });

                it("loadRelations with omitted params", function () {

                    spyOn(contentService, 'loadContent').andCallFake(fakedLoadContent);

                    contentService.loadRelations(
                        testVersionedContentId,
                        mockCallback
                    );

                    expect(mockConnectionManager.request).toHaveBeenCalledWith(
                        "GET",
                        testVersionRelations + '?offset=' + defaultOffset + '&limit=' + defaultLimit,
                        "",
                        {Accept: "application/vnd.ez.api.RelationList+json"},
                        mockCallback
                    );
                });

                it("loadRelations with 1 optional param", function () {

                    spyOn(contentService, 'loadContent').andCallFake(fakedLoadContent);

                    contentService.loadRelations(
                        testVersionedContentId,
                        testLimit,
                        mockCallback
                    );

                    expect(mockConnectionManager.request).toHaveBeenCalledWith(
                        "GET",
                        testVersionRelations + '?offset=' + defaultOffset + '&limit=' + testLimit,
                        "",
                        {Accept: "application/vnd.ez.api.RelationList+json"},
                        mockCallback
                    );
                });


                it("loadRelation", function () {
                    contentService.loadRelation(
                        testRelationId,
                        mockCallback
                    );

                    expect(mockConnectionManager.request).toHaveBeenCalledWith(
                        "GET",
                        testRelationId,
                        "",
                        {Accept: "application/vnd.ez.api.Relation+json"},
                        mockCallback
                    );
                });

                it("createRelation", function () {
                    var relationCreateStruct = contentService.newRelationCreateStruct("/api/ezp/v2/content/objects/132");

                    spyOn(contentService, 'loadContent').andCallFake(fakedLoadContent);

                    contentService.addRelation(
                        testVersionedContentId,
                        relationCreateStruct,
                        mockCallback
                    );

                    expect(mockConnectionManager.request).toHaveBeenCalledWith(
                        "POST",
                        testVersionRelations,
                        JSON.stringify(relationCreateStruct.body),
                        relationCreateStruct.headers,
                        mockCallback
                    );
                });

                it("deleteRelation", function () {
                    contentService.deleteRelation(
                        testRelationId,
                        mockCallback
                    );

                    expect(mockConnectionManager.request).toHaveBeenCalledWith(
                        "DELETE",
                        testRelationId,
                        "",
                        {},
                        mockCallback
                    );
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

                    expect(mockConnectionManager.request).toHaveBeenCalledWith(
                        "POST",
                        testContentLocations,
                        JSON.stringify(locationCreateStruct.body),
                        locationCreateStruct.headers,
                        mockCallback
                    );
                });

                it("updateLocation", function () {
                    var locationUpdateStruct = contentService.newLocationUpdateStruct();
                    locationUpdateStruct.remoteId = "random-remote-id-";

                    contentService.updateLocation(
                        testLocation,
                        locationUpdateStruct,
                        mockCallback
                    );

                    expect(mockConnectionManager.request).toHaveBeenCalledWith(
                        "PATCH",
                        testLocation,
                        JSON.stringify(locationUpdateStruct.body),
                        locationUpdateStruct.headers,
                        mockCallback
                    );
                });

                it("loadLocation", function () {
                    contentService.loadLocation(
                        testLocation,
                        mockCallback
                    );

                    expect(mockConnectionManager.request).toHaveBeenCalledWith(
                        "GET",
                        testLocation,
                        "",
                        {Accept: "application/vnd.ez.api.Location+json"},
                        mockCallback
                    );
                });

                it("loadLocations", function () {
                    spyOn(contentService, 'loadContentInfo').andCallFake(fakedLoadContentInfo);

                    contentService.loadLocations(
                        testContentId,
                        mockCallback
                    );

                    expect(mockConnectionManager.request).toHaveBeenCalledWith(
                        "GET",
                        testContentLocations,
                        "",
                        {Accept: "application/vnd.ez.api.LocationList+json"},
                        mockCallback
                    );
                });

                it("loadLocationChildren", function () {

                    spyOn(contentService, 'loadLocation').andCallFake(fakedLoadLocation);

                    contentService.loadLocationChildren(
                        testContentId,
                        testLimit,
                        testOffset,
                        mockCallback
                    );

                    expect(mockConnectionManager.request).toHaveBeenCalledWith(
                        "GET",
                        testLocationChildren + '?offset=' + testOffset + '&limit=' + testLimit,
                        "",
                        {Accept: "application/vnd.ez.api.LocationList+json"},
                        mockCallback
                    );
                });

                it("loadLocationChildren with omitted params", function () {

                    spyOn(contentService, 'loadLocation').andCallFake(fakedLoadLocation);

                    contentService.loadLocationChildren(
                        testContentId,
                        mockCallback
                    );

                    expect(mockConnectionManager.request).toHaveBeenCalledWith(
                        "GET",
                        testLocationChildren + '?offset=' + defaultOffset + '&limit=' + defaultLimit,
                        "",
                        {Accept: "application/vnd.ez.api.LocationList+json"},
                        mockCallback
                    );
                });

                it("loadLocationChildren with 1 optional parameter", function () {

                    spyOn(contentService, 'loadLocation').andCallFake(fakedLoadLocation);

                    contentService.loadLocationChildren(
                        testContentId,
                        testLimit,
                        mockCallback
                    );

                    expect(mockConnectionManager.request).toHaveBeenCalledWith(
                        "GET",
                        testLocationChildren + '?offset=' + defaultOffset + '&limit=' + testLimit,
                        "",
                        {Accept: "application/vnd.ez.api.LocationList+json"},
                        mockCallback
                    );
                });

                it("loadLocationByRemoteId", function () {
                    contentService.loadLocationByRemoteId(
                        testRemoteId,
                        mockCallback
                    );

                    expect(mockConnectionManager.request).toHaveBeenCalledWith(
                        "GET",
                        testLocationByRemoteId + '?remoteId=' + testRemoteId,
                        "",
                        {Accept: "application/vnd.ez.api.Location+json"},
                        mockCallback
                    );
                });

                it("copySubtree", function () {
                    contentService.copySubtree(
                        "/api/ezp/v2/content/locations/1/2/113",
                        testLocation,
                        mockCallback
                    );

                    expect(mockConnectionManager.request).toHaveBeenCalledWith(
                        "COPY",
                        "/api/ezp/v2/content/locations/1/2/113",
                        "",
                        {Destination: testLocation},
                        mockCallback
                    );
                });

                it("moveSubtree", function () {
                    contentService.moveSubtree(
                        "/api/ezp/v2/content/locations/1/2/119",
                        testLocation,
                        mockCallback
                    );

                    expect(mockConnectionManager.request).toHaveBeenCalledWith(
                        "MOVE",
                        "/api/ezp/v2/content/locations/1/2/119",
                        "",
                        {Destination: testLocation},
                        mockCallback
                    );
                });

                it("swapLocation", function () {
                    contentService.swapLocation(
                        "/api/ezp/v2/content/locations/1/2/113",
                        testLocation,
                        mockCallback
                    );

                    expect(mockConnectionManager.request).toHaveBeenCalledWith(
                        "SWAP",
                        "/api/ezp/v2/content/locations/1/2/113",
                        "",
                        {Destination: testLocation},
                        mockCallback
                    );
                });

                it("deleteLocation", function () {
                    contentService.deleteLocation(
                        testLocation,
                        mockCallback
                    );

                    expect(mockConnectionManager.request).toHaveBeenCalledWith(
                        "DELETE",
                        testLocation,
                        "",
                        {},
                        mockCallback
                    );
                });


            });

            // ******************************
            // Sections management
            // ******************************
            describe("Sections management request:", function () {

                it("createSection", function () {
                    var sectionInputStruct = contentService.newSectionInputStruct(
                        "testSection",
                        "Test Section"
                    );

                    contentService.createSection(
                        sectionInputStruct,
                        mockCallback
                    );

                    expect(mockDiscoveryService.getInfoObject).toHaveBeenCalledWith("sections", jasmine.any(Function));

                    expect(mockConnectionManager.request).toHaveBeenCalledWith(
                        "POST",
                        testSections,
                        JSON.stringify(sectionInputStruct.body),
                        sectionInputStruct.headers,
                        mockCallback
                    );
                });

                it("updateSection", function () {
                    var sectionInputStruct = new SectionInputStruct(
                        "testSection",
                        "Test Section"
                    );

                    contentService.updateSection(
                        testSection,
                        sectionInputStruct,
                        mockCallback
                    );

                    expect(mockConnectionManager.request).toHaveBeenCalledWith(
                        "PATCH",
                        testSection,
                        JSON.stringify(sectionInputStruct.body),
                        sectionInputStruct.headers,
                        mockCallback
                    );
                });


                it("loadSection", function () {
                    contentService.loadSection(
                        testSection,
                        mockCallback
                    );

                    expect(mockConnectionManager.request).toHaveBeenCalledWith(
                        "GET",
                        testSection,
                        "",
                        {Accept: "application/vnd.ez.api.Section+json"},
                        mockCallback
                    );
                });

                it("loadSections", function () {
                    contentService.loadSections(
                        mockCallback
                    );

                    expect(mockDiscoveryService.getInfoObject).toHaveBeenCalledWith("sections", jasmine.any(Function));

                    expect(mockConnectionManager.request).toHaveBeenCalledWith(
                        "GET",
                        testSections,
                        "",
                        {Accept: "application/vnd.ez.api.SectionList+json"},
                        mockCallback
                    );
                });

                it("deleteSection", function () {
                    contentService.deleteSection(
                        testSection,
                        mockCallback
                    );

                    expect(mockConnectionManager.request).toHaveBeenCalledWith(
                        "DELETE",
                        testSection,
                        "",
                        {},
                        mockCallback
                    );
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

                    expect(mockConnectionManager.request).toHaveBeenCalledWith(
                        "GET",
                        trash  + '?offset=' + testOffset + '&limit=' + testLimit,
                        "",
                        {Accept: "application/vnd.ez.api.Trash+json"},
                        mockCallback
                    );
                });

                it("loadTrashItems with omitted params", function () {
                    contentService.loadTrashItems(
                        mockCallback
                    );

                    expect(mockDiscoveryService.getInfoObject).toHaveBeenCalledWith("trash", jasmine.any(Function));

                    expect(mockConnectionManager.request).toHaveBeenCalledWith(
                        "GET",
                        trash  + '?offset=' + defaultOffset + '&limit=' + defaultLimit,
                        "",
                        {Accept: "application/vnd.ez.api.Trash+json"},
                        mockCallback
                    );
                });

                it("loadTrashItems with 1 optional param", function () {
                    contentService.loadTrashItems(
                        testLimit,
                        mockCallback
                    );

                    expect(mockDiscoveryService.getInfoObject).toHaveBeenCalledWith("trash", jasmine.any(Function));

                    expect(mockConnectionManager.request).toHaveBeenCalledWith(
                        "GET",
                        trash  + '?offset=' + defaultOffset + '&limit=' + testLimit,
                        "",
                        {Accept: "application/vnd.ez.api.Trash+json"},
                        mockCallback
                    );
                });

                it("loadTrashItem", function () {
                    contentService.loadTrashItem(
                        testTrashItem,
                        mockCallback
                    );

                    expect(mockConnectionManager.request).toHaveBeenCalledWith(
                        "GET",
                        testTrashItem,
                        "",
                        {Accept: "application/vnd.ez.api.TrashItem+json"},
                        mockCallback
                    );
                });

                it("recover TrashItem to specified location", function () {
                    contentService.recover(
                        testTrashItem,
                        testLocation,
                        mockCallback
                    );

                    expect(mockConnectionManager.request).toHaveBeenCalledWith(
                        "MOVE",
                        testTrashItem,
                        "",
                        {Accept: "application/vnd.ez.api.TrashItem+json", Destination: testLocation},
                        mockCallback
                    );
                });

                it("recover TrashItem to it's previous location", function () {
                    contentService.recover(
                        testTrashItem,
                        mockCallback
                    );

                    expect(mockConnectionManager.request).toHaveBeenCalledWith(
                        "MOVE",
                        testTrashItem,
                        "",
                        {Accept: "application/vnd.ez.api.TrashItem+json"},
                        mockCallback
                    );
                });


                it("deleteTrashItem", function () {
                    contentService.deleteTrashItem(
                        testTrashItem,
                        mockCallback
                    );

                    expect(mockConnectionManager.request).toHaveBeenCalledWith(
                        "DELETE",
                        testTrashItem,
                        "",
                        {},
                        mockCallback
                    );
                });

                it("emptyTrash", function () {
                    contentService.emptyThrash(
                        mockCallback
                    );

                    expect(mockDiscoveryService.getInfoObject).toHaveBeenCalledWith("trash", jasmine.any(Function));

                    expect(mockConnectionManager.request).toHaveBeenCalledWith(
                        "DELETE",
                        trash,
                        "",
                        {},
                        mockCallback
                    );

                });

            });

            // ******************************
            // Content State groups management
            // ******************************
            describe("Content State groups management request:", function () {

                it("createObjectStateGroup", function () {
                    var objectStateGroupCreateStruct = contentService.newObjectStateGroupCreateStruct(
                        "some-id",
                        "eng-US",
                        [
                            {
                                "_languageCode":"eng-US",
                                "#text":"Some Name"
                            }
                        ]
                    );

                    contentService.createObjectStateGroup(
                        testObjectStateGroups,
                        objectStateGroupCreateStruct,
                        mockCallback
                    );

                    expect(mockConnectionManager.request).toHaveBeenCalledWith(
                        "POST",
                        testObjectStateGroups,
                        JSON.stringify(objectStateGroupCreateStruct.body),
                        objectStateGroupCreateStruct.headers,
                        mockCallback
                    );
                });


                it("updateObjectStateGroup", function () {
                    var objectStateGroupUpdateStruct = contentService.newObjectStateGroupUpdateStruct();

                    objectStateGroupUpdateStruct.body.ObjectStateGroupUpdate.identifier = "some-id";

                    contentService.updateObjectStateGroup(
                        testObjectStateGroup,
                        objectStateGroupUpdateStruct,
                        mockCallback
                    );

                    expect(mockConnectionManager.request).toHaveBeenCalledWith(
                        "PATCH",
                        testObjectStateGroup,
                        JSON.stringify(objectStateGroupUpdateStruct.body),
                        objectStateGroupUpdateStruct.headers,
                        mockCallback
                    );
                });

                it("loadObjectStateGroups", function () {
                    contentService.loadObjectStateGroups(
                        testObjectStateGroups,
                        mockCallback
                    );

                    expect(mockConnectionManager.request).toHaveBeenCalledWith(
                        "GET",
                        testObjectStateGroups,
                        "",
                        {Accept: "application/vnd.ez.api.ObjectStateGroupList+json"},
                        mockCallback
                    );
                });

                it("loadObjectStateGroup", function () {
                    contentService.loadObjectStateGroup(
                        testObjectStateGroup,
                        mockCallback
                    );

                    expect(mockConnectionManager.request).toHaveBeenCalledWith(
                        "GET",
                        testObjectStateGroup,
                        "",
                        {Accept: "application/vnd.ez.api.ObjectStateGroup+json"},
                        mockCallback
                    );
                });

                //TODO: Take value created during previous tests
                it("deleteObjectStateGroup", function () {
                    contentService.deleteObjectStateGroup(
                        testObjectStateGroup,
                        mockCallback
                    );

                    expect(mockConnectionManager.request).toHaveBeenCalledWith(
                        "DELETE",
                        testObjectStateGroup,
                        "",
                        {},
                        mockCallback
                    );
                });

            });

            // ******************************
            // Content States management
            // ******************************
            describe("Content States management request:", function () {

                it("createObjectState", function () {
                    var objectStateCreateStruct = contentService.newObjectStateCreateStruct(
                        "some-id",
                        "eng-US",
                        0,
                        [
                            {
                                "_languageCode":"eng-US",
                                "#text":"Some Name"
                            }
                        ],
                        []
                    );

                    contentService.createObjectState(
                        testObjectStateGroup,
                        objectStateCreateStruct,
                        mockCallback
                    );

                    expect(mockConnectionManager.request).toHaveBeenCalledWith(
                        "POST",
                        testObjectStateGroup + '/objectstates',
                        JSON.stringify(objectStateCreateStruct.body),
                        objectStateCreateStruct.headers,
                        mockCallback
                    );
                });

                it("updateObjectState", function () {
                    var objectStateUpdateStruct = contentService.newObjectStateUpdateStruct();

                    objectStateUpdateStruct.body.ObjectStateUpdate.identifier = "some-id";

                    contentService.updateObjectState(
                        testObjectState,
                        objectStateUpdateStruct,
                        mockCallback
                    );

                    expect(mockConnectionManager.request).toHaveBeenCalledWith(
                        "PATCH",
                        testObjectState,
                        JSON.stringify(objectStateUpdateStruct.body),
                        objectStateUpdateStruct.headers,
                        mockCallback
                    );
                });

                it("loadObjectState", function () {
                    contentService.loadObjectState(
                        testObjectState,
                        mockCallback
                    );

                    expect(mockConnectionManager.request).toHaveBeenCalledWith(
                        "GET",
                        testObjectState,
                        "",
                        {Accept: "application/vnd.ez.api.ObjectState+json"},
                        mockCallback
                    );
                });

                it("deleteObjectState", function () {
                    contentService.deleteObjectState(
                        testObjectState,
                        mockCallback
                    );

                    expect(mockConnectionManager.request).toHaveBeenCalledWith(
                        "DELETE",
                        testObjectState,
                        "",
                        {},
                        mockCallback
                    );
                });

                it("getContentState", function () {
                    contentService.getContentState(
                        testContentId + '/objectstates',
                        mockCallback
                    );

                    expect(mockConnectionManager.request).toHaveBeenCalledWith(
                        "GET",
                        testContentId + '/objectstates',
                        "",
                        {Accept: "application/vnd.ez.api.ContentObjectStates+json"},
                        mockCallback
                    );
                });

                it("setContentState", function () {
                    var objectStates = {};

                    contentService.setContentState(
                        testContentId + '/objectstates',
                        objectStates,
                        mockCallback
                    );

                    expect(mockConnectionManager.request).toHaveBeenCalledWith(
                        "PATCH",
                        testContentId + '/objectstates',
                        JSON.stringify(objectStates),
                        {
                            Accept: "application/vnd.ez.api.ContentObjectStates+json",
                            "Content-Type": "application/vnd.ez.api.ContentObjectStates+json"
                        },
                        mockCallback
                    );
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

                    expect(mockConnectionManager.request).toHaveBeenCalledWith(
                        "POST",
                        testUrlAliases,
                        JSON.stringify(urlAliasCreateStruct.body),
                        urlAliasCreateStruct.headers,
                        mockCallback
                    );
                });

                it("listGlobalAliases", function () {
                    contentService.listGlobalAliases(
                        testUrlAliases,
                        mockCallback
                    );

                    expect(mockConnectionManager.request).toHaveBeenCalledWith(
                        "GET",
                        testUrlAliases,
                        "",
                        {Accept: "application/vnd.ez.api.UrlAliasRefList+json"},
                        mockCallback
                    );
                });

                it("listLocatonAliases (autogenerated)", function () {
                    contentService.listLocationAliases(
                        testLocation,
                        false,
                        mockCallback
                    );

                    expect(mockConnectionManager.request).toHaveBeenCalledWith(
                        "GET",
                        testLocation + '/urlaliases' + '?custom=false',
                        "",
                        {Accept: "application/vnd.ez.api.UrlAliasRefList+json"},
                        mockCallback
                    );
                });

                it("listLocatonAliases (custom)", function () {
                    contentService.listLocationAliases(
                        testLocation,
                        true,
                        mockCallback
                    );

                    expect(mockConnectionManager.request).toHaveBeenCalledWith(
                        "GET",
                        testLocation + '/urlaliases',
                        "",
                        {Accept: "application/vnd.ez.api.UrlAliasRefList+json"},
                        mockCallback
                    );
                });

                it("listLocatonAliases (omitting 'custom' parameter)", function () {
                    contentService.listLocationAliases(
                        testLocation,
                        mockCallback
                    );

                    expect(mockConnectionManager.request).toHaveBeenCalledWith(
                        "GET",
                        testLocation + '/urlaliases',
                        "",
                        {Accept: "application/vnd.ez.api.UrlAliasRefList+json"},
                        mockCallback
                    );
                });

                it("loadUrlAlias", function () {
                    contentService.loadUrlAlias(
                        testUrlAlias,
                        mockCallback
                    );

                    expect(mockConnectionManager.request).toHaveBeenCalledWith(
                        "GET",
                        testUrlAlias,
                        "",
                        {Accept: "application/vnd.ez.api.UrlAlias+json"},
                        mockCallback
                    );
                });

                it("deleteUrlAlias", function () {
                    contentService.deleteUrlAlias(
                        testUrlAlias,
                        mockCallback
                    );

                    expect(mockConnectionManager.request).toHaveBeenCalledWith(
                        "DELETE",
                        testUrlAlias,
                        "",
                        {},
                        mockCallback
                    );
                });

            });

            // ******************************
            // URL Wildcards management
            // ******************************
            describe("URL Wildcards management request:", function () {

                it("createUrlWildCard", function () {
                    var urlWildcardCreateStruct = contentService.newUrlWildcardCreateStruct(
                            "some-new-wildcard",
                            "testLocation",
                            "false"
                        );
                    contentService.createUrlWildcard(
                        testUrlWildcards,
                        urlWildcardCreateStruct,
                        mockCallback
                    );

                    expect(mockConnectionManager.request).toHaveBeenCalledWith(
                        "POST",
                        testUrlWildcards,
                        JSON.stringify(urlWildcardCreateStruct.body),
                        urlWildcardCreateStruct.headers,
                        mockCallback
                    );
                });

                it("loadUrlWildcards", function () {
                    contentService.loadUrlWildcards(
                        testUrlWildcards,
                        mockCallback
                    );

                    expect(mockConnectionManager.request).toHaveBeenCalledWith(
                        "GET",
                        testUrlWildcards,
                        "",
                        {Accept: "application/vnd.ez.api.UrlWildcardList+json"},
                        mockCallback
                    );
                });

                it("loadUrlWildcard", function () {
                    contentService.loadUrlWildcard(
                        testUrlWildcard,
                        mockCallback
                    );

                    expect(mockConnectionManager.request).toHaveBeenCalledWith(
                        "GET",
                        testUrlWildcard,
                        "",
                        {Accept: "application/vnd.ez.api.UrlWildcard+json"},
                        mockCallback
                    );
                });

                //TODO: Take value created during previous tests
                it("deleteUrlWildcard", function () {
                    contentService.deleteUrlWildcard(
                        testUrlWildcard,
                        mockCallback
                    );

                    expect(mockConnectionManager.request).toHaveBeenCalledWith(
                        "DELETE",
                        testUrlWildcard,
                        "",
                        {},
                        mockCallback
                    );
                });

            });

            // ******************************
            // Structures
            // ******************************
            describe("structures creation", function () {

                it("newContentUpdateStruct", function (){

                    testStructure = contentService.newContentUpdateStruct(
                        testLanguage
                    );

                    expect(testStructure).toEqual(jasmine.any(ContentUpdateStruct));
                    expect(testStructure.body.VersionUpdate.initialLanguageCode).toEqual(testLanguage);
                });

                it("newContentMetadataUpdateStruct", function (){

                    testStructure = contentService.newContentMetadataUpdateStruct(
                        testLanguage
                    );

                    expect(testStructure).toEqual(jasmine.any(ContentMetadataUpdateStruct));
                    expect(testStructure.body.ContentUpdate.MainLanguageCode).toEqual(testLanguage);
                });

                it("newContentCreateStruct", function (){

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

                it("newSectionInputStruct", function (){

                    testStructure = contentService.newSectionInputStruct(
                        testIdentifier,
                        testSectionName
                    );

                    expect(testStructure).toEqual(jasmine.any(SectionInputStruct));
                    expect(testStructure.body.SectionInput.identifier).toEqual(testIdentifier);
                    expect(testStructure.body.SectionInput.name).toEqual(testSectionName);
                });


                it("newLocationCreateStruct", function (){

                    testStructure = contentService.newLocationCreateStruct(
                        testLocation
                    );

                    expect(testStructure).toEqual(jasmine.any(LocationCreateStruct));
                    expect(testStructure.body.LocationCreate.ParentLocation._href).toEqual(testLocation);
                });

                it("newLocationUpdateStruct", function (){

                    testStructure = contentService.newLocationUpdateStruct();

                    expect(testStructure).toEqual(jasmine.any(LocationUpdateStruct));
                });

                it("newViewCreateStruct", function (){

                    testStructure = contentService.newViewCreateStruct(
                        testIdentifier
                    );

                    expect(testStructure).toEqual(jasmine.any(ViewCreateStruct));
                    expect(testStructure.body.ViewInput.identifier).toEqual(testIdentifier);
                });

                it("newRelationCreateStruct", function (){

                    testStructure = contentService.newRelationCreateStruct(
                        testVersionedContentId
                    );

                    expect(testStructure).toEqual(jasmine.any(RelationCreateStruct));
                    expect(testStructure.body.RelationCreate.Destination._href).toEqual(testVersionedContentId);
                });

                it("newObjectStateGroupCreateStruct", function (){

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

                it("newObjectStateGroupUpdateStruct", function (){

                    testStructure = contentService.newObjectStateGroupUpdateStruct(
                        testLanguage,
                        testUser
                    );

                    expect(testStructure).toEqual(jasmine.any(ObjectStateGroupUpdateStruct));
                });

                it("newUrlAliasCreateStruct", function (){

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

                it("newUrlWildcardCreateStruct", function (){

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
            var errorResponse = {'status': 401};

            // ******************************
            // beforeEach for discovery service errors
            // ******************************
            beforeEach(function (){
                mockConnectionManager = jasmine.createSpyObj('mockConnectionManager', ['request']);
                mockCallback = jasmine.createSpy('mockCallback');

                mockFaultyDiscoveryService = {
                    getInfoObject : function(name, callback){

                        // Very faulty indeed
                        callback(
                            new CAPIError("Discover service failed to find object with name '" + name + "'"),
                            errorResponse
                        );

                    }
                };

                spyOn(mockFaultyDiscoveryService, 'getInfoObject').andCallThrough();

                contentService = new ContentService(mockConnectionManager, mockFaultyDiscoveryService, rootId);
            });

            it("createSection", function () {
                var sectionInputStruct = new SectionInputStruct(
                    "testSection",
                    "Test Section"
                );

                contentService.createSection(
                    sectionInputStruct,
                    mockCallback
                );

                expect(mockFaultyDiscoveryService.getInfoObject).toHaveBeenCalledWith("sections", jasmine.any(Function));
                expect(mockCallback).toHaveBeenCalledWith(jasmine.any(CAPIError), errorResponse);
            });

            it("loadSections", function () {
                contentService.loadSections(
                    mockCallback
                );

                expect(mockFaultyDiscoveryService.getInfoObject).toHaveBeenCalledWith("sections", jasmine.any(Function));
                expect(mockCallback).toHaveBeenCalledWith(jasmine.any(CAPIError), errorResponse);
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
                expect(mockCallback).toHaveBeenCalledWith(jasmine.any(CAPIError), errorResponse);
            });

            it("loadContentByRemoteId", function () {
                contentService.loadContentByRemoteId(
                    testRemoteId,
                    mockCallback
                );

                expect(mockFaultyDiscoveryService.getInfoObject).toHaveBeenCalledWith("contentByRemoteId", jasmine.any(Function));
                expect(mockCallback).toHaveBeenCalledWith(jasmine.any(CAPIError), errorResponse);
            });

            it("loadLocationByRemoteId", function () {
                contentService.loadLocationByRemoteId(
                    testRemoteId,
                    mockCallback
                );

                expect(mockFaultyDiscoveryService.getInfoObject).toHaveBeenCalledWith("locationByRemoteId", jasmine.any(Function));
                expect(mockCallback).toHaveBeenCalledWith(jasmine.any(CAPIError), errorResponse);
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
                expect(mockCallback).toHaveBeenCalledWith(jasmine.any(CAPIError), errorResponse);
            });

            it("loadTrashItems", function () {
                contentService.loadTrashItems(
                    testLimit,
                    testOffset,
                    mockCallback
                );

                expect(mockFaultyDiscoveryService.getInfoObject).toHaveBeenCalledWith("trash", jasmine.any(Function));
                expect(mockCallback).toHaveBeenCalledWith(jasmine.any(CAPIError), errorResponse);
            });

            it("emptyTrash", function () {
                contentService.emptyThrash(
                    mockCallback
                );

                expect(mockFaultyDiscoveryService.getInfoObject).toHaveBeenCalledWith("trash", jasmine.any(Function));
                expect(mockCallback).toHaveBeenCalledWith(jasmine.any(CAPIError), errorResponse);
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
                        new CAPIError("Content service failed for some reason"),
                        false
                    );
                },

                fakedFaultyLoadCurrentVersion = function(contentId, callback){
                    callback(
                        new CAPIError("Content service failed for some reason"),
                        false
                    );
                },

                fakedFaultyLoadContent = function(versionedContentId, params, callback){
                    callback(
                        new CAPIError("Content service failed for some reason"),
                        false
                    );
                },

                fakedFaultyLoadLocation = function(locationId, callback){
                    callback(
                        new CAPIError("Content service failed for some reason"),
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

                contentService = new ContentService(mockConnectionManager, mockDiscoveryService, rootId);
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
