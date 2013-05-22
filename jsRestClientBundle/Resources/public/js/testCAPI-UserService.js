// Some simple js REST CAPI User Service usage scenario

var userService = jsCAPI.getUserService();
var clientOutput = document.getElementById('output');

// ******************************
// ******************************

// Load Root user group example
var LoadRootUserGroupAnchor = document.getElementById('load-root-user-group');
var LoadRootUserGroupLoader = document.getElementById('load-root-user-group-loader');
LoadRootUserGroupAnchor.onclick = function(e){

    LoadRootUserGroupLoader.style.display = 'block';
    e.preventDefault();

    userService.loadRootUserGroup(
        function(error, response){
            clientOutput.innerHTML =    "Errors : " + JSON.stringify(error) + "</br>" +
                "Status : " + response.status + "</br>" +
                "Body : " + response.body;
            LoadRootUserGroupLoader.style.display = 'none';
        });
};

// Load user group example
var LoadUserGroupAnchor = document.getElementById('load-user-group');
var LoadUserGroupLoader = document.getElementById('load-user-group-loader');
LoadUserGroupAnchor.onclick = function(e){

    LoadUserGroupLoader.style.display = 'block';
    e.preventDefault();

    var LoadUserGroupInput = document.getElementById('load-user-group-input');
    userService.loadUserGroup(
        LoadUserGroupInput.value,
        function(error, response){
            clientOutput.innerHTML =    "Errors : " + JSON.stringify(error) + "</br>" +
                "Status : " + response.status + "</br>" +
                "Body : " + response.body;
            LoadUserGroupLoader.style.display = 'none';
        });
};

// Create user group example
var CreateUserGroupAnchor = document.getElementById('create-user-group');
var CreateUserGroupLoader = document.getElementById('create-user-group-loader');
CreateUserGroupAnchor.onclick = function(e){

    CreateUserGroupLoader.style.display = 'block';
    e.preventDefault();

    var userGroupCreateStruct = userService.newUserGroupCreateStruct(
        "eng-US",
        [
            {
                fieldDefinitionIdentifier : "name",
                languageCode : "eng-US",
                fieldValue : "UserGroup"
            },
            {
                fieldDefinitionIdentifier : "description",
                languageCode : "eng-US",
                fieldValue : "This is the description of the user group"
            }
        ]
    );

    var CreateUserGroupInput = document.getElementById('create-user-group-input');
    userService.createUserGroup(
        CreateUserGroupInput.value,
        userGroupCreateStruct,
        function(error, response){
            clientOutput.innerHTML =    "Errors : " + JSON.stringify(error) + "</br>" +
                "Status : " + response.status + "</br>" +
                "Body : " + response.body;
            CreateUserGroupLoader.style.display = 'none';
        });
};


// Update user group example
var UpdateUserGroupAnchor = document.getElementById('update-user-group');
var UpdateUserGroupLoader = document.getElementById('update-user-group-loader');
UpdateUserGroupAnchor.onclick = function(e){

    UpdateUserGroupLoader.style.display = 'block';
    e.preventDefault();

    var userGroupUpdateStruct = userService.newUserGroupUpdateStruct();

    userGroupUpdateStruct.body.UserGroupUpdate.fields.field = [
        {
            fieldDefinitionIdentifier : "name",
            languageCode : "eng-US",
            fieldValue : "UserGroup" + Math.random(100)
        },
        {
            fieldDefinitionIdentifier : "description",
            languageCode : "eng-US",
            fieldValue : "This is the random description of the user group" + Math.random(100)
        }
    ];

    var UpdateUserGroupInput = document.getElementById('update-user-group-input');
    userService.updateUserGroup(
        UpdateUserGroupInput.value,
        userGroupUpdateStruct,
        function(error, response){
            clientOutput.innerHTML =    "Errors : " + JSON.stringify(error) + "</br>" +
                "Status : " + response.status + "</br>" +
                "Body : " + response.body;
            UpdateUserGroupLoader.style.display = 'none';
        });
};

// Load sub groups for a group example
var LoadSubUserGroupsAnchor = document.getElementById('load-sub-user-groups');
var LoadSubUserGroupsLoader = document.getElementById('load-sub-user-groups-loader');
LoadSubUserGroupsAnchor.onclick = function(e){

    LoadSubUserGroupsLoader.style.display = 'block';
    e.preventDefault();

    var LoadSubUserGroupsInput = document.getElementById('load-sub-user-groups-input');
    userService.loadSubUserGroups(
        LoadSubUserGroupsInput.value,
        function(error, response){
            clientOutput.innerHTML =    "Errors : " + JSON.stringify(error) + "</br>" +
                "Status : " + response.status + "</br>" +
                "Body : " + response.body;
            LoadSubUserGroupsLoader.style.display = 'none';
        });
};

// Load user groups for a user example
var LoadUserGroupsOfUserAnchor = document.getElementById('load-user-groups-of-user');
var LoadUserGroupsOfUserLoader = document.getElementById('load-user-groups-of-user-loader');
LoadUserGroupsOfUserAnchor.onclick = function(e){

    LoadUserGroupsOfUserLoader.style.display = 'block';
    e.preventDefault();

    var LoadUserGroupsOfUserInput = document.getElementById('load-user-groups-of-user-input');
    userService.loadUserGroupsOfUser(
        LoadUserGroupsOfUserInput.value,
        function(error, response){
            clientOutput.innerHTML =    "Errors : " + JSON.stringify(error) + "</br>" +
                "Status : " + response.status + "</br>" +
                "Body : " + response.body;
            LoadUserGroupsOfUserLoader.style.display = 'none';
        });
};
