
describe("CAPI", function () {

    var authAgent = new HttpBasicAuthAgent({
            login : "admin",
            password : "admin"
        }),
        jsCAPI = new CAPI(
            'http://ez.git.local',
            authAgent
        );
    
    var testContentId = '/api/ezp/v2/content/objects/173',
        testVersionedContentId = '/api/ezp/v2/content/objects/173/version/1',
        testLocation = '/api/ezp/v2/content/locations/1/2/102';


    describe("Content Service", function () {

        it("exists", function () {
            var contentService = jsCAPI.getContentService();
            expect(contentService).toBeDefined();
        });

        var contentService = jsCAPI.getContentService();

        describe("executes connection while performing", function () {

            beforeEach(function (){
                fakeConnection = jasmine.createSpyObj('fakeConnection', ['execute']);
                // Dirty trick, but any other way seems more unhealthy (at least for now)
                contentService._connectionManager._activeConnection = fakeConnection;
            });

            it("loadRoot", function () {
                contentService.loadRoot(
                    '/api/ezp/v2/',
                    function(){}
                );
                expect(fakeConnection.execute).toHaveBeenCalled();
            });

            // Content
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
                        '/api/ezp/v2/content/objects',
                        contentCreateStruct,
                        function(){}
                    );

                    expect(fakeConnection.execute).toHaveBeenCalled();
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
                        function(){}
                    );
                    expect(fakeConnection.execute).toHaveBeenCalled();
                });

                it("loadContentInfo", function () {
                    contentService.loadContentInfo(
                        testContentId,
                        function(){}
                    );
                    expect(fakeConnection.execute).toHaveBeenCalled();
                });

                it("loadContentInfoAndCurrentVersion", function () {
                    contentService.loadContentInfoAndCurrentVersion(
                        testContentId,
                        function(){}
                    );
                    expect(fakeConnection.execute).toHaveBeenCalled();
                });

                it("deleteContent", function () {
                    contentService.deleteContent(
                        testContentId,
                        function(){}
                    );
                    expect(fakeConnection.execute).toHaveBeenCalled();
                });

                it("copyContent", function () {
                    contentService.copyContent(
                        testContentId,
                        "/api/ezp/v2/content/locations/1/2/102",
                        function(){}
                    );
                    expect(fakeConnection.execute).toHaveBeenCalled();
                });

                it("loadContentByRemoteId", function () {
                    contentService.loadContentByRemoteId(
                        "random-id-336055.11436237476",
                        function(){}
                    );
                    expect(fakeConnection.execute).toHaveBeenCalled();
                });

            });

            // Versions
            describe("Versions management request:", function () {

                it("loadCurrentVersion", function () {
                    contentService.loadCurrentVersion(
                        testContentId,
                        function(){}
                    );
                    expect(fakeConnection.execute).toHaveBeenCalled();
                });

                it("loadVersions", function () {
                    contentService.loadVersions(
                        testContentId,
                        function(){}
                    );
                    expect(fakeConnection.execute).toHaveBeenCalled();
                });

                it("loadContent", function () {
                    contentService.loadContent(
                        testVersionedContentId,
                        "",
                        function(){}
                    );
                    expect(fakeConnection.execute).toHaveBeenCalled();
                });

                it("updateContent", function () {
                    var contentUpdateStruct = contentService.newContentUpdateStruct(
                        "eng-US",
                        "DummyUser"
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
                        function(){}
                    );
                    expect(fakeConnection.execute).toHaveBeenCalled();
                });

                it("createContentDraft", function () {
                    contentService.createContentDraft(
                        testContentId,
                        null,
                        function(){}
                    );
                    expect(fakeConnection.execute).toHaveBeenCalled();
                });

                //TODO: In real life, take as an argument draft which was created during createContentDraft test
                it("publishVersion", function () {
                    contentService.publishVersion(
                        testVersionedContentId,
                        function(error, response){
                            clientOutput.innerHTML =    "Errors : " + JSON.stringify(error) + "</br>" +
                                "Status : " + response.status + "</br>" +
                                "Body : " + response.body;
                            publishVersionLoader.style.display = 'none';
                        }
                    );
                    expect(fakeConnection.execute).toHaveBeenCalled();
                });

                //TODO: In real life, take as an argument content which was created during createContent test
                it("deleteVersion", function () {
                    contentService.deleteVersion(
                        testVersionedContentId,
                        function(){}
                    );
                    expect(fakeConnection.execute).toHaveBeenCalled();
                });
            });

            // Locations
            describe("Locations management request:", function () {

                it("createLocation", function () {
                    var locationCreateStruct = contentService.newLocationCreateStruct(
                        "/api/ezp/v2/content/locations/1/2/113"
                    );

                    contentService.createLocation(
                        testContentId + '/locations',
                        locationCreateStruct,
                        function(){}
                    );
                    expect(fakeConnection.execute).toHaveBeenCalled();
                });

                it("updateLocation", function () {
                    var locationUpdateStruct = contentService.newLocationUpdateStruct();
                    locationUpdateStruct.remoteId = "random-remote-id-" + Math.random()*100000;

                    contentService.updateLocation(
                        testLocation,
                        locationUpdateStruct,
                        function(){}
                    );
                    expect(fakeConnection.execute).toHaveBeenCalled();
                });

                it("loadLocations", function () {
                    contentService.loadLocations(
                        testContentId + '/locations',
                        function(){}
                    );
                    expect(fakeConnection.execute).toHaveBeenCalled();
                });

                it("loadLocationChildren", function () {
                    contentService.loadLocationChildren(
                        testContentId,
                        0,
                        -1,
                        function(){}
                    );
                    expect(fakeConnection.execute).toHaveBeenCalled();
                });

                it("loadLocationByRemoteId", function () {
                    contentService.loadLocationByRemoteId(
                        "/api/ezp/v2/content/locations",
                        "0bae96bd419e141ff3200ccbf2822e4f",
                        function(){}
                    );
                    expect(fakeConnection.execute).toHaveBeenCalled();
                });

                it("copySubtree", function () {
                    contentService.copySubtree(
                        "/api/ezp/v2/content/locations/1/2/113",
                        testLocation,
                        function(){}
                    );
                    expect(fakeConnection.execute).toHaveBeenCalled();
                });

                it("moveSubtree", function () {
                    contentService.moveSubtree(
                        "/api/ezp/v2/content/locations/1/2/119",
                        testLocation,
                        function(){}
                    );
                    expect(fakeConnection.execute).toHaveBeenCalled();
                });

                it("swapLocation", function () {
                    contentService.swapLocation(
                        "/api/ezp/v2/content/locations/1/2/113",
                        testLocation,
                        function(){}
                    );
                    expect(fakeConnection.execute).toHaveBeenCalled();
                });

                //TODO: In real life, take as an argument location which was created during createLocation test
                it("deleteLocation", function () {
                    contentService.deleteLocation(
                        testLocation,
                        function(){}
                    );
                    expect(fakeConnection.execute).toHaveBeenCalled();
                });

            });

            // Sections
            describe("Sections management request:", function () {

                it("loadSection", function () {
                    contentService.loadSection(
                        1,
                        function(){}
                    );
                    expect(fakeConnection.execute).toHaveBeenCalled();
                });

                it("loadSections", function () {
                    contentService.loadSections(
                        function(){}
                    );
                    expect(fakeConnection.execute).toHaveBeenCalled();
                });

                it("createSection", function () {
                    var sectionInput = {
                        SectionInput : {
                            identifier : "testSection" + Math.random()*1000000,
                            name : "Test Section"
                        }
                    };
                    contentService.createSection(
                        '/api/ezp/v2/content/sections',
                        JSON.stringify(sectionInput),
                        function(){}
                    );
                    expect(fakeConnection.execute).toHaveBeenCalled();
                });

            });



        });

    });
});




