// Some simple js REST CAPI usage scenario

var jsCAPI = new CAPI(
        'http://ez.git.local',
        new HttpBasicAuthAgent({
            login : "admin",
            password : "admin"
        })
    );

var contentService = jsCAPI.getContentService();
var clientOutput = document.getElementById('output');


// Root
var rootAnchor = document.getElementById('root');
var rootLoader = document.getElementById('root-loader');
rootAnchor.onclick = function(e){

    rootLoader.style.display = 'block';
    e.preventDefault();

    contentService.loadRoot(
        '/api/ezp/v2/',
        function(error, response){
            clientOutput.innerHTML =    "Errors : " + JSON.stringify(error) + "</br>" + 
                                        "Status : " + response.status + "</br>" +
                                        "Body : " + response.body;
            rootLoader.style.display = 'none';
        }
    );
};



// Load single section example
var loadSectionAnchor = document.getElementById('load-section');
var loadSectionLoader = document.getElementById('load-section-loader');
loadSectionAnchor.onclick = function(e){

    loadSectionLoader.style.display = 'block';
    e.preventDefault();

    var loadSectionInput = document.getElementById('load-section-input');
    if (loadSectionInput.value.length){
        contentService.loadSection(
            loadSectionInput.value,
            function(error, response){
                clientOutput.innerHTML =    "Errors : " + JSON.stringify(error) + "</br>" +
                                            "Status : " + response.status + "</br>" +
                                            "Body : " + response.body;
                loadSectionLoader.style.display = 'none';
            }
        );
    } else {
        clientOutput.innerHTML = 'Id is missing!';
    }
};


// Load sections list example
var loadSectionsAnchor = document.getElementById('load-sections');
var loadSectionsLoader = document.getElementById('load-sections-loader');
loadSectionsAnchor.onclick = function(e){

    loadSectionsLoader.style.display = 'block';
    e.preventDefault();
    contentService.loadSections(
        function(error, response){
            clientOutput.innerHTML =    "Errors : " + JSON.stringify(error) + "</br>" +
                "Status : " + response.status + "</br>" +
                "Body : " + response.body;
            loadSectionsLoader.style.display = 'none';
        }
    );

};


// Create section example
var createSectionAnchor = document.getElementById('create-section');
var createSectionLoader = document.getElementById('create-section-loader');
createSectionAnchor.onclick = function(e){

    createSectionLoader.style.display = 'block';
    e.preventDefault();
    var sectionInput = {
        SectionInput : {
            identifier : "testSection" + Math.random()*1000000,
            name : "Test Section"
        }
    };

    // compatibility remark: JSON API is supported in all modern browsers (IE-wise since IE8)
    contentService.createSection(
        '/api/ezp/v2/content/sections',
        JSON.stringify(sectionInput),
        function(error, response){
            clientOutput.innerHTML =    "Errors : " + JSON.stringify(error) + "</br>" +
                "Status : " + response.status + "</br>" +
                "Body : " + response.body;
            createSectionLoader.style.display = 'none';
        }
    );

};

// ***
// Update section example
var updateSectionAnchor = document.getElementById('update-section');
var updateSectionLoader = document.getElementById('update-section-loader');
updateSectionAnchor.onclick = function(e){

    var updateSectionInput = document.getElementById('update-section-input');
    if (updateSectionInput.value.length){

        updateSectionLoader.style.display = 'block';
        e.preventDefault();

        var sectionInput = {
            SectionInput : {
                identifier : "testSection" + Math.random()*1000000,
                name : "Test Section " + Math.round(Math.random()*1000)
            }
        };

        // compatibility remark: JSON API is supported in all modern browsers (IE-wise since IE8)
        contentService.updateSection(
            updateSectionInput.value,
            JSON.stringify(sectionInput),
            function(error, response){
                clientOutput.innerHTML =    "Errors : " + JSON.stringify(error) + "</br>" +
                    "Status : " + response.status + "</br>" +
                    "Body : " + response.body;
                updateSectionLoader.style.display = 'none';
            }
        );

    } else {
        clientOutput.innerHTML = 'Id is missing!';
    }

};

// ***
// Delete section example
var deleteSectionAnchor = document.getElementById('delete-section');
var deleteSectionLoader = document.getElementById('delete-section-loader');
deleteSectionAnchor.onclick = function(e){

    deleteSectionLoader.style.display = 'block';
    e.preventDefault();

    var deleteSectionInput = document.getElementById('delete-section-input');
    if (deleteSectionInput.value.length){
        contentService.deleteSection(
            deleteSectionInput.value,
            function(error, response){
                clientOutput.innerHTML =    "Errors : " + JSON.stringify(error) + "</br>" +
                    "Status : " + response.status + "</br>" +
                    "Body : " + response.body;
                deleteSectionLoader.style.display = 'none';
            }
        );
    } else {
        clientOutput.innerHTML = 'Id is missing!';
    }
};


// ******************************
// ******************************

// ***
// Create content example
var createContentAnchor = document.getElementById('create-content');
var createContentLoader = document.getElementById('create-content-loader');
createContentAnchor.onclick = function(e){

    createContentLoader.style.display = 'block';
    e.preventDefault();

    var locationCreateStruct = contentService.newLocationCreateStruct("/api/ezp/v2/content/locations/1/2/113");

    var contentCreateStruct = contentService.newContentCreateStruct(
        "/api/ezp/v2/content/types/18",
        locationCreateStruct,
        "eng-US",
        "DummyUser"
    );


    var fieldInfo = {
        "fieldDefinitionIdentifier": "title",
        "languageCode": "eng-US",
        "fieldValue": "This is a title"
    };

    contentCreateStruct.body.ContentCreate.fields.field.push(fieldInfo);

    contentService.createContent(
        '/api/ezp/v2/content/objects',
        contentCreateStruct,
        function(error, response){
            clientOutput.innerHTML =    "Errors : " + JSON.stringify(error) + "</br>" +
                "Status : " + response.status + "</br>" +
                "Body : " + response.body;
            createContentLoader.style.display = 'none';
        }
    );


};

// ***
// Update content metadata example
var updateContentMetaAnchor = document.getElementById('update-content-meta');
var updateContentMetaLoader = document.getElementById('update-content-meta-loader');
updateContentMetaAnchor.onclick = function(e){

    updateContentMetaLoader.style.display = 'block';
    e.preventDefault();

    var updateContentMetaInput = document.getElementById('update-content-meta-input');
    if (updateContentMetaInput.value.length){
        var updateStruct = contentService.newContentMetadataUpdateStruct(
            "eng-US",
            "DummyUser"
        );

        updateStruct.body.ContentUpdate.Section = "/api/ezp/v2/content/sections/2";
        updateStruct.body.ContentUpdate.remoteId = "random-id-" + Math.random()*1000000;

        contentService.updateContentMetadata(
            updateContentMetaInput.value,
            updateStruct,
            function(error, response){
                clientOutput.innerHTML =    "Errors : " + JSON.stringify(error) + "</br>" +
                    "Status : " + response.status + "</br>" +
                    "Body : " + response.body;
                updateContentMetaLoader.style.display = 'none';
            }
        );

    } else {
        clientOutput.innerHTML = 'Id is missing!';
    }
};

// ***
// Load content info example
var loadContentInfoAnchor = document.getElementById('load-contentinfo');
var loadContentInfoLoader = document.getElementById('load-contentinfo-loader');
loadContentInfoAnchor.onclick = function(e){

    loadContentInfoLoader.style.display = 'block';
    e.preventDefault();

    var loadContentInfoInput = document.getElementById('load-contentinfo-input');
    if (loadContentInfoInput.value.length){
        contentService.loadContentInfo(
            loadContentInfoInput.value,
            function(error, response){
                clientOutput.innerHTML =    "Errors : " + JSON.stringify(error) + "</br>" +
                    "Status : " + response.status + "</br>" +
                    "Body : " + response.body;
                loadContentInfoLoader.style.display = 'none';
            }
        );
    } else {
        clientOutput.innerHTML = 'Id is missing!';
    }
};

// Load content info + current version example
var loadContentCurrentAnchor = document.getElementById('load-contentcurrent');
var loadContentCurrentLoader = document.getElementById('load-contentcurrent-loader');
loadContentCurrentAnchor.onclick = function(e){

    loadContentCurrentLoader.style.display = 'block';
    e.preventDefault();

    var loadContentCurrentInput = document.getElementById('load-contentcurrent-input');
    if (loadContentCurrentInput.value.length){
        contentService.loadContentInfoAndCurrentVersion(
            loadContentCurrentInput.value,
            function(error, response){
                clientOutput.innerHTML =    "Errors : " + JSON.stringify(error) + "</br>" +
                    "Status : " + response.status + "</br>" +
                    "Body : " + response.body;
                loadContentCurrentLoader.style.display = 'none';
            }
        );
    } else {
        clientOutput.innerHTML = 'Id is missing!';
    }
};

// Delete content
var deleteContentAnchor = document.getElementById('delete-content');
var deleteContentLoader = document.getElementById('delete-content-loader');
deleteContentAnchor.onclick = function(e){

    deleteContentLoader.style.display = 'block';
    e.preventDefault();

    var deleteContentInput = document.getElementById('delete-content-input');
    if (deleteContentInput.value.length){
        contentService.deleteContent(
            deleteContentInput.value,
            function(error, response){
                clientOutput.innerHTML =    "Errors : " + JSON.stringify(error) + "</br>" +
                    "Status : " + response.status + "</br>" +
                    "Body : " + response.body;
                deleteContentLoader.style.display = 'none';
            }
        );
    } else {
        clientOutput.innerHTML = 'Id is missing!';
    }
};


// Copy content
var copyContentAnchor = document.getElementById('copy-content');
var copyContentLoader = document.getElementById('copy-content-loader');
copyContentAnchor.onclick = function(e){

    copyContentLoader.style.display = 'block';
    e.preventDefault();

    //create location



    var copyContentInput = document.getElementById('copy-content-input');
    if (copyContentInput.value.length){
        contentService.copyContent(
            copyContentInput.value,
            "/api/ezp/v2/content/locations/1/2/102",
            function(error, response){
                clientOutput.innerHTML =    "Errors : " + JSON.stringify(error) + "</br>" +
                    "Status : " + response.status + "</br>" +
                    "Body : " + response.body;
                copyContentLoader.style.display = 'none';
            }
        );
    } else {
        clientOutput.innerHTML = 'Id is missing!';
    }
};


// ******************************
// ******************************

// Load content versions example
var loadContentVersionsAnchor = document.getElementById('load-contentversions');
var loadContentVersionsLoader = document.getElementById('load-contentversions-loader');
loadContentVersionsAnchor.onclick = function(e){

    loadContentVersionsLoader.style.display = 'block';
    e.preventDefault();

    var loadContentVersionsInput = document.getElementById('load-contentversions-input');
    if (loadContentVersionsInput.value.length){
        contentService.loadVersions(
            loadContentVersionsInput.value,
            function(error, response){
                clientOutput.innerHTML =    "Errors : " + JSON.stringify(error) + "</br>" +
                    "Status : " + response.status + "</br>" +
                    "Body : " + response.body;
                loadContentVersionsLoader.style.display = 'none';
            }
        );
    } else {
        clientOutput.innerHTML = 'Id is missing!';
    }
};


// Load content versions example
var loadContentAnchor = document.getElementById('load-content');
var loadContentLoader = document.getElementById('load-content-loader');
loadContentAnchor.onclick = function(e){

    loadContentLoader.style.display = 'block';
    e.preventDefault();

    var loadContentInput = document.getElementById('load-content-input');
    if (loadContentInput.value.length){
        contentService.loadContent(
            loadContentInput.value,
            "",
            function(error, response){
                clientOutput.innerHTML =    "Errors : " + JSON.stringify(error) + "</br>" +
                    "Status : " + response.status + "</br>" +
                    "Body : " + response.body;
                loadContentLoader.style.display = 'none';
            }
        );
    } else {
        clientOutput.innerHTML = 'Id is missing!';
    }
};

// Update content draft example
var updateContentAnchor = document.getElementById('update-content');
var updateContentLoader = document.getElementById('update-content-loader');
updateContentAnchor.onclick = function(e){

    updateContentLoader.style.display = 'block';
    e.preventDefault();

    var updateContentInput = document.getElementById('update-content-input');
    if (updateContentInput.value.length){

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
            updateContentInput.value,
            contentUpdateStruct,
            function(error, response){
                clientOutput.innerHTML =    "Errors : " + JSON.stringify(error) + "</br>" +
                    "Status : " + response.status + "</br>" +
                    "Body : " + response.body;
                updateContentLoader.style.display = 'none';
            }
        );

    } else {
        clientOutput.innerHTML = 'Id is missing!';
    }
};

// Create draft from exact version example
var createContentDraftAnchor = document.getElementById('create-content-draft');
var createContentDraftLoader = document.getElementById('create-content-draft-loader');
createContentDraftAnchor.onclick = function(e){

    createContentDraftLoader.style.display = 'block';
    e.preventDefault();

    var createContentDraftInput = document.getElementById('create-content-draft-input');
    if (createContentDraftInput.value.length){
        contentService.createContentDraft(
            createContentDraftInput.value,
            function(error, response){
                clientOutput.innerHTML =    "Errors : " + JSON.stringify(error) + "</br>" +
                    "Status : " + response.status + "</br>" +
                    "Body : " + response.body;
                createContentDraftLoader.style.display = 'none';
            }
        );
    } else {
        clientOutput.innerHTML = 'Id is missing!';
    }
};

// Delete version example
var deleteVersionAnchor = document.getElementById('delete-version');
var deleteVersionLoader = document.getElementById('delete-version-loader');
deleteVersionAnchor.onclick = function(e){

    deleteVersionLoader.style.display = 'block';
    e.preventDefault();

    var deleteVersionInput = document.getElementById('delete-version-input');
    if (deleteVersionInput.value.length){
        contentService.deleteVersion(
            deleteVersionInput.value,
            function(error, response){
                clientOutput.innerHTML =    "Errors : " + JSON.stringify(error) + "</br>" +
                    "Status : " + response.status + "</br>" +
                    "Body : " + response.body;
                deleteVersionLoader.style.display = 'none';
            }
        );
    } else {
        clientOutput.innerHTML = 'Id is missing!';
    }
};

// Publish version example
var publishVersionAnchor = document.getElementById('publish-version');
var publishVersionLoader = document.getElementById('publish-version-loader');
publishVersionAnchor.onclick = function(e){

    publishVersionLoader.style.display = 'block';
    e.preventDefault();

    var publishVersionInput = document.getElementById('publish-version-input');
    if (publishVersionInput.value.length){
        contentService.publishVersion(
            publishVersionInput.value,
            function(error, response){
                clientOutput.innerHTML =    "Errors : " + JSON.stringify(error) + "</br>" +
                    "Status : " + response.status + "</br>" +
                    "Body : " + response.body;
                publishVersionLoader.style.display = 'none';
            }
        );
    } else {
        clientOutput.innerHTML = 'Id is missing!';
    }
};

// ******************************
// ******************************

// Content update structure example
var newContentUpdateStructAnchor = document.getElementById('new-content-update-struct');
newContentUpdateStructAnchor.onclick = function(e){

    e.preventDefault();

    var contentUpdateStruct = contentService.newContentUpdateStruct(
        "eng-US",
        "DummyUser"
    );

    var fieldInfo = {
        "fieldDefinitionIdentifier": "title",
        "languageCode": "eng-US",
        "fieldValue": "This is a new title" + Math.random()*1000000
    };

    contentUpdateStruct.VersionUpdate.fields.field.push(fieldInfo);

    var anotherFieldInfo = {
        "fieldDefinitionIdentifier": "text",
        "languageCode": "eng-US",
        "fieldValue": "This is a new text" + Math.random()*1000000
    };


    contentUpdateStruct.VersionUpdate.fields.field.push(anotherFieldInfo);

    clientOutput.innerHTML = JSON.stringify(contentUpdateStruct);


};

// Content metadata update structure example
var newContentMetaUpdateStructAnchor = document.getElementById('new-content-meta-update-struct');
newContentMetaUpdateStructAnchor.onclick = function(e){

    e.preventDefault();

    var updateStruct = contentService.newContentMetadataUpdateStruct(
        "eng-US",
        "DummyUser"
    );

    updateStruct.ContentUpdate.Section = "/api/ezp/v2/content/sections/2";
    updateStruct.ContentUpdate.remoteId = "random-id-" + Math.random()*1000000;

    clientOutput.innerHTML = JSON.stringify(updateStruct);

};


// Content create structure example
var newContentCreateStructAnchor = document.getElementById('new-content-create-struct');
newContentCreateStructAnchor.onclick = function(e){

    e.preventDefault();

    var locationCreateStruct = contentService.newLocationCreateStruct(
        "/api/ezp/v2/content/locations/1/2/102"
    );

    var contentCreateStruct = contentService.newContentCreateStruct(
        "/api/ezp/v2/content/types/18",
        locationCreateStruct,
        "eng-US",
        "DummyUser"
    );

    clientOutput.innerHTML = JSON.stringify(contentCreateStruct);

};

// Location create structure example
var newLocationCreateStructAnchor = document.getElementById('new-location-create-struct');
newLocationCreateStructAnchor.onclick = function(e){

    e.preventDefault();

    var locationCreateStruct = contentService.newLocationCreateStruct(
        "/api/ezp/v2/content/locations/1/2/102"
    );

    clientOutput.innerHTML = JSON.stringify(locationCreateStruct);
};


// Create location example
var CreateLocationAnchor = document.getElementById('create-location');
var CreateLocationLoader = document.getElementById('create-location-loader');
CreateLocationAnchor.onclick = function(e){

    CreateLocationLoader.style.display = 'block';
    e.preventDefault();


    locationCreateStruct = contentService.newLocationCreateStruct(
        "/api/ezp/v2/content/locations/1/2/113"
    );

    var CreateLocationInput = document.getElementById('create-location-input');
    if (CreateLocationInput.value.length){
        contentService.createLocation(
            CreateLocationInput.value,
            locationCreateStruct,
            function(error, response){
                clientOutput.innerHTML =    "Errors : " + JSON.stringify(error) + "</br>" +
                    "Status : " + response.status + "</br>" +
                    "Body : " + response.body;

                CreateLocationLoader.style.display = 'none';
            }
        );
    } else {
        clientOutput.innerHTML = 'Id is missing!';
    }

};


// Update location example
var UpdateLocationAnchor = document.getElementById('update-location');
var UpdateLocationLoader = document.getElementById('update-location-loader');
UpdateLocationAnchor.onclick = function(e){

    UpdateLocationLoader.style.display = 'block';
    e.preventDefault();

    var locationUpdateStruct = contentService.newLocationUpdateStruct();

    locationUpdateStruct.remoteId = "random-remote-id-" + Math.random()*100000;

    var UpdateLocationInput = document.getElementById('update-location-input');
    contentService.updateLocation(
        UpdateLocationInput.value,
        locationUpdateStruct,
        function(error, response){
            clientOutput.innerHTML =    "Errors : " + JSON.stringify(error) + "</br>" +
                "Status : " + response.status + "</br>" +
                "Body : " + response.body;
            UpdateLocationLoader.style.display = 'none';
        });
};


// Load locations example
var LoadLocationsAnchor = document.getElementById('load-locations');
var LoadLocationsLoader = document.getElementById('load-locations-loader');
LoadLocationsAnchor.onclick = function(e){

    LoadLocationsLoader.style.display = 'block';
    e.preventDefault();

    var LoadLocationsInput = document.getElementById('load-locations-input');

    contentService.loadLocations(
        LoadLocationsInput.value,
        function(error, response){
            clientOutput.innerHTML =    "Errors : " + JSON.stringify(error) + "</br>" +
                "Status : " + response.status + "</br>" +
                "Body : " + response.body;
            LoadLocationsLoader.style.display = 'none';
        });
};


// Load location by id example
var LoadLocationAnchor = document.getElementById('load-location');
var LoadLocationLoader = document.getElementById('load-location-loader');
LoadLocationAnchor.onclick = function(e){

    LoadLocationLoader.style.display = 'block';
    e.preventDefault();

    var LoadLocationInput = document.getElementById('load-location-input');

    contentService.loadLocation(
        LoadLocationInput.value,
        function(error, response){
            clientOutput.innerHTML =    "Errors : " + JSON.stringify(error) + "</br>" +
                "Status : " + response.status + "</br>" +
                "Body : " + response.body;
            LoadLocationLoader.style.display = 'none';
        });
};

// Load location children example
var LoadLocationChildrenAnchor = document.getElementById('load-location-children');
var LoadLocationChildrenLoader = document.getElementById('load-location-children-loader');
LoadLocationChildrenAnchor.onclick = function(e){

    LoadLocationChildrenLoader.style.display = 'block';
    e.preventDefault();

    var LoadLocationChildrenInput = document.getElementById('load-location-children-input');

    contentService.loadLocationChildren(
        LoadLocationChildrenInput.value,
        0,
        -1,
        function(error, response){
            clientOutput.innerHTML =    "Errors : " + JSON.stringify(error) + "</br>" +
                "Status : " + response.status + "</br>" +
                "Body : " + response.body;
            LoadLocationChildrenLoader.style.display = 'none';
        });
};


// Load location by remote id example
var LoadLocationByRemoteAnchor = document.getElementById('load-location-by-remote');
var LoadLocationByRemoteLoader = document.getElementById('load-location-by-remote-loader');
LoadLocationByRemoteAnchor.onclick = function(e){

    LoadLocationByRemoteLoader.style.display = 'block';
    e.preventDefault();

    var LoadLocationByRemoteInput = document.getElementById('load-location-by-remote-input');
    contentService.loadLocationByRemoteId(
        "/api/ezp/v2/content/locations",
        LoadLocationByRemoteInput.value,
        function(error, response){
            clientOutput.innerHTML =    "Errors : " + JSON.stringify(error) + "</br>" +
                "Status : " + response.status + "</br>" +
                "Body : " + response.body;
            LoadLocationByRemoteLoader.style.display = 'none';
        });
};


// Copy subtree example
var CopySubtreeAnchor = document.getElementById('copy-subtree');
var CopySubtreeLoader = document.getElementById('copy-subtree-loader');
CopySubtreeAnchor.onclick = function(e){

    CopySubtreeLoader.style.display = 'block';
    e.preventDefault();

    var CopySubtreeInput = document.getElementById('copy-subtree-input');

    contentService.copySubtree(
        "/api/ezp/v2/content/locations/1/2/107",
        CopySubtreeInput.value,
        function(error, response){
            clientOutput.innerHTML =    "Errors : " + JSON.stringify(error) + "</br>" +
                "Status : " + response.status + "</br>" +
                "Body : " + response.body;
            CopySubtreeLoader.style.display = 'none';
        });
};

// Move subtree example
var MoveSubtreeAnchor = document.getElementById('move-subtree');
var MoveSubtreeLoader = document.getElementById('move-subtree-loader');
MoveSubtreeAnchor.onclick = function(e){

    MoveSubtreeLoader.style.display = 'block';
    e.preventDefault();

    var MoveSubtreeInput = document.getElementById('move-subtree-input');

    contentService.moveSubtree(
        "/api/ezp/v2/content/locations/1/2/107",
        MoveSubtreeInput.value,
        function(error, response){
            clientOutput.innerHTML =    "Errors : " + JSON.stringify(error) + "</br>" +
                "Status : " + response.status + "</br>" +
                "Body : " + response.body;
            MoveSubtreeLoader.style.display = 'none';
        });
};

// Swap location example
var SwapLocationAnchor = document.getElementById('swap-location');
var SwapLocationLoader = document.getElementById('swap-location-loader');
SwapLocationAnchor.onclick = function(e){

    SwapLocationLoader.style.display = 'block';
    e.preventDefault();

    var SwapLocationInput = document.getElementById('swap-location-input');

    contentService.swapLocation(
        "/api/ezp/v2/content/locations/1/2/102/128",
        SwapLocationInput.value,
        function(error, response){
            clientOutput.innerHTML =    "Errors : " + JSON.stringify(error) + "</br>" +
                "Status : " + response.status + "</br>" +
                "Body : " + response.body;
            SwapLocationLoader.style.display = 'none';
        });
};

// Delete location example
var DeleteLocationAnchor = document.getElementById('delete-location');
var DeleteLocationLoader = document.getElementById('delete-location-loader');
DeleteLocationAnchor.onclick = function(e){

    DeleteLocationLoader.style.display = 'block';
    e.preventDefault();

    var DeleteLocationInput = document.getElementById('delete-location-input');
    contentService.deleteLocation(
        DeleteLocationInput.value,
        function(error, response){
            clientOutput.innerHTML =    "Errors : " + JSON.stringify(error) + "</br>" +
                "Status : " + response.status + "</br>" +
                "Body : " + response.body;
            DeleteLocationLoader.style.display = 'none';
        });
};


// Create view example
var CreateViewAnchor = document.getElementById('create-view');
var CreateViewLoader = document.getElementById('create-view-loader');
CreateViewAnchor.onclick = function(e){

    CreateViewLoader.style.display = 'block';
    e.preventDefault();

    var viewCreateStruct = contentService.newViewCreateStruct('test-id');

    viewCreateStruct.body.ViewInput.Query.Criteria = { FullTextCriterion : "title"};

    contentService.createView(
        viewCreateStruct,
        function(error, response){
            clientOutput.innerHTML =    "Errors : " + JSON.stringify(error) + "</br>" +
                "Status : " + response.status + "</br>" +
                "Body : " + response.body;
            CreateViewLoader.style.display = 'none';
        });
};

// Load relations example
var LoadRelationsAnchor = document.getElementById('load-relations');
var LoadRelationsLoader = document.getElementById('load-relations-loader');
LoadRelationsAnchor.onclick = function(e){

    LoadRelationsLoader.style.display = 'block';
    e.preventDefault();

    var LoadRelationsInput = document.getElementById('load-relations-input');
    contentService.loadRelations(
        LoadRelationsInput.value,
        0,
        -1,
        function(error, response){
            clientOutput.innerHTML =    "Errors : " + JSON.stringify(error) + "</br>" +
                "Status : " + response.status + "</br>" +
                "Body : " + response.body;
            LoadRelationsLoader.style.display = 'none';
        });
};

// Load relation example
var LoadRelationAnchor = document.getElementById('load-relation');
var LoadRelationLoader = document.getElementById('load-relation-loader');
LoadRelationAnchor.onclick = function(e){

    LoadRelationLoader.style.display = 'block';
    e.preventDefault();

    var LoadRelationInput = document.getElementById('load-relation-input');
    contentService.loadRelation(
        LoadRelationInput.value,
        function(error, response){
            clientOutput.innerHTML =    "Errors : " + JSON.stringify(error) + "</br>" +
                "Status : " + response.status + "</br>" +
                "Body : " + response.body;
            LoadRelationLoader.style.display = 'none';
        });
};

// Create relation example
var CreateRelationAnchor = document.getElementById('create-relation');
var CreateRelationLoader = document.getElementById('create-relation-loader');
CreateRelationAnchor.onclick = function(e){

    CreateRelationLoader.style.display = 'block';
    e.preventDefault();

    var relationCreateStruct = contentService.newRelationCreateStruct("/api/ezp/v2/content/objects/121");

    console.log(relationCreateStruct);

    var CreateRelationInput = document.getElementById('create-relation-input');
    contentService.addRelation(
        CreateRelationInput.value,
        relationCreateStruct,
        function(error, response){
            clientOutput.innerHTML =    "Errors : " + JSON.stringify(error) + "</br>" +
                "Status : " + response.status + "</br>" +
                "Body : " + response.body;
            CreateRelationLoader.style.display = 'none';
        });
};

// Delete relation example
var DeleteRelationAnchor = document.getElementById('delete-relation');
var DeleteRelationLoader = document.getElementById('delete-relation-loader');
DeleteRelationAnchor.onclick = function(e){

    DeleteRelationLoader.style.display = 'block';
    e.preventDefault();

    var DeleteRelationInput = document.getElementById('delete-relation-input');
    contentService.deleteRelation(
        DeleteRelationInput.value,
        function(error, response){
            clientOutput.innerHTML =    "Errors : " + JSON.stringify(error) + "</br>" +
                "Status : " + response.status + "</br>" +
                "Body : " + response.body;
            DeleteRelationLoader.style.display = 'none';
        });
};

// Load trash items example
var LoadTrashItemsAnchor = document.getElementById('load-trash-items');
var LoadTrashItemsLoader = document.getElementById('load-trash-items-loader');
LoadTrashItemsAnchor.onclick = function(e){

    LoadTrashItemsLoader.style.display = 'block';
    e.preventDefault();

    contentService.loadThrashItems(
        0,
        -1,
        function(error, response){
            clientOutput.innerHTML =    "Errors : " + JSON.stringify(error) + "</br>" +
                "Status : " + response.status + "</br>" +
                "Body : " + response.body;
            LoadTrashItemsLoader.style.display = 'none';
        });
};

// Load single trash item example
var LoadTrashItemAnchor = document.getElementById('load-trash-item');
var LoadTrashItemLoader = document.getElementById('load-trash-item-loader');
LoadTrashItemAnchor.onclick = function(e){

    LoadTrashItemLoader.style.display = 'block';
    e.preventDefault();

    var LoadTrashItemInput = document.getElementById('load-trash-item-input');
    contentService.loadThrashItem(
        LoadTrashItemInput.value,
        function(error, response){
            clientOutput.innerHTML =    "Errors : " + JSON.stringify(error) + "</br>" +
                "Status : " + response.status + "</br>" +
                "Body : " + response.body;
            LoadTrashItemLoader.style.display = 'none';
        });
};

// Recover trash item example
var RecoverAnchor = document.getElementById('recover-trash-item');
var RecoverLoader = document.getElementById('recover-trash-item-loader');
RecoverAnchor.onclick = function(e){

    RecoverLoader.style.display = 'block';
    e.preventDefault();

    var RecoverInput = document.getElementById('recover-trash-item-input');
    contentService.recover(
        RecoverInput.value,
        null,
        function(error, response){
            clientOutput.innerHTML =    "Errors : " + JSON.stringify(error) + "</br>" +
                "Status : " + response.status + "</br>" +
                "Body : " + response.body;
            RecoverLoader.style.display = 'none';
        });
};

// Delete trash item example
var DeleteTrashItemAnchor = document.getElementById('delete-trash-item');
var DeleteTrashItemLoader = document.getElementById('delete-trash-item-loader');
DeleteTrashItemAnchor.onclick = function(e){

    DeleteTrashItemLoader.style.display = 'block';
    e.preventDefault();

    var DeleteTrashItemInput = document.getElementById('delete-trash-item-input');
    contentService.deleteTrashItem(
        DeleteTrashItemInput.value,
        function(error, response){
            clientOutput.innerHTML =    "Errors : " + JSON.stringify(error) + "</br>" +
                "Status : " + response.status + "</br>" +
                "Body : " + response.body;
            DeleteTrashItemLoader.style.display = 'none';
        });
};

// Empty trash can example
var EmptyTrashAnchor = document.getElementById('empty-trash');
var EmptyTrashLoader = document.getElementById('empty-trash-loader');
EmptyTrashAnchor.onclick = function(e){

    EmptyTrashLoader.style.display = 'block';
    e.preventDefault();

    contentService.emptyThrash(
        function(error, response){
            clientOutput.innerHTML =    "Errors : " + JSON.stringify(error) + "</br>" +
                "Status : " + response.status + "</br>" +
                "Body : " + response.body;
            EmptyTrashLoader.style.display = 'none';
        });
};

// Create object state group example
var CreateObjectStateGroupAnchor = document.getElementById('create-object-state-group');
var CreateObjectStateGroupLoader = document.getElementById('create-object-state-group-loader');
CreateObjectStateGroupAnchor.onclick = function(e){

    CreateObjectStateGroupLoader.style.display = 'block';
    e.preventDefault();

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
        "/api/ezp/v2/content/objectstategroups",
        objectStateGroupCreateStruct,
        function(error, response){
            clientOutput.innerHTML =    "Errors : " + JSON.stringify(error) + "</br>" +
                "Status : " + response.status + "</br>" +
                "Body : " + response.body;
            CreateObjectStateGroupLoader.style.display = 'none';
        });
};

// Update object state group example
var UpdateObjectStateGroupAnchor = document.getElementById('update-object-state-group');
var UpdateObjectStateGroupLoader = document.getElementById('update-object-state-group-loader');
UpdateObjectStateGroupAnchor.onclick = function(e){

    UpdateObjectStateGroupLoader.style.display = 'block';
    e.preventDefault();

    var objectStateGroupUpdateStruct = contentService.newObjectStateGroupUpdateStruct(
        "some-id" + Math.random(10000),
        "eng-US",
        [
            {
                "_languageCode":"eng-US",
                "#text":"Some Name " + Math.random(10000)
            }
        ],
        []
    );

    var UpdateObjectStateGroupInput = document.getElementById('update-object-state-group-input');
    contentService.updateObjectStateGroup(
        UpdateObjectStateGroupInput.value,
        objectStateGroupUpdateStruct,
        function(error, response){
            clientOutput.innerHTML =    "Errors : " + JSON.stringify(error) + "</br>" +
                "Status : " + response.status + "</br>" +
                "Body : " + response.body;
            UpdateObjectStateGroupLoader.style.display = 'none';
        });
};


// Load the Object States groups list example
var LoadObjectStateGroupsAnchor = document.getElementById('load-object-state-groups');
var LoadObjectStateGroupsLoader = document.getElementById('load-object-state-groups-loader');
LoadObjectStateGroupsAnchor.onclick = function(e){

    LoadObjectStateGroupsLoader.style.display = 'block';
    e.preventDefault();

    contentService.loadObjectStateGroups(
        "/api/ezp/v2/content/objectstategroups",
        function(error, response){
            clientOutput.innerHTML =    "Errors : " + JSON.stringify(error) + "</br>" +
                "Status : " + response.status + "</br>" +
                "Body : " + response.body;
            LoadObjectStateGroupsLoader.style.display = 'none';
        });
};

// Load an Object State group example
var LoadObjectStateGroupAnchor = document.getElementById('load-object-state-group');
var LoadObjectStateGroupLoader = document.getElementById('load-object-state-group-loader');
LoadObjectStateGroupAnchor.onclick = function(e){

    LoadObjectStateGroupLoader.style.display = 'block';
    e.preventDefault();

    var LoadObjectStateGroupInput = document.getElementById('load-object-state-group-input');
    contentService.loadObjectStateGroup(
        LoadObjectStateGroupInput.value,
        function(error, response){
            clientOutput.innerHTML =    "Errors : " + JSON.stringify(error) + "</br>" +
                "Status : " + response.status + "</br>" +
                "Body : " + response.body;
            LoadObjectStateGroupLoader.style.display = 'none';
        });
};

// Delete an Object State group example
var DeleteObjectStateGroupAnchor = document.getElementById('delete-object-state-group');
var DeleteObjectStateGroupLoader = document.getElementById('delete-object-state-group-loader');
DeleteObjectStateGroupAnchor.onclick = function(e){

    DeleteObjectStateGroupLoader.style.display = 'block';
    e.preventDefault();

    var DeleteObjectStateGroupInput = document.getElementById('delete-object-state-group-input');
    contentService.deleteObjectStateGroup(
        DeleteObjectStateGroupInput.value,
        function(error, response){
            clientOutput.innerHTML =    "Errors : " + JSON.stringify(error) + "</br>" +
                "Status : " + response.status + "</br>" +
                "Body : " + response.body;
            DeleteObjectStateGroupLoader.style.display = 'none';
        });
};

// Load an Object State example
var LoadObjectStateAnchor = document.getElementById('load-object-state');
var LoadObjectStateLoader = document.getElementById('load-object-state-loader');
LoadObjectStateAnchor.onclick = function(e){

    LoadObjectStateLoader.style.display = 'block';
    e.preventDefault();

    var LoadObjectStateInput = document.getElementById('load-object-state-input');

    contentService.loadObjectState(
        LoadObjectStateInput.value,
        function(error, response){
            clientOutput.innerHTML =    "Errors : " + JSON.stringify(error) + "</br>" +
                "Status : " + response.status + "</br>" +
                "Body : " + response.body;
            LoadObjectStateLoader.style.display = 'none';
        });
};


// Update an Object State example
var UpdateObjectStateAnchor = document.getElementById('update-object-state');
var UpdateObjectStateLoader = document.getElementById('update-object-state-loader');
UpdateObjectStateAnchor.onclick = function(e){

    UpdateObjectStateLoader.style.display = 'block';
    e.preventDefault();

    var UpdateObjectStateInput = document.getElementById('update-object-state-input');
    var objectStateUpdateStruct = contentService.newObjectStateUpdateStruct(
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

    contentService.updateObjectState(
        UpdateObjectStateInput.value,
        objectStateUpdateStruct,
        function(error, response){
            clientOutput.innerHTML =    "Errors : " + JSON.stringify(error) + "</br>" +
                "Status : " + response.status + "</br>" +
                "Body : " + response.body;
            UpdateObjectStateLoader.style.display = 'none';
        });
};

// Delete an Object State example
var DeleteObjectStateAnchor = document.getElementById('delete-object-state');
var DeleteObjectStateLoader = document.getElementById('delete-object-state-loader');
DeleteObjectStateAnchor.onclick = function(e){

    DeleteObjectStateLoader.style.display = 'block';
    e.preventDefault();

    var DeleteObjectStateInput = document.getElementById('delete-object-state-input');

    contentService.deleteObjectState(
        DeleteObjectStateInput.value,
        function(error, response){
            clientOutput.innerHTML =    "Errors : " + JSON.stringify(error) + "</br>" +
                "Status : " + response.status + "</br>" +
                "Body : " + response.body;
            DeleteObjectStateLoader.style.display = 'none';
        });
};

// Get Object State of a content example
var GetContentStateAnchor = document.getElementById('get-content-state');
var GetContentStateLoader = document.getElementById('get-content-state-loader');
GetContentStateAnchor.onclick = function(e){

    GetContentStateLoader.style.display = 'block';
    e.preventDefault();

    var GetContentStateInput = document.getElementById('get-content-state-input');
    contentService.getContentState(
        GetContentStateInput.value,
        function(error, response){
            clientOutput.innerHTML =    "Errors : " + JSON.stringify(error) + "</br>" +
                "Status : " + response.status + "</br>" +
                "Body : " + response.body;
            GetContentStateLoader.style.display = 'none';
        });
};

// Set Object State of a content example
var SetContentStateAnchor = document.getElementById('set-content-state');
var SetContentStateLoader = document.getElementById('set-content-state-loader');
SetContentStateAnchor.onclick = function(e){

    SetContentStateLoader.style.display = 'block';
    e.preventDefault();

    var objectStates = [];
    var objectState = {};
    objectState.ObjectState = contentService.newObjectStateCreateStruct(
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
    ).body.ObjectStateCreate;

    objectStates.push(objectState);

    var SetContentStateInput = document.getElementById('set-content-state-input');
    contentService.setContentState(
        SetContentStateInput.value,
        objectStates,
        function(error, response){
            clientOutput.innerHTML =    "Errors : " + JSON.stringify(error) + "</br>" +
                "Status : " + response.status + "</br>" +
                "Body : " + response.body;
            SetContentStateLoader.style.display = 'none';
        });
};



// Create an alias example
var CreateUrlAliasAnchor = document.getElementById('create-url-alias');
var CreateUrlAliasLoader = document.getElementById('create-url-alias-loader');
CreateUrlAliasAnchor.onclick = function(e){

    CreateUrlAliasLoader.style.display = 'block';
    e.preventDefault();

    var urlAliasCreateStruct = contentService.newUrlAliasCreateStruct(
        "eng-US",
        "findme-alias",
        "content/search"
    );

    contentService.createUrlAlias(
        "/api/ezp/v2/content/urlaliases",
        urlAliasCreateStruct,
        function(error, response){
            clientOutput.innerHTML =    "Errors : " + JSON.stringify(error) + "</br>" +
                "Status : " + response.status + "</br>" +
                "Body : " + response.body;
            CreateUrlAliasLoader.style.display = 'none';
        });
};


// List global aliases example
var ListGlobalAliasesAnchor = document.getElementById('list-global-aliases');
var ListGlobalAliasesLoader = document.getElementById('list-global-aliases-loader');
ListGlobalAliasesAnchor.onclick = function(e){

    ListGlobalAliasesLoader.style.display = 'block';
    e.preventDefault();

    contentService.listGlobalAliases(
        "/api/ezp/v2/content/urlaliases",
        function(error, response){
            clientOutput.innerHTML =    "Errors : " + JSON.stringify(error) + "</br>" +
                "Status : " + response.status + "</br>" +
                "Body : " + response.body;
            ListGlobalAliasesLoader.style.display = 'none';
        });
};

// List location aliases example
var ListLocationAliasesAnchor = document.getElementById('list-location-aliases');
var ListLocationAliasesLoader = document.getElementById('list-location-aliases-loader');
ListLocationAliasesAnchor.onclick = function(e){

    ListLocationAliasesLoader.style.display = 'block';
    e.preventDefault();

    var ListLocationAliasesInput = document.getElementById('list-location-aliases-input');
    contentService.listLocationAliases(
        ListLocationAliasesInput.value,
        false,
        function(error, response){
            clientOutput.innerHTML =    "Errors : " + JSON.stringify(error) + "</br>" +
                "Status : " + response.status + "</br>" +
                "Body : " + response.body;
            ListLocationAliasesLoader.style.display = 'none';
        });
};

// Load the URL alias example
var LoadUrlAliasAnchor = document.getElementById('load-url-alias');
var LoadUrlAliasLoader = document.getElementById('load-url-alias-loader');
LoadUrlAliasAnchor.onclick = function(e){

    LoadUrlAliasLoader.style.display = 'block';
    e.preventDefault();

    var LoadUrlAliasInput = document.getElementById('load-url-alias-input');
    contentService.loadUrlAlias(
        LoadUrlAliasInput.value,
        function(error, response){
            clientOutput.innerHTML =    "Errors : " + JSON.stringify(error) + "</br>" +
                "Status : " + response.status + "</br>" +
                "Body : " + response.body;
            LoadUrlAliasLoader.style.display = 'none';
        });
};

// Delete the URL alias example
var DeleteUrlAliasAnchor = document.getElementById('delete-url-alias');
var DeleteUrlAliasLoader = document.getElementById('delete-url-alias-loader');
DeleteUrlAliasAnchor.onclick = function(e){

    DeleteUrlAliasLoader.style.display = 'block';
    e.preventDefault();

    var DeleteUrlAliasInput = document.getElementById('delete-url-alias-input');
    contentService.deleteUrlAlias(
        DeleteUrlAliasInput.value,
        function(error, response){
            clientOutput.innerHTML =    "Errors : " + JSON.stringify(error) + "</br>" +
                "Status : " + response.status + "</br>" +
                "Body : " + response.body;
            DeleteUrlAliasLoader.style.display = 'none';
        });
};

// Create a URL wildcard example
var CreateUrlWildcardAnchor = document.getElementById('create-url-wildcard');
var CreateUrlWildcardLoader = document.getElementById('create-url-wildcard-loader');
CreateUrlWildcardAnchor.onclick = function(e){

    CreateUrlWildcardLoader.style.display = 'block';
    e.preventDefault();

    var CreateUrlWildCardInput = document.getElementById('create-url-wildcard-input');
    var urlWildcardCreateStruct = contentService.newUrlWildcardCreateStruct(
        "some-new-wildcard-" + Math.random(100) * 1000,
        CreateUrlWildCardInput.value,
        false
    );
    contentService.createUrlWildcard(
        "/api/ezp/v2/content/urlwildcards",
        urlWildcardCreateStruct,
        function(error, response){
            clientOutput.innerHTML =    "Errors : " + JSON.stringify(error) + "</br>" +
                "Status : " + response.status + "</br>" +
                "Body : " + response.body;
            CreateUrlWildcardLoader.style.display = 'none';
        }
    );
};

// List URL wildcards example
var LoadUrlWildcardsAnchor = document.getElementById('load-url-wildcards');
var LoadUrlWildcardsLoader = document.getElementById('load-url-wildcards-loader');
LoadUrlWildcardsAnchor.onclick = function(e){

    LoadUrlWildcardsLoader.style.display = 'block';
    e.preventDefault();

    contentService.loadUrlWildcards(
        "/api/ezp/v2/content/urlwildcards",
        function(error, response){
            clientOutput.innerHTML =    "Errors : " + JSON.stringify(error) + "</br>" +
                "Status : " + response.status + "</br>" +
                "Body : " + response.body;
            LoadUrlWildcardsLoader.style.display = 'none';
        });
};

// Load URL wildcard example
var LoadUrlWildcardAnchor = document.getElementById('load-url-wildcard');
var LoadUrlWildcardLoader = document.getElementById('load-url-wildcard-loader');
LoadUrlWildcardAnchor.onclick = function(e){

    LoadUrlWildcardLoader.style.display = 'block';
    e.preventDefault();

    LoadUrlWildcardInput = document.getElementById('load-url-wildcard-input');
    contentService.loadUrlWildcard(
        LoadUrlWildcardInput.value,
        function(error, response){
            clientOutput.innerHTML =    "Errors : " + JSON.stringify(error) + "</br>" +
                "Status : " + response.status + "</br>" +
                "Body : " + response.body;
            LoadUrlWildcardLoader.style.display = 'none';
        });
};

// Delete URL wildcard example
var DeleteUrlWildcardAnchor = document.getElementById('delete-url-wildcard');
var DeleteUrlWildcardLoader = document.getElementById('delete-url-wildcard-loader');
DeleteUrlWildcardAnchor.onclick = function(e){

    DeleteUrlWildcardLoader.style.display = 'block';
    e.preventDefault();

    DeleteUrlWildcardInput = document.getElementById('delete-url-wildcard-input');
    contentService.deleteUrlWildcard(
        DeleteUrlWildcardInput.value,
        function(error, response){
            clientOutput.innerHTML =    "Errors : " + JSON.stringify(error) + "</br>" +
                "Status : " + response.status + "</br>" +
                "Body : " + response.body;
            DeleteUrlWildcardLoader.style.display = 'none';
        });
};