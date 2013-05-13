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
        "some-group-id" + Math.random(100),
        "eng-US"
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

// Update content type group example
var UpdateContentTypeGroupAnchor = document.getElementById('update-contenttype-group');
var UpdateContentTypeGroupLoader = document.getElementById('update-contenttype-group-loader');
UpdateContentTypeGroupAnchor.onclick = function(e){

    UpdateContentTypeGroupLoader.style.display = 'block';
    e.preventDefault();

    var contentTypeGroupUpdateStruct = contentTypeService.newContentTypeGroupInputStruct(
        "some-group-id" + Math.random(100),
        "eng-US"
    );

    var updateContentTypeGroupInput = document.getElementById('update-contenttype-group-input');
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