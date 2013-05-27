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

// Delete user group example
var DeleteUserGroupAnchor = document.getElementById('delete-user-group');
var DeleteUserGroupLoader = document.getElementById('delete-user-group-loader');
DeleteUserGroupAnchor.onclick = function(e){

    DeleteUserGroupLoader.style.display = 'block';
    e.preventDefault();

    var DeleteUserGroupInput = document.getElementById('delete-user-group-input');
    userService.deleteUserGroup(
        DeleteUserGroupInput.value,
        function(error, response){
            clientOutput.innerHTML =    "Errors : " + JSON.stringify(error) + "</br>" +
                "Status : " + response.status + "</br>" +
                "Body : " + response.body;
            DeleteUserGroupLoader.style.display = 'none';
        });
};

// Move user group example
var MoveUserGroupAnchor = document.getElementById('move-user-group');
var MoveUserGroupLoader = document.getElementById('move-user-group-loader');
MoveUserGroupAnchor.onclick = function(e){

    MoveUserGroupLoader.style.display = 'block';
    e.preventDefault();

    var MoveUserGroupInput = document.getElementById('move-user-group-input');
    userService.moveUserGroup(
        MoveUserGroupInput.value,
        "/api/ezp/v2/user/groups/1/5",
        function(error, response){
            clientOutput.innerHTML =    "Errors : " + JSON.stringify(error) + "</br>" +
                "Status : " + response.status + "</br>" +
                "Body : " + response.body;
            MoveUserGroupLoader.style.display = 'none';
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

// Load users for a user group
var LoadUsersOfUserGroupAnchor = document.getElementById('load-users-of-user-group');
var LoadUsersOfUserGroupLoader = document.getElementById('load-users-of-user-group-loader');
LoadUsersOfUserGroupAnchor.onclick = function(e){

    LoadUsersOfUserGroupLoader.style.display = 'block';
    e.preventDefault();

    var LoadUsersOfUserGroupInput = document.getElementById('load-users-of-user-group-input');
    userService.loadUsersOfUserGroup(
        LoadUsersOfUserGroupInput.value,
        function(error, response){
            clientOutput.innerHTML =    "Errors : " + JSON.stringify(error) + "</br>" +
                "Status : " + response.status + "</br>" +
                "Body : " + response.body;
            LoadUsersOfUserGroupLoader.style.display = 'none';
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

// Create user example
var CreateUserAnchor = document.getElementById('create-user');
var CreateUserLoader = document.getElementById('create-user-loader');
CreateUserAnchor.onclick = function(e){

    CreateUserLoader.style.display = 'block';
    e.preventDefault();

    var userCreateStruct = userService.newUserCreateStruct(
        "eng-US",
        "johndoe3",
        "johndoe3@nowhere.no",
        "johndoepass3",
        [
            {
                fieldDefinitionIdentifier : "first_name",
                languageCode : "eng-US",
                fieldValue : "John"
            },
            {
                fieldDefinitionIdentifier : "last_name",
                languageCode : "eng-US",
                fieldValue : "Doe"
            }
        ]
    );

    var CreateUserInput = document.getElementById('create-user-input');
    userService.createUser(
        CreateUserInput.value,
        userCreateStruct,
        function(error, response){
            clientOutput.innerHTML =    "Errors : " + JSON.stringify(error) + "</br>" +
                "Status : " + response.status + "</br>" +
                "Body : " + response.body;
            CreateUserLoader.style.display = 'none';
        });
};

// Load user example
var LoadUserAnchor = document.getElementById('load-user');
var LoadUserLoader = document.getElementById('load-user-loader');
LoadUserAnchor.onclick = function(e){

    LoadUserLoader.style.display = 'block';
    e.preventDefault();

    var LoadUserInput = document.getElementById('load-user-input');
    userService.loadUser(
        LoadUserInput.value,
        function(error, response){
            clientOutput.innerHTML =    "Errors : " + JSON.stringify(error) + "</br>" +
                "Status : " + response.status + "</br>" +
                "Body : " + response.body;
            LoadUserLoader.style.display = 'none';
        });
};

// Update user example
var UpdateUserAnchor = document.getElementById('update-user');
var UpdateUserLoader = document.getElementById('update-user-loader');
UpdateUserAnchor.onclick = function(e){

    UpdateUserLoader.style.display = 'block';
    e.preventDefault();

    var userUpdateStruct = userService.newUserUpdateStruct();

    userUpdateStruct.body.UserUpdate.email = "somenewemail@nowhere.no";

    var UpdateUserInput = document.getElementById('update-user-input');
    userService.updateUser(
        UpdateUserInput.value,
        userUpdateStruct,
        function(error, response){
            clientOutput.innerHTML =    "Errors : " + JSON.stringify(error) + "</br>" +
                "Status : " + response.status + "</br>" +
                "Body : " + response.body;
            UpdateUserLoader.style.display = 'none';
        });
};

// Delete user example
var DeleteUserAnchor = document.getElementById('delete-user');
var DeleteUserLoader = document.getElementById('delete-user-loader');
DeleteUserAnchor.onclick = function(e){

    DeleteUserLoader.style.display = 'block';
    e.preventDefault();

    var DeleteUserInput = document.getElementById('delete-user-input');
    userService.deleteUser(
        DeleteUserInput.value,
        function(error, response){
            clientOutput.innerHTML =    "Errors : " + JSON.stringify(error) + "</br>" +
                "Status : " + response.status + "</br>" +
                "Body : " + response.body;
            DeleteUserLoader.style.display = 'none';
        });
};

// Assign user example
var AssignUserAnchor = document.getElementById('assign-user');
var AssignUserLoader = document.getElementById('assign-user-loader');
AssignUserAnchor.onclick = function(e){

    AssignUserLoader.style.display = 'block';
    e.preventDefault();

    var AssignUserInput = document.getElementById('assign-user-input');
    userService.assignUserToUserGroup(
        AssignUserInput.value,
        "/api/ezp/v2/user/groups/1/5/101",
        function(error, response){
            clientOutput.innerHTML =    "Errors : " + JSON.stringify(error) + "</br>" +
                "Status : " + response.status + "</br>" +
                "Body : " + response.body;
            AssignUserLoader.style.display = 'none';
        });
};

// unAssign user example
var unAssignUserAnchor = document.getElementById('unassign-user');
var unAssignUserLoader = document.getElementById('unassign-user-loader');
unAssignUserAnchor.onclick = function(e){

    unAssignUserLoader.style.display = 'block';
    e.preventDefault();

    var unAssignUserInput = document.getElementById('unassign-user-input');
    userService.unAssignUserFromUserGroup(
        unAssignUserInput.value,
        function(error, response){
            clientOutput.innerHTML =    "Errors : " + JSON.stringify(error) + "</br>" +
                "Status : " + response.status + "</br>" +
                "Body : " + response.body;
            unAssignUserLoader.style.display = 'none';
        });
};


// create Role example
var CreateRoleAnchor = document.getElementById('create-role');
var CreateRoleLoader = document.getElementById('create-role-loader');
CreateRoleAnchor.onclick = function(e){

    CreateRoleLoader.style.display = 'block';
    e.preventDefault();

    var createRoleStruct = userService.newRoleInputStruct(
        "random-role-id-" + Math.random()
    );

    userService.createRole(
        createRoleStruct,
        function(error, response){
            clientOutput.innerHTML =    "Errors : " + JSON.stringify(error) + "</br>" +
                "Status : " + response.status + "</br>" +
                "Body : " + response.body;
            CreateRoleLoader.style.display = 'none';
        });
};

// load Role example
var LoadRoleAnchor = document.getElementById('load-role');
var LoadRoleLoader = document.getElementById('load-role-loader');
LoadRoleAnchor.onclick = function(e){

    LoadRoleLoader.style.display = 'block';
    e.preventDefault();

    var LoadRoleInput = document.getElementById('load-role-input');
    userService.loadRole(
        LoadRoleInput.value,
        function(error, response){
            clientOutput.innerHTML =    "Errors : " + JSON.stringify(error) + "</br>" +
                "Status : " + response.status + "</br>" +
                "Body : " + response.body;
            LoadRoleLoader.style.display = 'none';
        });
};


// update Role example
var UpdateRoleAnchor = document.getElementById('update-role');
var UpdateRoleLoader = document.getElementById('update-role-loader');
UpdateRoleAnchor.onclick = function(e){

    UpdateRoleLoader.style.display = 'block';
    e.preventDefault();

    var roleUpdateStruct = userService.newRoleInputStruct(
        "random-role-id-" + Math.random()
    );

    var UpdateRoleInput = document.getElementById('update-role-input');
    userService.updateRole(
        UpdateRoleInput.value,
        roleUpdateStruct,
        function(error, response){
            clientOutput.innerHTML =    "Errors : " + JSON.stringify(error) + "</br>" +
                "Status : " + response.status + "</br>" +
                "Body : " + response.body;
            UpdateRoleLoader.style.display = 'none';
        });
};


// Delete Role example
var DeleteRoleAnchor = document.getElementById('delete-role');
var DeleteRoleLoader = document.getElementById('delete-role-loader');
DeleteRoleAnchor.onclick = function(e){

    DeleteRoleLoader.style.display = 'block';
    e.preventDefault();

    var DeleteRoleInput = document.getElementById('delete-role-input');
    userService.deleteRole(
        DeleteRoleInput.value,
        function(error, response){
            clientOutput.innerHTML =    "Errors : " + JSON.stringify(error) + "</br>" +
                "Status : " + response.status + "</br>" +
                "Body : " + response.body;
            DeleteRoleLoader.style.display = 'none';
        });
};


// Get User Assignments example
var GetUserAssignmentsAnchor = document.getElementById('get-user-assignments');
var GetUserAssignmentsLoader = document.getElementById('get-user-assignments-loader');
GetUserAssignmentsAnchor.onclick = function(e){

    GetUserAssignmentsLoader.style.display = 'block';
    e.preventDefault();

    var GetUserAssignmentsInput = document.getElementById('get-user-assignments-input');
    userService.getRoleAssignmentsForUser(
        GetUserAssignmentsInput.value,
        function(error, response){
            clientOutput.innerHTML =    "Errors : " + JSON.stringify(error) + "</br>" +
                "Status : " + response.status + "</br>" +
                "Body : " + response.body;
            GetUserAssignmentsLoader.style.display = 'none';
        });
};

// Get User Group Assignments example
var GetUserGroupAssignmentsAnchor = document.getElementById('get-user-group-assignments');
var GetUserGroupAssignmentsLoader = document.getElementById('get-user-group-assignments-loader');
GetUserGroupAssignmentsAnchor.onclick = function(e){

    GetUserGroupAssignmentsLoader.style.display = 'block';
    e.preventDefault();

    var GetUserGroupAssignmentsInput = document.getElementById('get-user-group-assignments-input');
    userService.getRoleAssignmentsForUserGroup(
        GetUserGroupAssignmentsInput.value,
        function(error, response){
            clientOutput.innerHTML =    "Errors : " + JSON.stringify(error) + "</br>" +
                "Status : " + response.status + "</br>" +
                "Body : " + response.body;
            GetUserGroupAssignmentsLoader.style.display = 'none';
        });
};