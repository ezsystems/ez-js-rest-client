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
        "/api/ezp/v2/user/groups/1/5/110",
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
        "johndoe4",
        "johndoe4@nowhere.no",
        "johndoepass4",
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

// Get user list example
var GetRoleAssignmentsAnchor = document.getElementById('get-role-assignments');
var GetRoleAssignmentsLoader = document.getElementById('get-role-assignments-loader');
GetRoleAssignmentsAnchor.onclick = function(e){

    GetRoleAssignmentsLoader.style.display = 'block';
    e.preventDefault();

    var GetRoleAssignmentsInput = document.getElementById('get-role-assignments-input');
    userService.getRoleAssignments(
        "/api/ezp/v2/user/users",
        GetRoleAssignmentsInput.value,
        function(error, response){
            clientOutput.innerHTML =    "Errors : " + JSON.stringify(error) + "</br>" +
                "Status : " + response.status + "</br>" +
                "Body : " + response.body;
            GetRoleAssignmentsLoader.style.display = 'none';
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
        "/api/ezp/v2/user/groups/1/5/13",
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


// assign Role to a user example
var AssignRoleToUserAnchor = document.getElementById('assign-role-to-user');
var AssignRoleToUserLoader = document.getElementById('assign-role-to-user-loader');
AssignRoleToUserAnchor.onclick = function(e){

    AssignRoleToUserLoader.style.display = 'block';
    e.preventDefault();

    var roleAssignCreateStruct = userService.newRoleAssignInputStruct(
        {
            "_href" : "/api/ezp/v2/user/roles/7",
            "_media-type" : "application/vnd.ez.api.RoleAssignInput+json"
        },
        {
            "_identifier" : "Section",
            "values" : {
                "ref" : [
                    {
                        "_href" : "/api/ezp/v2/content/sections/1",
                        "_media-type" : "application/vnd.ez.api.Section+json"
                    },
                    {
                        "_href" : "/api/ezp/v2/content/sections/4",
                        "_media-type" : "application/vnd.ez.api.Section+json"
                    }
                ]
            }
        }

    );

    var AssignRoleToUserInput = document.getElementById('assign-role-to-user-input');
    userService.assignRoleToUser(
        AssignRoleToUserInput.value,
        roleAssignCreateStruct,
        function(error, response){
            clientOutput.innerHTML =    "Errors : " + JSON.stringify(error) + "</br>" +
                "Status : " + response.status + "</br>" +
                "Body : " + response.body;
            AssignRoleToUserLoader.style.display = 'none';
        });
};


// assign Role to a User Group example
var AssignRoleToUserGroupAnchor = document.getElementById('assign-role-to-user-group');
var AssignRoleToUserGroupLoader = document.getElementById('assign-role-to-user-group-loader');
AssignRoleToUserGroupAnchor.onclick = function(e){

    AssignRoleToUserGroupLoader.style.display = 'block';
    e.preventDefault();

    var roleAssignCreateStruct = userService.newRoleAssignInputStruct(
        {
            "_href" : "/api/ezp/v2/user/roles/7",
            "_media-type" : "application/vnd.ez.api.RoleAssignInput+json"
        },
        {
            "_identifier" : "Section",
            "values" : {
                "ref" : [
                    {
                        "_href" : "/api/ezp/v2/content/sections/1",
                        "_media-type" : "application/vnd.ez.api.Section+json"
                    },
                    {
                        "_href" : "/api/ezp/v2/content/sections/4",
                        "_media-type" : "application/vnd.ez.api.Section+json"
                    }
                ]
            }
        }

    );

    var AssignRoleToUserGroupInput = document.getElementById('assign-role-to-user-group-input');
    userService.assignRoleToUserGroup(
        AssignRoleToUserGroupInput.value,
        roleAssignCreateStruct,
        function(error, response){
            clientOutput.innerHTML =    "Errors : " + JSON.stringify(error) + "</br>" +
                "Status : " + response.status + "</br>" +
                "Body : " + response.body;
            AssignRoleToUserGroupLoader.style.display = 'none';
        });
};


// unassign Role from a User example
var UnassignRoleFromUserAnchor = document.getElementById('unassign-role-from-user');
var UnassignRoleFromUserLoader = document.getElementById('unassign-role-from-user-loader');
UnassignRoleFromUserAnchor.onclick = function(e){

    UnassignRoleFromUserLoader.style.display = 'block';
    e.preventDefault();

    var UnassignRoleFromUserInput = document.getElementById('unassign-role-from-user-input');
    userService.unassignRoleFromUser(
        UnassignRoleFromUserInput.value,
        function(error, response){
            clientOutput.innerHTML =    "Errors : " + JSON.stringify(error) + "</br>" +
                "Status : " + response.status + "</br>" +
                "Body : " + response.body;
            UnassignRoleFromUserLoader.style.display = 'none';
        });
};

// unassign Role from a User Group example
var UnassignRoleFromUserGroupAnchor = document.getElementById('unassign-role-from-user-group');
var UnassignRoleFromUserGroupLoader = document.getElementById('unassign-role-from-user-group-loader');
UnassignRoleFromUserGroupAnchor.onclick = function(e){

    UnassignRoleFromUserGroupLoader.style.display = 'block';
    e.preventDefault();

    var UnassignRoleFromUserGroupInput = document.getElementById('unassign-role-from-user-group-input');
    userService.unassignRoleFromUserGroup(
        UnassignRoleFromUserGroupInput.value,
        function(error, response){
            clientOutput.innerHTML =    "Errors : " + JSON.stringify(error) + "</br>" +
                "Status : " + response.status + "</br>" +
                "Body : " + response.body;
            UnassignRoleFromUserGroupLoader.style.display = 'none';
        });
};


// Add policy to the role example
var AddPolicyAnchor = document.getElementById('create-policy');
var AddPolicyLoader = document.getElementById('create-policy-loader');
AddPolicyAnchor.onclick = function(e){

    AddPolicyLoader.style.display = 'block';
    e.preventDefault();

    var policyCreateStruct = userService.newPolicyCreateStruct(
        "content",
        "publish",
        [
//            {
//                "_identifier" : "Class",
//                "values" : {
//                    "ref" : [
//                        {
//                            "_href" : "/api/ezp/v2/content/types/18"
//                        }
//                    ]
//                }
//            }
        ]
    );

// TODO: what's up with limitations?
// REST returns:    "limitations":{"limitation":[{"_identifier":"Class","values":{"ref":[{"_media-type":"application\/vnd.ez.api.ref+json","_href":"18"}]}}]}}}

    var AddPolicyInput = document.getElementById('create-policy-input');
    userService.addPolicy(
        AddPolicyInput.value,
        policyCreateStruct,
        function(error, response){
            clientOutput.innerHTML =    "Errors : " + JSON.stringify(error) + "</br>" +
                "Status : " + response.status + "</br>" +
                "Body : " + response.body;
            AddPolicyLoader.style.display = 'none';
        });
};

// Update policy example
var UpdatePolicyAnchor = document.getElementById('update-policy');
var UpdatePolicyLoader = document.getElementById('update-policy-loader');
UpdatePolicyAnchor.onclick = function(e){

    UpdatePolicyLoader.style.display = 'block';
    e.preventDefault();

    var policyCreateStruct = userService.newPolicyUpdateStruct(
        [
            {
                "_identifier" : "Section",
                "values" : {
                    "ref" : [
                        {
                            "_href" : "/api/ezp/v2/content/sections/1",
                            "_media-type" : "application/vnd.ez.api.Section+json"
                        },
                        {
                            "_href" : "/api/ezp/v2/content/sections/4",
                            "_media-type" : "application/vnd.ez.api.Section+json"
                        }
                    ]
                }
            }
        ]
    );

    var UpdatePolicyInput = document.getElementById('update-policy-input');
    userService.updatePolicy(
        UpdatePolicyInput.value,
        policyCreateStruct,
        function(error, response){
            clientOutput.innerHTML =    "Errors : " + JSON.stringify(error) + "</br>" +
                "Status : " + response.status + "</br>" +
                "Body : " + response.body;
            UpdatePolicyLoader.style.display = 'none';
        });
};

// Load policy example
var LoadPolicyAnchor = document.getElementById('load-policy');
var LoadPolicyLoader = document.getElementById('load-policy-loader');
LoadPolicyAnchor.onclick = function(e){

    LoadPolicyLoader.style.display = 'block';
    e.preventDefault();

    var LoadPolicyInput = document.getElementById('load-policy-input');
    userService.loadPolicy(
        LoadPolicyInput.value,
        function(error, response){
            clientOutput.innerHTML =    "Errors : " + JSON.stringify(error) + "</br>" +
                "Status : " + response.status + "</br>" +
                "Body : " + response.body;
            LoadPolicyLoader.style.display = 'none';
        });
};

// Delete policy example
var DeletePolicyAnchor = document.getElementById('delete-policy');
var DeletePolicyLoader = document.getElementById('delete-policy-loader');
DeletePolicyAnchor.onclick = function(e){

    DeletePolicyLoader.style.display = 'block';
    e.preventDefault();

    var DeletePolicyInput = document.getElementById('delete-policy-input');
    userService.deletePolicy(
        DeletePolicyInput.value,
        function(error, response){
            clientOutput.innerHTML =    "Errors : " + JSON.stringify(error) + "</br>" +
                "Status : " + response.status + "</br>" +
                "Body : " + response.body;
            DeletePolicyLoader.style.display = 'none';
        });
};

// Get policies by userId example
var LoadUserPoliciesAnchor = document.getElementById('load-user-policies');
var LoadUserPoliciesLoader = document.getElementById('load-user-policies-loader');
LoadUserPoliciesAnchor.onclick = function(e){

    LoadUserPoliciesLoader.style.display = 'block';
    e.preventDefault();

    var LoadUserPoliciesInput = document.getElementById('load-user-policies-input');
    userService.loadPoliciesByUserId(
        "/api/ezp/v2/user/policies",
        LoadUserPoliciesInput.value,
        function(error, response){
            clientOutput.innerHTML =    "Errors : " + JSON.stringify(error) + "</br>" +
                "Status : " + response.status + "</br>" +
                "Body : " + response.body;
            LoadUserPoliciesLoader.style.display = 'none';
        });
};
