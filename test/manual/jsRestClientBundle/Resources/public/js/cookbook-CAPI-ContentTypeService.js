// Some simple js REST CAPI Content Type Service usage scenario

var contentTypeService = jsCAPI.getContentTypeService();
var clientOutput = document.getElementById('output');

// ******************************
// ******************************

// Create content type group example
var CreateContentTypeGroupAnchor = document.getElementById('create-contenttype-group');
var CreateContentTypeGroupLoader = document.getElementById('create-contenttype-group-loader');
CreateContentTypeGroupAnchor.onclick = function(e){

    CreateContentTypeGroupLoader.style.display = 'block';
    e.preventDefault();

    var contentTypeGroupCreateStruct = contentTypeService.newContentTypeGroupInputStruct(
        "some-group-id" + Math.random(100)
    );

    contentTypeService.createContentTypeGroup(
        "/api/ezp/v2/content/typegroups",
        contentTypeGroupCreateStruct,
        function(error, response){
            clientOutput.innerHTML =    "Errors : " + JSON.stringify(error) + "</br>" +
                "Status : " + response.status + "</br>" +
                "Body : " + response.body;
            CreateContentTypeGroupLoader.style.display = 'none';
        });
};


// Load content type groups list example
var loadContentTypeGroupsAnchor = document.getElementById('load-contenttype-groups');
var loadContentTypeGroupsLoader = document.getElementById('load-contenttype-groups-loader');
loadContentTypeGroupsAnchor.onclick = function(e){

    loadContentTypeGroupsLoader.style.display = 'block';
    e.preventDefault();

    contentTypeService.loadContentTypeGroups(
        '/api/ezp/v2/content/typegroups',
        function(error, response){
            clientOutput.innerHTML =    "Errors : " + JSON.stringify(error) + "</br>" +
                "Status : " + response.status + "</br>" +
                "Body : " + response.body;
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
        contentTypeService.loadContentTypeGroup(
            loadContentTypeGroupInput.value,
            function(error, response){
                clientOutput.innerHTML =    "Errors : " + JSON.stringify(error) + "</br>" +
                    "Status : " + response.status + "</br>" +
                    "Body : " + response.body;
                loadContentTypeGroupLoader.style.display = 'none';
            }
        );
    } else {
        clientOutput.innerHTML = 'Id is missing!';
    }
};


// Load content type group by identifier example
var loadContentTypeGroupByIdentifierAnchor = document.getElementById('load-contenttype-group-by-identifier');
var loadContentTypeGroupByIdentifierLoader = document.getElementById('load-contenttype-group-by-identifier-loader');
loadContentTypeGroupByIdentifierAnchor.onclick = function(e){

    loadContentTypeGroupByIdentifierLoader.style.display = 'block';
    e.preventDefault();

    var loadContentTypeGroupByIdentifierInput = document.getElementById('load-contenttype-group-by-identifier-input');
    if (loadContentTypeGroupByIdentifierInput.value.length){
        contentTypeService.loadContentTypeGroupByIdentifier(
            "/api/ezp/v2/content/typegroups",
            loadContentTypeGroupByIdentifierInput.value,
            function(error, response){
                clientOutput.innerHTML =    "Errors : " + JSON.stringify(error) + "</br>" +
                    "Status : " + response.status + "</br>" +
                    "Body : " + response.body;
                loadContentTypeGroupByIdentifierLoader.style.display = 'none';
            }
        );
    } else {
        clientOutput.innerHTML = 'Id is missing!';
    }
};

// Update content type group example
var UpdateContentTypeGroupAnchor = document.getElementById('update-contenttype-group');
var UpdateContentTypeGroupLoader = document.getElementById('update-contenttype-group-loader');
UpdateContentTypeGroupAnchor.onclick = function(e){

    UpdateContentTypeGroupLoader.style.display = 'block';
    e.preventDefault();

    var contentTypeGroupUpdateStruct = contentTypeService.newContentTypeGroupInputStruct(
        "some-group-id" + Math.random(100)
        ),
        updateContentTypeGroupInput = document.getElementById('update-contenttype-group-input');

    contentTypeService.updateContentTypeGroup(
        updateContentTypeGroupInput.value,
        contentTypeGroupUpdateStruct,
        function(error, response){
            clientOutput.innerHTML =    "Errors : " + JSON.stringify(error) + "</br>" +
                "Status : " + response.status + "</br>" +
                "Body : " + response.body;
            UpdateContentTypeGroupLoader.style.display = 'none';
        });
};

// Delete content type group example
var DeleteContentTypeGroupAnchor = document.getElementById('delete-contenttype-group');
var DeleteContentTypeGroupLoader = document.getElementById('delete-contenttype-group-loader');
DeleteContentTypeGroupAnchor.onclick = function(e){

    DeleteContentTypeGroupLoader.style.display = 'block';
    e.preventDefault();

    var DeleteContentTypeGroupInput = document.getElementById('delete-contenttype-group-input');
    if (DeleteContentTypeGroupInput.value.length){
        contentTypeService.deleteContentTypeGroup(
            DeleteContentTypeGroupInput.value,
            function(error, response){
                clientOutput.innerHTML =    "Errors : " + JSON.stringify(error) + "</br>" +
                    "Status : " + response.status + "</br>" +
                    "Body : " + response.body;
                DeleteContentTypeGroupLoader.style.display = 'none';
            }
        );
    } else {
        clientOutput.innerHTML = 'Id is missing!';
    }
};

// List content type for a group example
var LoadContentTypesAnchor = document.getElementById('load-content-types');
var LoadContentTypesLoader = document.getElementById('load-content-types-loader');
LoadContentTypesAnchor.onclick = function(e){

    LoadContentTypesLoader.style.display = 'block';
    e.preventDefault();

    var LoadContentTypesInput = document.getElementById('load-content-types-input');
    if (LoadContentTypesInput.value.length){
        contentTypeService.loadContentTypes(
            LoadContentTypesInput.value,
            function(error, response){
                clientOutput.innerHTML =    "Errors : " + JSON.stringify(error) + "</br>" +
                    "Status : " + response.status + "</br>" +
                    "Body : " + response.body;
                LoadContentTypesLoader.style.display = 'none';
            }
        );
    } else {
        clientOutput.innerHTML = 'Id is missing!';
    }
};


// Create content type example
var CreateContentTypeAnchor = document.getElementById('create-content-type');
var CreateContentTypeLoader = document.getElementById('create-content-type-loader');
CreateContentTypeAnchor.onclick = function(e){

    CreateContentTypeLoader.style.display = 'block';
    e.preventDefault();

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
        "/api/ezp/v2/content/typegroups/1",
        contentTypeCreateStruct,
        true,
        function(error, response){
            clientOutput.innerHTML =    "Errors : " + JSON.stringify(error) + "</br>" +
                "Status : " + response.status + "</br>" +
                "Body : " + response.body;
            CreateContentTypeLoader.style.display = 'none';
        }
    );
};

// Load content type example
var LoadContentTypeAnchor = document.getElementById('load-content-type');
var LoadContentTypeLoader = document.getElementById('load-content-type-loader');
LoadContentTypeAnchor.onclick = function(e){

    LoadContentTypeLoader.style.display = 'block';
    e.preventDefault();

    var LoadContentTypeInput = document.getElementById('load-content-type-input');
    if (LoadContentTypeInput.value.length){
        contentTypeService.loadContentType(
            LoadContentTypeInput.value,
            function(error, response){
                clientOutput.innerHTML =    "Errors : " + JSON.stringify(error) + "</br>" +
                    "Status : " + response.status + "</br>" +
                    "Body : " + response.body;
                LoadContentTypeLoader.style.display = 'none';
            }
        );
    } else {
        clientOutput.innerHTML = 'Id is missing!';
    }
};

// Load content type by identifier example
var LoadContentTypeByIdentifierAnchor = document.getElementById('load-content-type-by-identifier');
var LoadContentTypeByIdentifierLoader = document.getElementById('load-content-type-by-identifier-loader');
LoadContentTypeByIdentifierAnchor.onclick = function(e){

    LoadContentTypeByIdentifierLoader.style.display = 'block';
    e.preventDefault();

    var LoadContentTypeByIdentifierInput = document.getElementById('load-content-type-by-identifier-input');
    if (LoadContentTypeByIdentifierInput.value.length){
        contentTypeService.loadContentTypeByIdentifier(
            LoadContentTypeByIdentifierInput.value,
            function(error, response){
                clientOutput.innerHTML =    "Errors : " + JSON.stringify(error) + "</br>" +
                    "Status : " + response.status + "</br>" +
                    "Body : " + response.body;
                LoadContentTypeByIdentifierLoader.style.display = 'none';
            }
        );
    } else {
        clientOutput.innerHTML = 'Id is missing!';
    }
};

// Copy content type example
var CopyContentTypeAnchor = document.getElementById('copy-content-type');
var CopyContentTypeLoader = document.getElementById('copy-content-type-loader');
CopyContentTypeAnchor.onclick = function(e){

    CopyContentTypeLoader.style.display = 'block';
    e.preventDefault();

    var CopyContentTypeInput = document.getElementById('copy-content-type-input');
    if (CopyContentTypeInput.value.length){
        contentTypeService.copyContentType(
            CopyContentTypeInput.value,
            function(error, response){
                clientOutput.innerHTML =    "Errors : " + JSON.stringify(error) + "</br>" +
                    "Status : " + response.status + "</br>" +
                    "Body : " + response.body;
                CopyContentTypeLoader.style.display = 'none';
            }
        );
    } else {
        clientOutput.innerHTML = 'Id is missing!';
    }
};

// Create content type draft example
var CreateContentTypeDraftAnchor = document.getElementById('create-content-type-draft');
var CreateContentTypeDraftLoader = document.getElementById('create-content-type-draft-loader');
CreateContentTypeDraftAnchor.onclick = function(e){

    CreateContentTypeDraftLoader.style.display = 'block';
    e.preventDefault();

    var contentTypeUpdateStruct = contentTypeService.newContentTypeUpdateStruct(),
        CreateContentTypeDraftInput = document.getElementById('create-content-type-draft-input');

    contentTypeUpdateStruct.names = {};
    contentTypeUpdateStruct.names.value = [
        {
            "_languageCode":"eng-US",
            "#text":"Some new FD Name " + Math.random(10000)
        }
    ];

    if (CreateContentTypeDraftInput.value.length){
        contentTypeService.createContentTypeDraft(
            CreateContentTypeDraftInput.value,
            contentTypeUpdateStruct,
            function(error, response){
                clientOutput.innerHTML =    "Errors : " + JSON.stringify(error) + "</br>" +
                    "Status : " + response.status + "</br>" +
                    "Body : " + response.body;
                CreateContentTypeDraftLoader.style.display = 'none';
            }
        );
    } else {
        clientOutput.innerHTML = 'Id is missing!';
    }
};

// Load content type draft example
var LoadContentTypeDraftAnchor = document.getElementById('load-content-type-draft');
var LoadContentTypeDraftLoader = document.getElementById('load-content-type-draft-loader');
LoadContentTypeDraftAnchor.onclick = function(e){

    LoadContentTypeDraftLoader.style.display = 'block';
    e.preventDefault();

    var LoadContentTypeDraftInput = document.getElementById('load-content-type-draft-input');
    if (LoadContentTypeDraftInput.value.length){
        contentTypeService.loadContentTypeDraft(
            LoadContentTypeDraftInput.value,
            function(error, response){
                clientOutput.innerHTML =    "Errors : " + JSON.stringify(error) + "</br>" +
                    "Status : " + response.status + "</br>" +
                    "Body : " + response.body;
                LoadContentTypeDraftLoader.style.display = 'none';
            }
        );
    } else {
        clientOutput.innerHTML = 'Id is missing!';
    }
};

// Update content type draft example
var UpdateContentTypeDraftAnchor = document.getElementById('update-content-type-draft');
var UpdateContentTypeDraftLoader = document.getElementById('update-content-type-draft-loader');
UpdateContentTypeDraftAnchor.onclick = function(e){

    UpdateContentTypeDraftLoader.style.display = 'block';
    e.preventDefault();

    var contentTypeUpdateStruct = contentTypeService.newContentTypeUpdateStruct(),
        UpdateContentTypeDraftInput = document.getElementById('update-content-type-draft-input');

    contentTypeUpdateStruct.names = {};
    contentTypeUpdateStruct.names.value = [
        {
            "_languageCode":"eng-US",
            "#text":"Some new FD Name " + Math.random(10000)
        }
    ];

    if (UpdateContentTypeDraftInput.value.length){
        contentTypeService.updateContentTypeDraftMetadata(
            UpdateContentTypeDraftInput.value,
            contentTypeUpdateStruct,
            function(error, response){
                clientOutput.innerHTML =    "Errors : " + JSON.stringify(error) + "</br>" +
                    "Status : " + response.status + "</br>" +
                    "Body : " + response.body;
                UpdateContentTypeDraftLoader.style.display = 'none';
            }
        );
    } else {
        clientOutput.innerHTML = 'Id is missing!';
    }
};

// Add field definition to draft example
var AddFieldDefinitionAnchor = document.getElementById('add-field-definition');
var AddFieldDefinitionLoader = document.getElementById('add-field-definition-loader');
AddFieldDefinitionAnchor.onclick = function(e){

    AddFieldDefinitionLoader.style.display = 'block';
    e.preventDefault();


    var fieldDefinitionCreateStruct,
        AddFieldDefinitionInput = document.getElementById('add-field-definition-input');

    fieldDefinitionCreateStruct = contentTypeService.newFieldDefinitionCreateStruct(
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
        AddFieldDefinitionInput.value,
        fieldDefinitionCreateStruct,
        function(error, response){
            clientOutput.innerHTML =    "Errors : " + JSON.stringify(error) + "</br>" +
                "Status : " + response.status + "</br>" +
                "Body : " + response.body;
            AddFieldDefinitionLoader.style.display = 'none';
        }
    );
};

// Load field definition example
var LoadFieldDefinitionAnchor = document.getElementById('load-field-definition');
var LoadFieldDefinitionLoader = document.getElementById('load-field-definition-loader');
LoadFieldDefinitionAnchor.onclick = function(e){

    LoadFieldDefinitionLoader.style.display = 'block';
    e.preventDefault();

    var LoadFieldDefinitionInput = document.getElementById('load-field-definition-input');
    contentTypeService.loadFieldDefinition(
        LoadFieldDefinitionInput.value,
        function(error, response){
            clientOutput.innerHTML =    "Errors : " + JSON.stringify(error) + "</br>" +
                "Status : " + response.status + "</br>" +
                "Body : " + response.body;
            LoadFieldDefinitionLoader.style.display = 'none';
        }
    );
};

// Update field definition example
var UpdateFieldDefinitionAnchor = document.getElementById('update-field-definition');
var UpdateFieldDefinitionLoader = document.getElementById('update-field-definition-loader');
UpdateFieldDefinitionAnchor.onclick = function(e){

    UpdateFieldDefinitionLoader.style.display = 'block';
    e.preventDefault();

    var fieldDefinitionUpdateStruct = contentTypeService.newFieldDefinitionUpdateStruct(
        "dummy",
        "dummy",
        "dummy",
        "dummy"
        ),
        UpdateFieldDefinitionInput = document.getElementById('update-field-definition-input');

    contentTypeService.updateFieldDefinition(
        UpdateFieldDefinitionInput.value,
        fieldDefinitionUpdateStruct,
        function(error, response){
            clientOutput.innerHTML =    "Errors : " + JSON.stringify(error) + "</br>" +
                "Status : " + response.status + "</br>" +
                "Body : " + response.body;
            UpdateFieldDefinitionLoader.style.display = 'none';
        }
    );
};

// Delete field definition example
var DeleteFieldDefinitionAnchor = document.getElementById('delete-field-definition');
var DeleteFieldDefinitionLoader = document.getElementById('delete-field-definition-loader');
DeleteFieldDefinitionAnchor.onclick = function(e){

    DeleteFieldDefinitionLoader.style.display = 'block';
    e.preventDefault();

    var DeleteFieldDefinitionInput = document.getElementById('delete-field-definition-input');
    contentTypeService.deleteFieldDefinition(
        DeleteFieldDefinitionInput.value,
        function(error, response){
            clientOutput.innerHTML =    "Errors : " + JSON.stringify(error) + "</br>" +
                "Status : " + response.status + "</br>" +
                "Body : " + response.body;
            DeleteFieldDefinitionLoader.style.display = 'none';
        }
    );
};

// Delete content type example
var DeleteContentTypeAnchor = document.getElementById('delete-content-type');
var DeleteContentTypeLoader = document.getElementById('delete-content-type-loader');
DeleteContentTypeAnchor.onclick = function(e){

    DeleteContentTypeLoader.style.display = 'block';
    e.preventDefault();

    var DeleteContentTypeInput = document.getElementById('delete-content-type-input');
    contentTypeService.deleteContentType(
        DeleteContentTypeInput.value,
        function(error, response){
            clientOutput.innerHTML =    "Errors : " + JSON.stringify(error) + "</br>" +
                "Status : " + response.status + "</br>" +
                "Body : " + response.body;
            DeleteContentTypeLoader.style.display = 'none';
        }
    );
};

// Load groups of content type example
var LoadContentTypeGroupsAnchor = document.getElementById('load-content-type-groups');
var LoadContentTypeGroupsLoader = document.getElementById('load-content-type-groups-loader');
LoadContentTypeGroupsAnchor.onclick = function(e){

    LoadContentTypeGroupsLoader.style.display = 'block';
    e.preventDefault();

    var LoadContentTypeGroupsInput = document.getElementById('load-content-type-groups-input');
    contentTypeService.loadGroupsOfContentType(
        LoadContentTypeGroupsInput.value,
        function(error, response){
            clientOutput.innerHTML =    "Errors : " + JSON.stringify(error) + "</br>" +
                "Status : " + response.status + "</br>" +
                "Body : " + response.body;
            LoadContentTypeGroupsLoader.style.display = 'none';
        }
    );
};

// Assign content type to some group example
var AssignContentTypeAnchor = document.getElementById('assign-content-type-group');
var AssignContentTypeLoader = document.getElementById('assign-content-type-group-loader');
AssignContentTypeAnchor.onclick = function(e){

    AssignContentTypeLoader.style.display = 'block';
    e.preventDefault();

    var AssignContentTypeInput = document.getElementById('assign-content-type-group-input');
    contentTypeService.assignContentTypeGroup(
        AssignContentTypeInput.value,
        "/api/ezp/v2/content/typegroups/2",
        function(error, response){
            clientOutput.innerHTML =    "Errors : " + JSON.stringify(error) + "</br>" +
                "Status : " + response.status + "</br>" +
                "Body : " + response.body;
            AssignContentTypeLoader.style.display = 'none';
        }
    );
};

// Unassign content type from some group example
var UnassignContentTypeAnchor = document.getElementById('unassign-content-type-group');
var UnassignContentTypeLoader = document.getElementById('unassign-content-type-group-loader');
UnassignContentTypeAnchor.onclick = function(e){

    UnassignContentTypeLoader.style.display = 'block';
    e.preventDefault();

    var UnassignContentTypeInput = document.getElementById('unassign-content-type-group-input');
    contentTypeService.unassignContentTypeGroup(
        UnassignContentTypeInput.value,
        function(error, response){
            clientOutput.innerHTML =    "Errors : " + JSON.stringify(error) + "</br>" +
                "Status : " + response.status + "</br>" +
                "Body : " + response.body;
            UnassignContentTypeLoader.style.display = 'none';
        }
    );
};


// Publish content type draft example
var PublishContentTypeDraftAnchor = document.getElementById('publish-content-type-draft');
var PublishContentTypeDraftLoader = document.getElementById('publish-content-type-draft-loader');
PublishContentTypeDraftAnchor.onclick = function(e){

    PublishContentTypeDraftLoader.style.display = 'block';
    e.preventDefault();

    var PublishContentTypeDraftInput = document.getElementById('publish-content-type-draft-input');
    contentTypeService.publishContentTypeDraft(
        PublishContentTypeDraftInput.value,
        function(error, response){
            clientOutput.innerHTML =    "Errors : " + JSON.stringify(error) + "</br>" +
                "Status : " + response.status + "</br>" +
                "Body : " + response.body;
            PublishContentTypeDraftLoader.style.display = 'none';
        }
    );
};


// Delete content type draft example
var DeleteContentTypeDraftAnchor = document.getElementById('delete-content-type-draft');
var DeleteContentTypeDraftLoader = document.getElementById('delete-content-type-draft-loader');
DeleteContentTypeDraftAnchor.onclick = function(e){

    DeleteContentTypeDraftLoader.style.display = 'block';
    e.preventDefault();

    var DeleteContentTypeDraftInput = document.getElementById('delete-content-type-draft-input');
    contentTypeService.deleteContentTypeDraft(
        DeleteContentTypeDraftInput.value,
        function(error, response){
            clientOutput.innerHTML =    "Errors : " + JSON.stringify(error) + "</br>" +
                "Status : " + response.status + "</br>" +
                "Body : " + response.body;
            DeleteContentTypeDraftLoader.style.display = 'none';
        }
    );
};

