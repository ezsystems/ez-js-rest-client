// Some simple js REST CAPI usage scenario

var jsCAPI = new CAPI(
    'http://ez.git.local',
    {
        user : "admin",
        password : "admin",
        authMethod : "HTTPBasicAuth"
    },
    "XHR");

var contentService = jsCAPI.getContentService();

var clientOutput = document.getElementById('output');


// Root
var rootAnchor = document.getElementById('root');
var rootLoader = document.getElementById('root-loader');
rootAnchor.onclick = function(e){

    rootLoader.style.display = 'block';
    e.preventDefault();

    contentService.root(
        '/api/ezp/v2/',
        function(data){
            clientOutput.innerHTML = data;
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
            function(data){
                clientOutput.innerHTML = data;
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
        '/api/ezp/v2/content/sections',
        function(data){
            clientOutput.innerHTML = data;
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
    }

    // compatibility remark: JSON API is supported in all modern browsers (IE-wise since IE8)
    contentService.createSection(
        '/api/ezp/v2/content/sections',
        JSON.stringify(sectionInput),
        function(data){
            clientOutput.innerHTML = data;
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
        }

        // compatibility remark: JSON API is supported in all modern browsers (IE-wise since IE8)
        contentService.updateSection(
            updateSectionInput.value,
            JSON.stringify(sectionInput),
            function(data){
                clientOutput.innerHTML = data;
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
            function(data){
                clientOutput.innerHTML = data;
                deleteSectionLoader.style.display = 'none';
            }
        );
    } else {
        clientOutput.innerHTML = 'Id is missing!';
    }
};

// ******************************
// ******************************

// Load content type groups list example
var loadContentTypeGroupsAnchor = document.getElementById('load-contenttype-groups');
var loadContentTypeGroupsLoader = document.getElementById('load-contenttype-groups-loader');
loadContentTypeGroupsAnchor.onclick = function(e){

    loadContentTypeGroupsLoader.style.display = 'block';
    e.preventDefault();

    contentService.loadContentTypeGroups(
        '/api/ezp/v2/content/typegroups',
        function(data){
            clientOutput.innerHTML = data;
            loadContentTypeGroupsLoader.style.display = 'none';
        }
    );
};

// Load single content type group example
var loadContentTypeGroupAnchor = document.getElementById('load-contenttype-group');
var loadContentTypeGroupLoader = document.getElementById('load-contenttype-group-loader');
loadContentTypeGroupAnchor.onclick = function(e){

    loadContentTypeGroupLoader.style.display = 'block';
    e.preventDefault();

    var loadContentTypeGroupInput = document.getElementById('load-contenttype-group-input');
    if (loadContentTypeGroupInput.value.length){
        contentService.loadContentTypeGroup(
            loadContentTypeGroupInput.value,
            function(data){
                clientOutput.innerHTML = data;
                loadContentTypeGroupLoader.style.display = 'none';
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

    contentService.newLocationCreateStruct(
        "/api/ezp/v2/content/locations/1/2/102",
        function(locationCreateStruct){
            contentService.newContentCreateStruct(
                "/api/ezp/v2/content/types/18",
                locationCreateStruct,
                "eng-US",
                "DummyUser",
                function(contentCreateStruct){

                    var fieldInfo = {
                        "fieldDefinitionIdentifier": "title",
                        "languageCode": "eng-US",
                        "fieldValue": "This is a title"
                    }

                    contentCreateStruct.ContentCreate.fields.field.push(fieldInfo);

                    contentService.createContent(
                        '/api/ezp/v2/content/objects',
                        JSON.stringify(contentCreateStruct),
                        function(data){
                            clientOutput.innerHTML = data;
                            createContentLoader.style.display = 'none';
                        }
                    );
                }
            );
        });


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
        contentService.newContentMetadataUpdateStruct(
            "eng-US",
            "DummyUser",
            function(updateStruct){

                updateStruct.ContentUpdate.Section = "/api/ezp/v2/content/sections/2";
                updateStruct.ContentUpdate.remoteId = "random-id-" + Math.random()*1000000;

                contentService.updateContentMetadata(
                    updateContentMetaInput.value,
                    JSON.stringify(updateStruct),
                    function(data){
                        clientOutput.innerHTML = data;
                        updateContentMetaLoader.style.display = 'none';
                    }
                );
            });
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
            function(data){
                clientOutput.innerHTML = data;
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
            function(data){
                clientOutput.innerHTML = data;
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
            function(data){
                clientOutput.innerHTML = data;
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
            function(data){
                clientOutput.innerHTML = data;
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
            function(data){
                clientOutput.innerHTML = data;
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
            function(data){
                clientOutput.innerHTML = data;
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

        contentService.newContentUpdateStruct(
            "eng-US",
            "DummyUser",
            function(contentUpdateStruct){

                var fieldInfo = {
                    "fieldDefinitionIdentifier": "title",
                    "languageCode": "eng-US",
                    "fieldValue": "This is a new title" + Math.random()*1000000
                }

                contentUpdateStruct.VersionUpdate.fields.field.push(fieldInfo);

                contentService.updateContent(
                    updateContentInput.value,
                    JSON.stringify(contentUpdateStruct),
                    function(data){
                        clientOutput.innerHTML = data;
                        updateContentLoader.style.display = 'none';
                    }
                );
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
            function(data){
                clientOutput.innerHTML = data;
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
            function(data){
                clientOutput.innerHTML = data;
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
            function(data){
                clientOutput.innerHTML = data;
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

    contentService.newContentUpdateStruct(
        "eng-US",
        "DummyUser",
        function(data){

            var fieldInfo = {
                "fieldDefinitionIdentifier": "title",
                "languageCode": "eng-US",
                "fieldValue": "This is a new title" + Math.random()*1000000
            }

            data.VersionUpdate.fields.field.push(fieldInfo);

            var anotherFieldInfo = {
                "fieldDefinitionIdentifier": "text",
                "languageCode": "eng-US",
                "fieldValue": "This is a new text" + Math.random()*1000000
            }


            data.VersionUpdate.fields.field.push(anotherFieldInfo);

            clientOutput.innerHTML = JSON.stringify(data);
        }
    );
};

// Content metadata update structure example
var newContentMetaUpdateStructAnchor = document.getElementById('new-content-meta-update-struct');
newContentMetaUpdateStructAnchor.onclick = function(e){

    e.preventDefault();

    contentService.newContentMetadataUpdateStruct(
        "eng-US",
        "DummyUser",
        function(updateStruct){

            updateStruct.ContentUpdate.Section = "/api/ezp/v2/content/sections/2";
            updateStruct.ContentUpdate.remoteId = "random-id-" + Math.random()*1000000;

            clientOutput.innerHTML = JSON.stringify(updateStruct);
        });
};


// Content create structure example
var newContentCreateStructAnchor = document.getElementById('new-content-create-struct');
newContentCreateStructAnchor.onclick = function(e){

    e.preventDefault();

    contentService.newLocationCreateStruct(
        "/api/ezp/v2/content/locations/1/2/102",
        function(locationCreateStruct){
            contentService.newContentCreateStruct(
                "/api/ezp/v2/content/types/18",
                locationCreateStruct,
                "eng-US",
                "DummyUser",
                function(contentCreateStruct){
                    clientOutput.innerHTML = JSON.stringify(contentCreateStruct);
                }
            );
        });
};

// Location create structure example
var newLocationCreateStructAnchor = document.getElementById('new-location-create-struct');
newLocationCreateStructAnchor.onclick = function(e){

    e.preventDefault();

    contentService.newLocationCreateStruct(
        "/api/ezp/v2/content/locations/1/2/102",
        function(locationCreateStruct){

                clientOutput.innerHTML = JSON.stringify(locationCreateStruct);

        });
};


// Create location example
var CreateLocationAnchor = document.getElementById('create-location');
var CreateLocationLoader = document.getElementById('create-location-loader');
CreateLocationAnchor.onclick = function(e){

    CreateLocationLoader.style.display = 'block';
    e.preventDefault();

    contentService.newLocationCreateStruct(
        "/api/ezp/v2/content/locations/1/2/107",
        function(locationCreateStruct){
            var CreateLocationInput = document.getElementById('create-location-input');
            if (CreateLocationInput.value.length){
                contentService.createLocation(
                    CreateLocationInput.value,
                    locationCreateStruct,
                    function(data){
                        clientOutput.innerHTML = data;
                        CreateLocationLoader.style.display = 'none';
                    }
                );
            } else {
                clientOutput.innerHTML = 'Id is missing!';
            }
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
        function(data){
            clientOutput.innerHTML = data;
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
        function(data){
            clientOutput.innerHTML = data;
            LoadLocationLoader.style.display = 'none';
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
        function(data){
            clientOutput.innerHTML = data;
            CopySubtreeLoader.style.display = 'none';
        });
};