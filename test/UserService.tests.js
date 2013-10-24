define(function (require) {

    // Declaring dependencies
    var UserService = require("services/UserService"),
        CAPIError = require("structures/CAPIError"),

        SessionCreateStruct = require('structures/SessionCreateStruct'),
        UserCreateStruct = require('structures/UserCreateStruct'),
        UserUpdateStruct = require('structures/UserUpdateStruct'),
        UserGroupCreateStruct = require('structures/UserGroupCreateStruct'),
        UserGroupUpdateStruct = require('structures/UserGroupUpdateStruct'),
        PolicyCreateStruct = require('structures/PolicyCreateStruct'),
        PolicyUpdateStruct = require('structures/PolicyUpdateStruct'),
        RoleInputStruct = require('structures/RoleInputStruct'),
        RoleAssignInputStruct = require('structures/RoleAssignInputStruct');

    describe("User Service", function () {

        var mockConnectionManager,
            mockDiscoveryService,
            mockFaultyDiscoveryService,
            mockCallback,
            userService,
            testRootUserGroup = "/api/ezp/v2/user/groups/1/5",
            testRoles = "/api/ezp/v2/user/roles",
            testUserGroupId = "/api/ezp/v2/user/groups/1/5/119",
            testAnotherUserGroupId = "/api/ezp/v2/user/groups/1/5/120",
            testUserGroupSubgroups = "/api/ezp/v2/user/groups/1/5/119/subgroups",
            testUserGroups = "/api/ezp/v2/user/groups",
            testRemoteId = "f5c88a2209584891056f987fd965b0ba",
            testUserGroupUsers = "/api/ezp/v2/user/groups/1/5/119/users",
            testUserGroupRoles = "/api/ezp/v2/user/groups/1/5/119/roles",
            testUserId = "/api/ezp/v2/user/users/144",
            testUserUserGroups = "/api/ezp/v2/user/users/144/groups",
            testUserRoles = "/api/ezp/v2/user/users/144/roles",
            testUserRoleId = "/api/ezp/v2/user/users/110/roles/7",
            testUserGroupRoleId = "/api/ezp/v2/user/groups/1/5/110/roles/7",
            testUserAssignedGroupId = "/api/ezp/v2/user/users/146/groups/1",
            testRoleId = "/api/ezp/v2/user/roles/7",
            testRoleIdentifier = "someRole",
            testUserAssignmentId = "/api/ezp/v2/user/13/roles/7",
            testUserGroupAssignmentId = "/api/ezp/v2/user/groups/1/5/110/roles/7",
            testRolePolicies = "/api/ezp/v2/user/roles/7/policies",
            testPolicyId = "/api/ezp/v2/user/roles/7/policies/1",
            testPolicies = "/api/ezp/v2/user/policies",
            testSessions = "/api/ezp/v2/user/sessions",
            testSessionId = "/api/ezp/v2/user/sessions/o7i8r1sapfc9r84ae53bgq8gp4",
            testLogin = "login",
            testPass = "pass",

            testOffset = 0,
            testLimit = -1,
            testStructure,
            testLanguage = "eng_US",
            testArray = ["one", "two", "three"],
            testEmail = "something@somewhere.com",
            testLimitation = {},
            testModule = "content",
            testFunction = "edit";

        beforeEach(function (){

            mockConnectionManager = jasmine.createSpyObj('mockConnectionManager', ['request', 'delete', 'notAuthorizedRequest', 'logOut']);
            mockCallback = jasmine.createSpy('mockCallback');

        });


    // ******************************
    // Cases without errors
    // ******************************
        describe("is calling injected objects with right arguments while running calls", function () {

            // ******************************
            // Faked internal service calls
            // ******************************
            var fakedLoadUserGroup = function(userGroupId, callback){
                    var mockUserGroupResponse = {};
                    mockUserGroupResponse.document = {
                        "UserGroup" : {
                            "_href" : testUserGroupId,
                            "_media-type" : "application/vnd.ez.api.UserGroup+json",
                            Subgroups : {
                                "_href" : testUserGroupSubgroups,
                                "_media-type" : "application/vnd.ez.api.UserGroupList+json"
                            },
                            Users : {
                                "_href" : testUserGroupUsers,
                                "_media-type" : "application/vnd.ez.api.UserList+json"
                            },
                            Roles : {
                                "_href" : testUserGroupRoles,
                                "_media-type" : "application/vnd.ez.api.RoleAssignmentList+json"
                            }

                        }
                    };
                    callback(false, mockUserGroupResponse);
                },
                fakedLoadUser = function(userId, callback){
                    var mockUserResponse = {};
                    mockUserResponse.document = {
                        "User" : {
                            "_href" : testUserId,
                            "_media-type" : "application/vnd.ez.api.User+json",
                            UserGroups : {
                                "_href" : testUserUserGroups,
                                "_media-type" : "application/vnd.ez.api.UserGroupList+json"
                            },
                            Roles : {
                                "_href" : testUserRoles,
                                "_media-type" : "application/vnd.ez.api.RoleAssignmentList+json"
                            }
                        }
                    };
                    callback(false, mockUserResponse);
                },
                fakedLoadRole = function(roleId, callback){
                    var mockRoleResponse = {};
                    mockRoleResponse.document = {
                        "Role" : {
                            "_href" : testRoleId,
                            "_media-type" : "application/vnd.ez.api.Role+json",
                            Policies : {
                                "_href" : testRolePolicies,
                                "_media-type" : "application/vnd.ez.api.PolicyList+json"
                            }
                        }
                    };
                    callback(false, mockRoleResponse);
                };

            // ******************************
            // beforeEach for positive cases
            // ******************************
            beforeEach(function (){

                mockDiscoveryService = {
                    getInfoObject : function(name, callback){

                        if (name === "rootUserGroup"){
                            callback(
                                false,
                                {
                                    "_href" : testRootUserGroup,
                                    "_media-type" : "application/vnd.ez.api.UserGroup+json"
                                }
                            );
                        }

                        if (name === "roles"){
                            callback(
                                false,
                                {
                                    "_href" : testRoles,
                                    "_media-type" : "application/vnd.ez.api.RoleList+json"
                                }
                            );
                        }

                    }
                }

                spyOn(mockDiscoveryService, 'getInfoObject').andCallThrough();

                userService = new UserService(mockConnectionManager, mockDiscoveryService);

            });

            // ******************************
            // User groups management
            // ******************************

            it("loadRootUserGroup", function () {
                userService.loadRootUserGroup(
                    mockCallback
                );

                expect(mockDiscoveryService.getInfoObject).toHaveBeenCalled();
                expect(mockDiscoveryService.getInfoObject.mostRecentCall.args[0]).toEqual("rootUserGroup"); //name
                expect(mockDiscoveryService.getInfoObject.mostRecentCall.args[1]).toEqual(jasmine.any(Function)); //callback

                expect(mockConnectionManager.request).toHaveBeenCalled();
                expect(mockConnectionManager.request.mostRecentCall.args[0]).toEqual("GET"); //method
                expect(mockConnectionManager.request.mostRecentCall.args[1]).toEqual(testRootUserGroup); //url
                expect(mockConnectionManager.request.mostRecentCall.args[2]).toEqual(""); // body
                expect(mockConnectionManager.request.mostRecentCall.args[3].Accept).toEqual("application/vnd.ez.api.UserGroup+json"); // headers
                expect(mockConnectionManager.request.mostRecentCall.args[4]).toBe(mockCallback); // callback
            });

            it("loadUserGroup", function () {
                userService.loadUserGroup(
                    testUserGroupId,
                    mockCallback
                );

                expect(mockConnectionManager.request).toHaveBeenCalled();
                expect(mockConnectionManager.request.mostRecentCall.args[0]).toEqual("GET"); //method
                expect(mockConnectionManager.request.mostRecentCall.args[1]).toEqual(testUserGroupId); //url
                expect(mockConnectionManager.request.mostRecentCall.args[2]).toEqual(""); // body
                expect(mockConnectionManager.request.mostRecentCall.args[3].Accept).toEqual("application/vnd.ez.api.UserGroup+json"); // headers
                expect(mockConnectionManager.request.mostRecentCall.args[4]).toBe(mockCallback); // callback
            });

            it("loadUserGroupByRemoteId", function () {
                userService.loadUserGroupByRemoteId(
                    testUserGroups,
                    testRemoteId,
                    mockCallback
                );

                expect(mockConnectionManager.request).toHaveBeenCalled();
                expect(mockConnectionManager.request.mostRecentCall.args[0]).toEqual("GET"); //method
                expect(mockConnectionManager.request.mostRecentCall.args[1]).toEqual(testUserGroups + "?remoteId=" + testRemoteId); //url
                expect(mockConnectionManager.request.mostRecentCall.args[2]).toEqual(""); // body
                expect(mockConnectionManager.request.mostRecentCall.args[3].Accept).toEqual("application/vnd.ez.api.UserGroupList+json"); // headers
                expect(mockConnectionManager.request.mostRecentCall.args[4]).toBe(mockCallback); // callback
            });

            it("deleteUserGroup", function () {
                userService.deleteUserGroup(
                    testUserGroupId,
                    mockCallback
                );

                expect(mockConnectionManager.delete).toHaveBeenCalled();
                expect(mockConnectionManager.delete.mostRecentCall.args[0]).toEqual(testUserGroupId); //url
                expect(mockConnectionManager.delete.mostRecentCall.args[1]).toBe(mockCallback); // callback
            });

            it("moveUserGroup", function () {
                userService.moveUserGroup(
                    testUserGroupId,
                    testAnotherUserGroupId,
                    mockCallback
                );

                expect(mockConnectionManager.request).toHaveBeenCalled();
                expect(mockConnectionManager.request.mostRecentCall.args[0]).toEqual("MOVE"); //method
                expect(mockConnectionManager.request.mostRecentCall.args[1]).toEqual(testUserGroupId); //url
                expect(mockConnectionManager.request.mostRecentCall.args[2]).toEqual(""); // body
                expect(mockConnectionManager.request.mostRecentCall.args[3].Destination).toEqual(testAnotherUserGroupId); // headers
                expect(mockConnectionManager.request.mostRecentCall.args[4]).toBe(mockCallback); // callback
            });

            it("createUserGroup", function () {

                spyOn(userService, 'loadUserGroup').andCallFake(fakedLoadUserGroup);

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

                userService.createUserGroup(
                    testRootUserGroup,
                    userGroupCreateStruct,
                    mockCallback
                );

                expect(mockConnectionManager.request).toHaveBeenCalled();
                expect(mockConnectionManager.request.mostRecentCall.args[0]).toEqual("POST"); //method
                expect(mockConnectionManager.request.mostRecentCall.args[1]).toEqual(testUserGroupSubgroups); //url
                expect(mockConnectionManager.request.mostRecentCall.args[2]).toEqual(JSON.stringify(userGroupCreateStruct.body)); // body
                expect(mockConnectionManager.request.mostRecentCall.args[3]).toEqual(userGroupCreateStruct.headers); // headers
                expect(mockConnectionManager.request.mostRecentCall.args[4]).toBe(mockCallback); // callback
            });

            it("updateUserGroup", function () {

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

                userService.updateUserGroup(
                    testUserGroupId,
                    userGroupUpdateStruct,
                    mockCallback
                );

                expect(mockConnectionManager.request).toHaveBeenCalled();
                expect(mockConnectionManager.request.mostRecentCall.args[0]).toEqual("PATCH"); //method
                expect(mockConnectionManager.request.mostRecentCall.args[1]).toEqual(testUserGroupId); //url
                expect(mockConnectionManager.request.mostRecentCall.args[2]).toEqual(JSON.stringify(userGroupUpdateStruct.body)); // body
                expect(mockConnectionManager.request.mostRecentCall.args[3]).toEqual(userGroupUpdateStruct.headers); // headers
                expect(mockConnectionManager.request.mostRecentCall.args[4]).toBe(mockCallback); // callback
            });

            it("loadSubUserGroups", function () {

                spyOn(userService, 'loadUserGroup').andCallFake(fakedLoadUserGroup);

                userService.loadSubUserGroups(
                    testUserGroupId,
                    mockCallback
                );

                expect(mockConnectionManager.request).toHaveBeenCalled();
                expect(mockConnectionManager.request.mostRecentCall.args[0]).toEqual("GET"); //method
                expect(mockConnectionManager.request.mostRecentCall.args[1]).toEqual(testUserGroupSubgroups); //url
                expect(mockConnectionManager.request.mostRecentCall.args[2]).toEqual(""); // body
                expect(mockConnectionManager.request.mostRecentCall.args[3].Accept).toEqual("application/vnd.ez.api.UserGroupList+json"); // headers
                expect(mockConnectionManager.request.mostRecentCall.args[4]).toBe(mockCallback); // callback
            });

            it("loadUsersOfUserGroup", function () {

                spyOn(userService, 'loadUserGroup').andCallFake(fakedLoadUserGroup);

                userService.loadUsersOfUserGroup(
                    testUserGroupId,
                    mockCallback
                );

                expect(mockConnectionManager.request).toHaveBeenCalled();
                expect(mockConnectionManager.request.mostRecentCall.args[0]).toEqual("GET"); //method
                expect(mockConnectionManager.request.mostRecentCall.args[1]).toEqual(testUserGroupUsers); //url
                expect(mockConnectionManager.request.mostRecentCall.args[2]).toEqual(""); // body
                expect(mockConnectionManager.request.mostRecentCall.args[3].Accept).toEqual("application/vnd.ez.api.UserList+json"); // headers
                expect(mockConnectionManager.request.mostRecentCall.args[4]).toBe(mockCallback); // callback
            });

            it("loadUserGroupsOfUser", function () {

                userService.loadUserGroupsOfUser(
                    testUserId,
                    mockCallback
                );

                expect(mockConnectionManager.request).toHaveBeenCalled();
                expect(mockConnectionManager.request.mostRecentCall.args[0]).toEqual("GET"); //method
                expect(mockConnectionManager.request.mostRecentCall.args[1]).toEqual(testUserId + "/groups"); //url
                expect(mockConnectionManager.request.mostRecentCall.args[2]).toEqual(""); // body
                expect(mockConnectionManager.request.mostRecentCall.args[3].Accept).toEqual("application/vnd.ez.api.UserGroupRefList+json"); // headers
                expect(mockConnectionManager.request.mostRecentCall.args[4]).toBe(mockCallback); // callback
            });

            // ******************************
            // Users management
            // ******************************

            it("createUser", function () {

                spyOn(userService, 'loadUserGroup').andCallFake(fakedLoadUserGroup);

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

                userService.createUser(
                    testUserGroupId,
                    userCreateStruct,
                    mockCallback
                );

                expect(mockConnectionManager.request).toHaveBeenCalled();
                expect(mockConnectionManager.request.mostRecentCall.args[0]).toEqual("POST"); //method
                expect(mockConnectionManager.request.mostRecentCall.args[1]).toEqual(testUserGroupUsers); //url
                expect(mockConnectionManager.request.mostRecentCall.args[2]).toEqual(JSON.stringify(userCreateStruct.body)); // body
                expect(mockConnectionManager.request.mostRecentCall.args[3]).toEqual(userCreateStruct.headers); // headers
                expect(mockConnectionManager.request.mostRecentCall.args[4]).toBe(mockCallback); // callback
            });

            it("getRoleAssignments", function () {

                userService.getRoleAssignments(
                    testUserGroups,
                    testRoleId,
                    mockCallback
                );

                expect(mockConnectionManager.request).toHaveBeenCalled();
                expect(mockConnectionManager.request.mostRecentCall.args[0]).toEqual("GET"); //method
                expect(mockConnectionManager.request.mostRecentCall.args[1]).toEqual(testUserGroups + "?roleId=" + testRoleId); //url
                expect(mockConnectionManager.request.mostRecentCall.args[2]).toEqual(""); // body
                expect(mockConnectionManager.request.mostRecentCall.args[3].Accept).toEqual("application/vnd.ez.api.UserList+json"); // headers
                expect(mockConnectionManager.request.mostRecentCall.args[4]).toBe(mockCallback); // callback
            });

            it("loadUser", function () {

                userService.loadUser(
                    testUserId,
                    mockCallback
                );

                expect(mockConnectionManager.request).toHaveBeenCalled();
                expect(mockConnectionManager.request.mostRecentCall.args[0]).toEqual("GET"); //method
                expect(mockConnectionManager.request.mostRecentCall.args[1]).toEqual(testUserId); //url
                expect(mockConnectionManager.request.mostRecentCall.args[2]).toEqual(""); // body
                expect(mockConnectionManager.request.mostRecentCall.args[3].Accept).toEqual("application/vnd.ez.api.User+json"); // headers
                expect(mockConnectionManager.request.mostRecentCall.args[4]).toBe(mockCallback); // callback
            });

            it("updateUserGroup", function () {

                var userUpdateStruct = userService.newUserUpdateStruct();
                userUpdateStruct.body.UserUpdate.email = "somenewemail@nowhere.no";

                userService.updateUser(
                    testUserId,
                    userUpdateStruct,
                    mockCallback
                );

                expect(mockConnectionManager.request).toHaveBeenCalled();
                expect(mockConnectionManager.request.mostRecentCall.args[0]).toEqual("PATCH"); //method
                expect(mockConnectionManager.request.mostRecentCall.args[1]).toEqual(testUserId); //url
                expect(mockConnectionManager.request.mostRecentCall.args[2]).toEqual(JSON.stringify(userUpdateStruct.body)); // body
                expect(mockConnectionManager.request.mostRecentCall.args[3]).toEqual(userUpdateStruct.headers); // headers
                expect(mockConnectionManager.request.mostRecentCall.args[4]).toBe(mockCallback); // callback
            });

            it("deleteUser", function () {
                userService.deleteUser(
                    testUserId,
                    mockCallback
                );

                expect(mockConnectionManager.delete).toHaveBeenCalled();
                expect(mockConnectionManager.delete.mostRecentCall.args[0]).toEqual(testUserId); //url
                expect(mockConnectionManager.delete.mostRecentCall.args[1]).toBe(mockCallback); // callback
            });

            // ******************************
            // Users and groups relation management
            // ******************************

            it("assignUserToUserGroup", function () {

                spyOn(userService, 'loadUser').andCallFake(fakedLoadUser);

                userService.assignUserToUserGroup(
                    testUserId,
                    testUserGroupId,
                    mockCallback
                );

                expect(mockConnectionManager.request).toHaveBeenCalled();
                expect(mockConnectionManager.request.mostRecentCall.args[0]).toEqual("POST"); //method
                expect(mockConnectionManager.request.mostRecentCall.args[1]).toEqual(testUserUserGroups + "?group=" + testUserGroupId); //url
                expect(mockConnectionManager.request.mostRecentCall.args[2]).toEqual(""); // body
                expect(mockConnectionManager.request.mostRecentCall.args[3].Accept).toEqual("application/vnd.ez.api.UserGroupList+json"); // headers
                expect(mockConnectionManager.request.mostRecentCall.args[4]).toBe(mockCallback); // callback
            });

            it("unassignUserFromUserGroup", function () {
                userService.unassignUserFromUserGroup(
                    testUserAssignedGroupId,
                    mockCallback
                );

                expect(mockConnectionManager.delete).toHaveBeenCalled();
                expect(mockConnectionManager.delete.mostRecentCall.args[0]).toEqual(testUserAssignedGroupId); //url
                expect(mockConnectionManager.delete.mostRecentCall.args[1]).toBe(mockCallback); // callback
            });

            // ******************************
            // Roles management
            // ******************************
            it("createRole", function () {

                var roleCreateStruct = userService.newRoleInputStruct(
                    "random-role-id-" + Math.random()
                );

                userService.createRole(
                    roleCreateStruct,
                    mockCallback
                );

                expect(mockDiscoveryService.getInfoObject).toHaveBeenCalled();
                expect(mockDiscoveryService.getInfoObject.mostRecentCall.args[0]).toEqual("roles"); //name
                expect(mockDiscoveryService.getInfoObject.mostRecentCall.args[1]).toEqual(jasmine.any(Function)); //callback

                expect(mockConnectionManager.request).toHaveBeenCalled();
                expect(mockConnectionManager.request.mostRecentCall.args[0]).toEqual("POST"); //method
                expect(mockConnectionManager.request.mostRecentCall.args[1]).toEqual(testRoles); //url
                expect(mockConnectionManager.request.mostRecentCall.args[2]).toEqual(JSON.stringify(roleCreateStruct.body)); // body
                expect(mockConnectionManager.request.mostRecentCall.args[3]).toEqual(roleCreateStruct.headers); // headers
                expect(mockConnectionManager.request.mostRecentCall.args[4]).toBe(mockCallback); // callback
            });

            it("loadRole", function () {

                userService.loadRole(
                    testRoleId,
                    mockCallback
                );

                expect(mockConnectionManager.request).toHaveBeenCalled();
                expect(mockConnectionManager.request.mostRecentCall.args[0]).toEqual("GET"); //method
                expect(mockConnectionManager.request.mostRecentCall.args[1]).toEqual(testRoleId); //url
                expect(mockConnectionManager.request.mostRecentCall.args[2]).toEqual(""); // body
                expect(mockConnectionManager.request.mostRecentCall.args[3].Accept).toEqual("application/vnd.ez.api.Role+json"); // headers
                expect(mockConnectionManager.request.mostRecentCall.args[4]).toBe(mockCallback); // callback
            });

            it("loadRoles", function () {

                userService.loadRoles(
                    testRoleIdentifier,
                    testOffset,
                    testLimit,
                    mockCallback
                );

                expect(mockDiscoveryService.getInfoObject).toHaveBeenCalled();
                expect(mockDiscoveryService.getInfoObject.mostRecentCall.args[0]).toEqual("roles"); //name
                expect(mockDiscoveryService.getInfoObject.mostRecentCall.args[1]).toEqual(jasmine.any(Function)); //callback

                expect(mockConnectionManager.request).toHaveBeenCalled();
                expect(mockConnectionManager.request.mostRecentCall.args[0]).toEqual("GET"); //method
                expect(mockConnectionManager.request.mostRecentCall.args[1]).toEqual(testRoles + '?offset=' + testOffset + '&limit=' + testLimit + '&identifier=' + testRoleIdentifier); //url
                expect(mockConnectionManager.request.mostRecentCall.args[2]).toEqual(""); // body
                expect(mockConnectionManager.request.mostRecentCall.args[3].Accept).toEqual("application/vnd.ez.api.RoleList+json"); // headers
                expect(mockConnectionManager.request.mostRecentCall.args[4]).toBe(mockCallback); // callback
            });

            it("loadRoles with minimum arguments set", function () {

                userService.loadRoles(
                    "",
                    undefined,
                    undefined,
                    mockCallback
                );

                expect(mockDiscoveryService.getInfoObject).toHaveBeenCalled();
                expect(mockDiscoveryService.getInfoObject.mostRecentCall.args[0]).toEqual("roles"); //name
                expect(mockDiscoveryService.getInfoObject.mostRecentCall.args[1]).toEqual(jasmine.any(Function)); //callback

                expect(mockConnectionManager.request).toHaveBeenCalled();
                expect(mockConnectionManager.request.mostRecentCall.args[0]).toEqual("GET"); //method
                expect(mockConnectionManager.request.mostRecentCall.args[1]).toEqual(testRoles + '?offset=' + testOffset + '&limit=' + testLimit); //url
                expect(mockConnectionManager.request.mostRecentCall.args[2]).toEqual(""); // body
                expect(mockConnectionManager.request.mostRecentCall.args[3].Accept).toEqual("application/vnd.ez.api.RoleList+json"); // headers
                expect(mockConnectionManager.request.mostRecentCall.args[4]).toBe(mockCallback); // callback
            });

            it("updateRole", function () {

                var roleUpdateStruct = userService.newRoleInputStruct(
                    "random-role-id-" + Math.random()
                );

                userService.updateRole(
                    testRoleId,
                    roleUpdateStruct,
                    mockCallback
                );

                expect(mockConnectionManager.request).toHaveBeenCalled();
                expect(mockConnectionManager.request.mostRecentCall.args[0]).toEqual("PATCH"); //method
                expect(mockConnectionManager.request.mostRecentCall.args[1]).toEqual(testRoleId); //url
                expect(mockConnectionManager.request.mostRecentCall.args[2]).toEqual(JSON.stringify(roleUpdateStruct.body)); // body
                expect(mockConnectionManager.request.mostRecentCall.args[3]).toEqual(roleUpdateStruct.headers); // headers
                expect(mockConnectionManager.request.mostRecentCall.args[4]).toBe(mockCallback); // callback
            });

            it("deleteRole", function () {
                userService.deleteRole(
                    testRoleId,
                    mockCallback
                );

                expect(mockConnectionManager.delete).toHaveBeenCalled();
                expect(mockConnectionManager.delete.mostRecentCall.args[0]).toEqual(testRoleId); //url
                expect(mockConnectionManager.delete.mostRecentCall.args[1]).toBe(mockCallback); // callback
            });

            // ******************************
            // Role assignments management
            // ******************************
            it("getRoleAssignmentsForUser", function () {

                spyOn(userService, 'loadUser').andCallFake(fakedLoadUser);

                userService.getRoleAssignmentsForUser(
                    testUserId,
                    mockCallback
                );

                expect(mockConnectionManager.request).toHaveBeenCalled();
                expect(mockConnectionManager.request.mostRecentCall.args[0]).toEqual("GET"); //method
                expect(mockConnectionManager.request.mostRecentCall.args[1]).toEqual(testUserRoles); //url
                expect(mockConnectionManager.request.mostRecentCall.args[2]).toEqual(""); // body
                expect(mockConnectionManager.request.mostRecentCall.args[3].Accept).toEqual("application/vnd.ez.api.RoleAssignmentList+json"); // headers
                expect(mockConnectionManager.request.mostRecentCall.args[4]).toBe(mockCallback); // callback
            });

            it("getRoleAssignmentsForUserGroup", function () {

                spyOn(userService, 'loadUserGroup').andCallFake(fakedLoadUserGroup);

                userService.getRoleAssignmentsForUserGroup(
                    testUserGroupId,
                    mockCallback
                );

                expect(mockConnectionManager.request).toHaveBeenCalled();
                expect(mockConnectionManager.request.mostRecentCall.args[0]).toEqual("GET"); //method
                expect(mockConnectionManager.request.mostRecentCall.args[1]).toEqual(testUserGroupRoles); //url
                expect(mockConnectionManager.request.mostRecentCall.args[2]).toEqual(""); // body
                expect(mockConnectionManager.request.mostRecentCall.args[3].Accept).toEqual("application/vnd.ez.api.RoleAssignmentList+json"); // headers
                expect(mockConnectionManager.request.mostRecentCall.args[4]).toBe(mockCallback); // callback
            });

            it("getUserAssignmentObject", function () {

                userService.getUserAssignmentObject(
                    testUserAssignmentId,
                    mockCallback
                );

                expect(mockConnectionManager.request).toHaveBeenCalled();
                expect(mockConnectionManager.request.mostRecentCall.args[0]).toEqual("GET"); //method
                expect(mockConnectionManager.request.mostRecentCall.args[1]).toEqual(testUserAssignmentId); //url
                expect(mockConnectionManager.request.mostRecentCall.args[2]).toEqual(""); // body
                expect(mockConnectionManager.request.mostRecentCall.args[3].Accept).toEqual("application/vnd.ez.api.RoleAssignment+json"); // headers
                expect(mockConnectionManager.request.mostRecentCall.args[4]).toBe(mockCallback); // callback
            });

            it("getUserGroupAssignmentObject", function () {

                userService.getUserGroupAssignmentObject(
                    testUserGroupAssignmentId,
                    mockCallback
                );

                expect(mockConnectionManager.request).toHaveBeenCalled();
                expect(mockConnectionManager.request.mostRecentCall.args[0]).toEqual("GET"); //method
                expect(mockConnectionManager.request.mostRecentCall.args[1]).toEqual(testUserGroupAssignmentId); //url
                expect(mockConnectionManager.request.mostRecentCall.args[2]).toEqual(""); // body
                expect(mockConnectionManager.request.mostRecentCall.args[3].Accept).toEqual("application/vnd.ez.api.RoleAssignment+json"); // headers
                expect(mockConnectionManager.request.mostRecentCall.args[4]).toBe(mockCallback); // callback
            });

            it("assignRoleToUser", function () {

                spyOn(userService, 'loadUser').andCallFake(fakedLoadUser);

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

                userService.assignRoleToUser(
                    testUserId,
                    roleAssignCreateStruct,
                    mockCallback
                );

                expect(mockConnectionManager.request).toHaveBeenCalled();
                expect(mockConnectionManager.request.mostRecentCall.args[0]).toEqual("POST"); //method
                expect(mockConnectionManager.request.mostRecentCall.args[1]).toEqual(testUserRoles); //url
                expect(mockConnectionManager.request.mostRecentCall.args[2]).toEqual(JSON.stringify(roleAssignCreateStruct.body)); // body
                expect(mockConnectionManager.request.mostRecentCall.args[3]).toEqual(roleAssignCreateStruct.headers); // headers
                expect(mockConnectionManager.request.mostRecentCall.args[4]).toBe(mockCallback); // callback
            });

            it("assignRoleToUserGroup", function () {

                spyOn(userService, 'loadUserGroup').andCallFake(fakedLoadUserGroup);

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

                userService.assignRoleToUserGroup(
                    testUserId,
                    roleAssignCreateStruct,
                    mockCallback
                );

                expect(mockConnectionManager.request).toHaveBeenCalled();
                expect(mockConnectionManager.request.mostRecentCall.args[0]).toEqual("POST"); //method
                expect(mockConnectionManager.request.mostRecentCall.args[1]).toEqual(testUserGroupRoles); //url
                expect(mockConnectionManager.request.mostRecentCall.args[2]).toEqual(JSON.stringify(roleAssignCreateStruct.body)); // body
                expect(mockConnectionManager.request.mostRecentCall.args[3]).toEqual(roleAssignCreateStruct.headers); // headers
                expect(mockConnectionManager.request.mostRecentCall.args[4]).toBe(mockCallback); // callback
            });

            it("unassignRoleFromUser", function () {
                userService.unassignRoleFromUser(
                    testUserRoleId,
                    mockCallback
                );

                expect(mockConnectionManager.delete).toHaveBeenCalled();
                expect(mockConnectionManager.delete.mostRecentCall.args[0]).toEqual(testUserRoleId); //url
                expect(mockConnectionManager.delete.mostRecentCall.args[1]).toBe(mockCallback); // callback
            });

            it("unassignRoleFromUserGroup", function () {
                userService.unassignRoleFromUserGroup(
                    testUserGroupRoleId,
                    mockCallback
                );

                expect(mockConnectionManager.delete).toHaveBeenCalled();
                expect(mockConnectionManager.delete.mostRecentCall.args[0]).toEqual(testUserGroupRoleId); //url
                expect(mockConnectionManager.delete.mostRecentCall.args[1]).toBe(mockCallback); // callback
            });

            // ******************************
            // Policies management
            // ******************************
            it("addPolicy", function () {

                spyOn(userService, 'loadRole').andCallFake(fakedLoadRole);

                var policyCreateStruct = userService.newPolicyCreateStruct(
                        "content",
                        "publish",
                        []
                    );

                userService.addPolicy(
                    testRoleId,
                    policyCreateStruct,
                    mockCallback
                );

                expect(mockConnectionManager.request).toHaveBeenCalled();
                expect(mockConnectionManager.request.mostRecentCall.args[0]).toEqual("POST"); //method
                expect(mockConnectionManager.request.mostRecentCall.args[1]).toEqual(testRolePolicies); //url
                expect(mockConnectionManager.request.mostRecentCall.args[2]).toEqual(JSON.stringify(policyCreateStruct.body)); // body
                expect(mockConnectionManager.request.mostRecentCall.args[3]).toEqual(policyCreateStruct.headers); // headers
                expect(mockConnectionManager.request.mostRecentCall.args[4]).toBe(mockCallback); // callback
            });

            it("loadPolicies", function () {

                spyOn(userService, 'loadRole').andCallFake(fakedLoadRole);

                userService.loadPolicies(
                    testRoleId,
                    mockCallback
                );

                expect(mockConnectionManager.request).toHaveBeenCalled();
                expect(mockConnectionManager.request.mostRecentCall.args[0]).toEqual("GET"); //method
                expect(mockConnectionManager.request.mostRecentCall.args[1]).toEqual(testRolePolicies); //url
                expect(mockConnectionManager.request.mostRecentCall.args[2]).toEqual(""); // body
                expect(mockConnectionManager.request.mostRecentCall.args[3].Accept).toEqual("application/vnd.ez.api.PolicyList+json"); // headers
                expect(mockConnectionManager.request.mostRecentCall.args[4]).toBe(mockCallback); // callback
            });

            it("loadPolicy", function () {

                userService.loadPolicy(
                    testPolicyId,
                    mockCallback
                );

                expect(mockConnectionManager.request).toHaveBeenCalled();
                expect(mockConnectionManager.request.mostRecentCall.args[0]).toEqual("GET"); //method
                expect(mockConnectionManager.request.mostRecentCall.args[1]).toEqual(testPolicyId); //url
                expect(mockConnectionManager.request.mostRecentCall.args[2]).toEqual(""); // body
                expect(mockConnectionManager.request.mostRecentCall.args[3].Accept).toEqual("application/vnd.ez.api.Policy+json"); // headers
                expect(mockConnectionManager.request.mostRecentCall.args[4]).toBe(mockCallback); // callback
            });

            it("updatePolicy", function () {

                var policyUpdateStruct = userService.newPolicyUpdateStruct(
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

                userService.updatePolicy(
                    testPolicyId,
                    policyUpdateStruct,
                    mockCallback
                );

                expect(mockConnectionManager.request).toHaveBeenCalled();
                expect(mockConnectionManager.request.mostRecentCall.args[0]).toEqual("PATCH"); //method
                expect(mockConnectionManager.request.mostRecentCall.args[1]).toEqual(testPolicyId); //url
                expect(mockConnectionManager.request.mostRecentCall.args[2]).toEqual(JSON.stringify(policyUpdateStruct.body)); // body
                expect(mockConnectionManager.request.mostRecentCall.args[3]).toEqual(policyUpdateStruct.headers); // headers
                expect(mockConnectionManager.request.mostRecentCall.args[4]).toBe(mockCallback); // callback
            });

            it("deletePolicy", function () {
                userService.deletePolicy(
                    testPolicyId,
                    mockCallback
                );

                expect(mockConnectionManager.delete).toHaveBeenCalled();
                expect(mockConnectionManager.delete.mostRecentCall.args[0]).toEqual(testPolicyId); //url
                expect(mockConnectionManager.delete.mostRecentCall.args[1]).toBe(mockCallback); // callback
            });

            it("loadPoliciesByUserId", function () {

                userService.loadPoliciesByUserId(
                    testPolicies,
                    testUserId,
                    mockCallback
                );

                expect(mockConnectionManager.request).toHaveBeenCalled();
                expect(mockConnectionManager.request.mostRecentCall.args[0]).toEqual("GET"); //method
                expect(mockConnectionManager.request.mostRecentCall.args[1]).toEqual(testPolicies + "?userId=" + testUserId); //url
                expect(mockConnectionManager.request.mostRecentCall.args[2]).toEqual(""); // body
                expect(mockConnectionManager.request.mostRecentCall.args[3].Accept).toEqual("application/vnd.ez.api.PolicyList+json"); // headers
                expect(mockConnectionManager.request.mostRecentCall.args[4]).toBe(mockCallback); // callback
            });

            // ******************************
            // Sessions management
            // ******************************
            it("createSession", function () {

                var sessionCreateStruct = userService.newSessionCreateStruct(
                    "admin",
                    "admin"
                );

                userService.createSession(
                    testSessions,
                    sessionCreateStruct,
                    mockCallback
                );

                expect(mockConnectionManager.notAuthorizedRequest).toHaveBeenCalled();
                expect(mockConnectionManager.notAuthorizedRequest.mostRecentCall.args[0]).toEqual("POST"); //method
                expect(mockConnectionManager.notAuthorizedRequest.mostRecentCall.args[1]).toEqual(testSessions); //url
                expect(mockConnectionManager.notAuthorizedRequest.mostRecentCall.args[2]).toEqual(JSON.stringify(sessionCreateStruct.body)); // body
                expect(mockConnectionManager.notAuthorizedRequest.mostRecentCall.args[3]).toEqual(sessionCreateStruct.headers); // headers
                expect(mockConnectionManager.notAuthorizedRequest.mostRecentCall.args[4]).toBe(mockCallback); // callback
            });

            it("deleteSession", function () {
                userService.deleteSession(
                    testSessionId,
                    mockCallback
                );

                expect(mockConnectionManager.delete).toHaveBeenCalled();
                expect(mockConnectionManager.delete.mostRecentCall.args[0]).toEqual(testSessionId); //url
                expect(mockConnectionManager.delete.mostRecentCall.args[1]).toBe(mockCallback); // callback
            });

            it("logOut", function () {
                userService.logOut(mockCallback);

                expect(mockConnectionManager.logOut).toHaveBeenCalled();
                expect(mockConnectionManager.logOut.mostRecentCall.args[0]).toBe(mockCallback); // callback
            });

            // ******************************
            // Structures
            // ******************************
            describe("creating structures", function () {

                it("newSessionCreateStruct", function(){

                    testStructure = userService.newSessionCreateStruct(
                        testLogin,
                        testPass
                    );

                    expect(testStructure).toEqual(jasmine.any(SessionCreateStruct));
                    expect(testStructure.body.SessionInput.login).toEqual(testLogin);
                    expect(testStructure.body.SessionInput.password).toEqual(testPass);
                });

                it("newUserGroupCreateStruct", function(){

                    testStructure = userService.newUserGroupCreateStruct(
                        testLanguage,
                        testArray
                    );

                    expect(testStructure).toEqual(jasmine.any(UserGroupCreateStruct));
                    expect(testStructure.body.UserGroupCreate.mainLanguageCode).toEqual(testLanguage);
                    expect(testStructure.body.UserGroupCreate.fields.field).toEqual(testArray);
                });

                it("newUserGroupUpdateStruct", function(){

                    testStructure = userService.newUserGroupUpdateStruct();

                    expect(testStructure).toEqual(jasmine.any(UserGroupUpdateStruct));
                });

                it("newUserCreateStruct", function(){

                    testStructure = userService.newUserCreateStruct(
                        testLanguage,
                        testLogin,
                        testEmail,
                        testPass,
                        testArray
                    );

                    expect(testStructure).toEqual(jasmine.any(UserCreateStruct));
                    expect(testStructure.body.UserCreate.mainLanguageCode).toEqual(testLanguage);
                    expect(testStructure.body.UserCreate.login).toEqual(testLogin);
                    expect(testStructure.body.UserCreate.email).toEqual(testEmail);
                    expect(testStructure.body.UserCreate.password).toEqual(testPass);
                    expect(testStructure.body.UserCreate.fields.field).toEqual(testArray);
                });

                it("newUserUpdateStruct", function(){

                    testStructure = userService.newUserUpdateStruct();

                    expect(testStructure).toEqual(jasmine.any(UserUpdateStruct));
                });

                it("newRoleInputStruct", function(){

                    testStructure = userService.newRoleInputStruct(
                        testRoleIdentifier
                    );

                    expect(testStructure).toEqual(jasmine.any(RoleInputStruct));
                    expect(testStructure.body.RoleInput.identifier).toEqual(testRoleIdentifier);
                });

                it("newRoleAssignInputStruct", function(){

                    testStructure = userService.newRoleAssignInputStruct(
                        testRoleId,
                        testLimitation
                    );

                    expect(testStructure).toEqual(jasmine.any(RoleAssignInputStruct));
                    expect(testStructure.body.RoleAssignInput.Role).toEqual(testRoleId);
                    expect(testStructure.body.RoleAssignInput.limitation).toEqual(testLimitation);
                });

                it("newPolicyCreateStruct", function(){

                    testStructure = userService.newPolicyCreateStruct(
                        testModule,
                        testFunction,
                        testLimitation
                    );

                    expect(testStructure).toEqual(jasmine.any(PolicyCreateStruct));
                    expect(testStructure.body.PolicyCreate.module).toEqual(testModule);
                    expect(testStructure.body.PolicyCreate.function).toEqual(testFunction);
                    expect(testStructure.body.PolicyCreate.limitations.limitation).toEqual(testLimitation);
                });

                it("newPolicyUpdateStruct", function(){

                    testStructure = userService.newPolicyUpdateStruct(
                        testLimitation
                    );

                    expect(testStructure).toEqual(jasmine.any(PolicyUpdateStruct));
                    expect(testStructure.body.PolicyUpdate.limitations.limitation).toEqual(testLimitation);
                });
            });

        });

    // ******************************
    // Cases with errors
    // ******************************

        describe("is returning errors correctly, while", function (){

            // ******************************
            // Faked faulty internal service calls
            // ******************************
            var fakedFaultyLoadUserGroup = function(userGroupId, callback){
                    callback(
                        new CAPIError("Content type service failed for some reason"),
                        false
                    );
                },
                fakedFaultyLoadUser = function(userId, callback){
                    callback(
                        new CAPIError("Content type service failed for some reason"),
                        false
                    );
                },
                fakedFaultyLoadRole = function(roleId, callback){
                    callback(
                        new CAPIError("Content type service failed for some reason"),
                        false
                    );
                };

            describe("dealing with faulty Discovery Service and running", function(){

                beforeEach(function(){

                    mockFaultyDiscoveryService = {
                        getInfoObject : function(name, callback){
                            callback(
                                new CAPIError("Discovery service failed for some reason"),
                                false
                            );
                        }
                    };

                    spyOn(mockFaultyDiscoveryService, 'getInfoObject').andCallThrough();

                    userService = new UserService(
                        mockConnectionManager,
                        mockFaultyDiscoveryService
                    );

                });

                it("loadRootUserGroup", function () {
                    userService.loadRootUserGroup(
                        mockCallback
                    );

                    expect(mockFaultyDiscoveryService.getInfoObject).toHaveBeenCalled();
                    expect(mockFaultyDiscoveryService.getInfoObject.mostRecentCall.args[0]).toEqual("rootUserGroup"); //name
                    expect(mockFaultyDiscoveryService.getInfoObject.mostRecentCall.args[1]).toEqual(jasmine.any(Function)); //callback

                    expect(mockCallback.mostRecentCall.args[0]).toEqual(jasmine.any(CAPIError)); //error
                    expect(mockCallback.mostRecentCall.args[1]).toEqual(false); //response
                });

                it("createRole", function () {

                    var roleCreateStruct = userService.newRoleInputStruct(
                        "random-role-id-" + Math.random()
                    );

                    userService.createRole(
                        roleCreateStruct,
                        mockCallback
                    );

                    expect(mockFaultyDiscoveryService.getInfoObject).toHaveBeenCalled();
                    expect(mockFaultyDiscoveryService.getInfoObject.mostRecentCall.args[0]).toEqual("roles"); //name
                    expect(mockFaultyDiscoveryService.getInfoObject.mostRecentCall.args[1]).toEqual(jasmine.any(Function)); //callback

                    expect(mockCallback.mostRecentCall.args[0]).toEqual(jasmine.any(CAPIError)); //error
                    expect(mockCallback.mostRecentCall.args[1]).toEqual(false); //response
                });

                it("loadRoles", function () {

                    userService.loadRoles(
                        testRoleIdentifier,
                        testLimit,
                        testOffset,
                        mockCallback
                    );

                    expect(mockFaultyDiscoveryService.getInfoObject).toHaveBeenCalled();
                    expect(mockFaultyDiscoveryService.getInfoObject.mostRecentCall.args[0]).toEqual("roles"); //name
                    expect(mockFaultyDiscoveryService.getInfoObject.mostRecentCall.args[1]).toEqual(jasmine.any(Function)); //callback

                    expect(mockCallback.mostRecentCall.args[0]).toEqual(jasmine.any(CAPIError)); //error
                    expect(mockCallback.mostRecentCall.args[1]).toEqual(false); //response
                });

            });


            describe("dealing with faulty inner calls", function(){

                beforeEach(function (){
                    userService = new UserService(
                        mockConnectionManager,
                        mockDiscoveryService
                    );
                });

                it("createUserGroup", function () {

                    spyOn(userService, 'loadUserGroup').andCallFake(fakedFaultyLoadUserGroup);

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

                    userService.createUserGroup(
                        testRootUserGroup,
                        userGroupCreateStruct,
                        mockCallback
                    );

                    expect(mockCallback).toHaveBeenCalled();
                    expect(mockCallback.mostRecentCall.args[0]).toEqual(jasmine.any(CAPIError)); //error
                    expect(mockCallback.mostRecentCall.args[1]).toEqual(false); //response
                });

                it("loadSubUserGroups", function () {

                    spyOn(userService, 'loadUserGroup').andCallFake(fakedFaultyLoadUserGroup);

                    userService.loadSubUserGroups(
                        testUserGroupId,
                        mockCallback
                    );

                    expect(mockCallback).toHaveBeenCalled();
                    expect(mockCallback.mostRecentCall.args[0]).toEqual(jasmine.any(CAPIError)); //error
                    expect(mockCallback.mostRecentCall.args[1]).toEqual(false); //response
                });

                it("loadUsersOfUserGroup", function () {

                    spyOn(userService, 'loadUserGroup').andCallFake(fakedFaultyLoadUserGroup);

                    userService.loadUsersOfUserGroup(
                        testUserGroupId,
                        mockCallback
                    );

                    expect(mockCallback).toHaveBeenCalled();
                    expect(mockCallback.mostRecentCall.args[0]).toEqual(jasmine.any(CAPIError)); //error
                    expect(mockCallback.mostRecentCall.args[1]).toEqual(false); //response
                });

                it("createUser", function () {

                    spyOn(userService, 'loadUserGroup').andCallFake(fakedFaultyLoadUserGroup);

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

                    userService.createUser(
                        testUserGroupId,
                        userCreateStruct,
                        mockCallback
                    );

                    expect(mockCallback).toHaveBeenCalled();
                    expect(mockCallback.mostRecentCall.args[0]).toEqual(jasmine.any(CAPIError)); //error
                    expect(mockCallback.mostRecentCall.args[1]).toEqual(false); //response
                });

                it("assignUserToUserGroup", function () {

                    spyOn(userService, 'loadUser').andCallFake(fakedFaultyLoadUser);

                    userService.assignUserToUserGroup(
                        testUserId,
                        testUserGroupId,
                        mockCallback
                    );

                    expect(mockCallback).toHaveBeenCalled();
                    expect(mockCallback.mostRecentCall.args[0]).toEqual(jasmine.any(CAPIError)); //error
                    expect(mockCallback.mostRecentCall.args[1]).toEqual(false); //response
                });

                it("getRoleAssignmentsForUser", function () {

                    spyOn(userService, 'loadUser').andCallFake(fakedFaultyLoadUser);

                    userService.getRoleAssignmentsForUser(
                        testUserId,
                        mockCallback
                    );

                    expect(mockCallback).toHaveBeenCalled();
                    expect(mockCallback.mostRecentCall.args[0]).toEqual(jasmine.any(CAPIError)); //error
                    expect(mockCallback.mostRecentCall.args[1]).toEqual(false); //response
                });

                it("getRoleAssignmentsForUserGroup", function () {

                    spyOn(userService, 'loadUserGroup').andCallFake(fakedFaultyLoadUserGroup);

                    userService.getRoleAssignmentsForUserGroup(
                        testUserGroupId,
                        mockCallback
                    );

                    expect(mockCallback).toHaveBeenCalled();
                    expect(mockCallback.mostRecentCall.args[0]).toEqual(jasmine.any(CAPIError)); //error
                    expect(mockCallback.mostRecentCall.args[1]).toEqual(false); //response
                });

                it("assignRoleToUser", function () {

                    spyOn(userService, 'loadUser').andCallFake(fakedFaultyLoadUser);

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

                    userService.assignRoleToUser(
                        testUserId,
                        roleAssignCreateStruct,
                        mockCallback
                    );

                    expect(mockCallback).toHaveBeenCalled();
                    expect(mockCallback.mostRecentCall.args[0]).toEqual(jasmine.any(CAPIError)); //error
                    expect(mockCallback.mostRecentCall.args[1]).toEqual(false); //response
                });

                it("assignRoleToUserGroup", function () {

                    spyOn(userService, 'loadUserGroup').andCallFake(fakedFaultyLoadUserGroup);

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

                    userService.assignRoleToUserGroup(
                        testUserId,
                        roleAssignCreateStruct,
                        mockCallback
                    );

                    expect(mockCallback).toHaveBeenCalled();
                    expect(mockCallback.mostRecentCall.args[0]).toEqual(jasmine.any(CAPIError)); //error
                    expect(mockCallback.mostRecentCall.args[1]).toEqual(false); //response
                });

                it("addPolicy", function () {

                    spyOn(userService, 'loadRole').andCallFake(fakedFaultyLoadRole);

                    var policyCreateStruct = userService.newPolicyCreateStruct(
                        "content",
                        "publish",
                        []
                    );

                    userService.addPolicy(
                        testRoleId,
                        policyCreateStruct,
                        mockCallback
                    );

                    expect(mockCallback).toHaveBeenCalled();
                    expect(mockCallback.mostRecentCall.args[0]).toEqual(jasmine.any(CAPIError)); //error
                    expect(mockCallback.mostRecentCall.args[1]).toEqual(false); //response
                });

                it("loadPolicies", function () {

                    spyOn(userService, 'loadRole').andCallFake(fakedFaultyLoadRole);

                    userService.loadPolicies(
                        testRoleId,
                        mockCallback
                    );

                    expect(mockCallback).toHaveBeenCalled();
                    expect(mockCallback.mostRecentCall.args[0]).toEqual(jasmine.any(CAPIError)); //error
                    expect(mockCallback.mostRecentCall.args[1]).toEqual(false); //response
                });

            });

        });

    });

});