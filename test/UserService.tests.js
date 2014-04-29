/* global define, describe, it, expect, beforeEach, jasmine, spyOn */
define(function (require) {

    // Declaring dependencies
    var UserService = require("services/UserService"),
        CAPIError = require("structures/CAPIError"),
        parseUriTemplate = require("utils/uriparse"),

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
            testSessionId = "/api/ezp/v2/user/sessions/o7i8r1sapfc9r84ae53bgq8gp4",
            sessionId = "o7i8r1sapfc9r84ae53bgq8gp4",
            testRefreshSession = "/api/ezp/v2/user/sessions/{sessionId}/refresh",
            refreshSessionInfo = {
                "_href": testRefreshSession,
                "_media-type": "application/vnd.ez.api.Session+json"
            },
            testRootId = "/api/ezp/v2/",
            testLogin = "login",
            testPass = "pass",
            testUsers = "/api/ezp/v2/user/users",

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

            mockConnectionManager = jasmine.createSpyObj('mockConnectionManager', ['request', 'notAuthorizedRequest']);
            mockCallback = jasmine.createSpy('mockCallback');

        });


    // ******************************
    // Cases without errors
    // ******************************
        describe("is calling injected objects with right arguments while performing", function () {

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
                fakedLoadRole = function(roleId, callback) {
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
                },
                fakedNotAuthorizedRequest = function (method, url, body, headers, callback) {
                    var mockRootResponse = {};
                    mockRootResponse.document = {
                        "Root": {
                            "createSession": {
                                _href : testRootId
                            }
                        }
                    };
                    callback(false, mockRootResponse);
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

                        if (name === "users"){
                            callback(
                                false,
                                {
                                    "_href" : testUsers,
                                    "_media-type" : "application/vnd.ez.api.UserList+json"
                                }
                            );
                        }
                        if ( name === "refreshSession" ) {
                            callback(false, refreshSessionInfo);
                        }
                    }
                };

                spyOn(mockDiscoveryService, 'getInfoObject').andCallThrough();

                userService = new UserService(mockConnectionManager, mockDiscoveryService, testRootId);

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

                expect(mockConnectionManager.request).toHaveBeenCalledWith(
                    "GET",
                    testRootUserGroup,
                    "",
                    {Accept: "application/vnd.ez.api.UserGroup+json"},
                    mockCallback
                );
            });

            it("loadUserGroup", function () {
                userService.loadUserGroup(
                    testUserGroupId,
                    mockCallback
                );

                expect(mockConnectionManager.request).toHaveBeenCalledWith(
                    "GET",
                    testUserGroupId,
                    "",
                    {Accept: "application/vnd.ez.api.UserGroup+json"},
                    mockCallback
                );
            });

            it("loadUserGroupByRemoteId", function () {
                userService.loadUserGroupByRemoteId(
                    testUserGroups,
                    testRemoteId,
                    mockCallback
                );

                expect(mockConnectionManager.request).toHaveBeenCalledWith(
                    "GET",
                    testUserGroups + "?remoteId=" + testRemoteId,
                    "",
                    {Accept: "application/vnd.ez.api.UserGroupList+json"},
                    mockCallback
                );
            });

            it("deleteUserGroup", function () {
                userService.deleteUserGroup(
                    testUserGroupId,
                    mockCallback
                );

                expect(mockConnectionManager.request).toHaveBeenCalledWith(
                    "DELETE",
                    testUserGroupId,
                    "",
                    {},
                    mockCallback
                );
            });

            it("moveUserGroup", function () {
                userService.moveUserGroup(
                    testUserGroupId,
                    testAnotherUserGroupId,
                    mockCallback
                );

                expect(mockConnectionManager.request).toHaveBeenCalledWith(
                    "MOVE",
                    testUserGroupId,
                    "",
                    {Destination: testAnotherUserGroupId},
                    mockCallback
                    );
            });

            it("createUserGroup", function () {

                spyOn(userService, 'loadUserGroup').andCallFake(fakedLoadUserGroup);

                var userGroupCreateStruct = userService.newUserGroupCreateStruct("eng-US", [{
                        fieldDefinitionIdentifier : "name",
                        languageCode : "eng-US",
                        fieldValue : "UserGroup"
                    }, {
                        fieldDefinitionIdentifier : "description",
                        languageCode : "eng-US",
                        fieldValue : "This is the description of the user group"
                    }]);

                userService.createUserGroup(
                    testRootUserGroup,
                    userGroupCreateStruct,
                    mockCallback
                );

                expect(mockConnectionManager.request).toHaveBeenCalledWith(
                    "POST",
                    testUserGroupSubgroups,
                    JSON.stringify(userGroupCreateStruct.body),
                    userGroupCreateStruct.headers,
                    mockCallback
                );
            });

            it("updateUserGroup", function () {

                var userGroupUpdateStruct = userService.newUserGroupUpdateStruct();

                userGroupUpdateStruct.body.UserGroupUpdate.fields.field = [
                    {
                        fieldDefinitionIdentifier : "name",
                        languageCode : "eng-US",
                        fieldValue : "UserGroup"
                    },
                    {
                        fieldDefinitionIdentifier : "description",
                        languageCode : "eng-US",
                        fieldValue : "This is the random description of the user group"
                    }
                ];

                userService.updateUserGroup(
                    testUserGroupId,
                    userGroupUpdateStruct,
                    mockCallback
                );

                expect(mockConnectionManager.request).toHaveBeenCalledWith(
                    "PATCH",
                    testUserGroupId,
                    JSON.stringify(userGroupUpdateStruct.body),
                    userGroupUpdateStruct.headers,
                    mockCallback
                );
            });

            it("loadSubUserGroups", function () {

                spyOn(userService, 'loadUserGroup').andCallFake(fakedLoadUserGroup);

                userService.loadSubUserGroups(
                    testUserGroupId,
                    mockCallback
                );

                expect(mockConnectionManager.request).toHaveBeenCalledWith(
                    "GET",
                    testUserGroupSubgroups,
                    "",
                    {Accept: "application/vnd.ez.api.UserGroupList+json"},
                    mockCallback
                );
            });

            it("loadUsersOfUserGroup", function () {

                spyOn(userService, 'loadUserGroup').andCallFake(fakedLoadUserGroup);

                userService.loadUsersOfUserGroup(
                    testUserGroupId,
                    mockCallback
                );

                expect(mockConnectionManager.request).toHaveBeenCalledWith(
                    "GET",
                    testUserGroupUsers,
                    "",
                    {Accept: "application/vnd.ez.api.UserList+json"},
                    mockCallback
                );
            });

            it("loadUserGroupsOfUser", function () {

                userService.loadUserGroupsOfUser(
                    testUserId,
                    mockCallback
                );

                expect(mockConnectionManager.request).toHaveBeenCalledWith(
                    "GET",
                    testUserId + "/groups",
                    "",
                    {Accept: "application/vnd.ez.api.UserGroupRefList+json"},
                    mockCallback
                );
                expect(mockConnectionManager.request.mostRecentCall.args[0]).toEqual("GET"); //method
                expect(mockConnectionManager.request.mostRecentCall.args[1]).toEqual(testUserId + "/groups"); //url
                expect(mockConnectionManager.request.mostRecentCall.args[2]).toEqual(""); // body
                expect(
                    mockConnectionManager.request.mostRecentCall.args[3].Accept
                ).toEqual("application/vnd.ez.api.UserGroupRefList+json"); // headers
                expect(mockConnectionManager.request.mostRecentCall.args[4]).toBe(mockCallback); // callback
            });

            // ******************************
            // Users management
            // ******************************

            it("createUser", function () {

                spyOn(userService, 'loadUserGroup').andCallFake(fakedLoadUserGroup);

                var userCreateStruct = userService.newUserCreateStruct(
                    "eng-US", "johndoe4", "johndoe4@nowhere.no", "johndoepass4", [{
                        fieldDefinitionIdentifier : "first_name",
                        languageCode : "eng-US",
                        fieldValue : "John"
                    },
                    {
                        fieldDefinitionIdentifier : "last_name",
                        languageCode : "eng-US",
                        fieldValue : "Doe"
                    }]
                );

                userService.createUser(
                    testUserGroupId,
                    userCreateStruct,
                    mockCallback
                );

                expect(mockConnectionManager.request).toHaveBeenCalledWith(
                    "POST",
                    testUserGroupUsers,
                    JSON.stringify(userCreateStruct.body),
                    userCreateStruct.headers,
                    mockCallback
                );
            });

            it("getRoleAssignments", function () {
                userService.getRoleAssignments(
                    testRoleId,
                    mockCallback
                );

                expect(mockConnectionManager.request).toHaveBeenCalledWith(
                    "GET",
                    testUsers + "?roleId=" + testRoleId,
                    "",
                    {Accept: "application/vnd.ez.api.UserList+json"},
                    mockCallback
                );
            });

            it("loadUser", function () {

                userService.loadUser(
                    testUserId,
                    mockCallback
                );

                expect(mockConnectionManager.request).toHaveBeenCalledWith(
                    "GET",
                    testUserId,
                    "",
                    {Accept: "application/vnd.ez.api.User+json"},
                    mockCallback
                );
            });

            it("updateUserGroup", function () {

                var userUpdateStruct = userService.newUserUpdateStruct();
                userUpdateStruct.body.UserUpdate.email = "somenewemail@nowhere.no";

                userService.updateUser(
                    testUserId,
                    userUpdateStruct,
                    mockCallback
                );

                expect(mockConnectionManager.request).toHaveBeenCalledWith(
                    "PATCH",
                    testUserId,
                    JSON.stringify(userUpdateStruct.body),
                    userUpdateStruct.headers,
                    mockCallback
                );
            });

            it("deleteUser", function () {
                userService.deleteUser(
                    testUserId,
                    mockCallback
                );

                expect(mockConnectionManager.request).toHaveBeenCalledWith(
                    "DELETE",
                    testUserId,
                    "",
                    {},
                    mockCallback
                );
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

                expect(mockConnectionManager.request).toHaveBeenCalledWith(
                    "POST",
                    testUserUserGroups + "?group=" + testUserGroupId,
                    "",
                    {Accept: "application/vnd.ez.api.UserGroupList+json"},
                    mockCallback
                );
            });

            it("unassignUserFromUserGroup", function () {
                userService.unassignUserFromUserGroup(
                    testUserAssignedGroupId,
                    mockCallback
                );

                expect(mockConnectionManager.request).toHaveBeenCalledWith(
                    "DELETE",
                    testUserAssignedGroupId,
                    "",
                    {},
                    mockCallback
                );
            });

            // ******************************
            // Roles management
            // ******************************
            it("createRole", function () {

                var roleCreateStruct = userService.newRoleInputStruct(
                    "random-role-id"
                );

                userService.createRole(
                    roleCreateStruct,
                    mockCallback
                );

                expect(mockDiscoveryService.getInfoObject).toHaveBeenCalled();
                expect(mockDiscoveryService.getInfoObject.mostRecentCall.args[0]).toEqual("roles"); //name
                expect(mockDiscoveryService.getInfoObject.mostRecentCall.args[1]).toEqual(jasmine.any(Function)); //callback

                expect(mockConnectionManager.request).toHaveBeenCalledWith(
                    "POST",
                    testRoles,
                    JSON.stringify(roleCreateStruct.body),
                    roleCreateStruct.headers,
                    mockCallback
                );
            });

            it("loadRole", function () {

                userService.loadRole(
                    testRoleId,
                    mockCallback
                );

                expect(mockConnectionManager.request).toHaveBeenCalledWith(
                    "GET",
                    testRoleId,
                    "",
                    {Accept: "application/vnd.ez.api.Role+json"},
                    mockCallback
                );
            });

            it("loadRoles", function () {

                userService.loadRoles(
                    testRoleIdentifier,
                    testLimit,
                    testOffset,
                    mockCallback
                );

                expect(mockDiscoveryService.getInfoObject).toHaveBeenCalled();
                expect(mockDiscoveryService.getInfoObject.mostRecentCall.args[0]).toEqual("roles"); //name
                expect(mockDiscoveryService.getInfoObject.mostRecentCall.args[1]).toEqual(jasmine.any(Function)); //callback

                expect(mockConnectionManager.request).toHaveBeenCalledWith(
                    "GET",
                    testRoles + '?offset=' + testOffset + '&limit=' + testLimit + '&identifier=' + testRoleIdentifier,
                    "",
                    {Accept: "application/vnd.ez.api.RoleList+json"},
                    mockCallback
                );
            });

            it("loadRoles with minimum arguments set", function () {

                userService.loadRoles(
                    mockCallback
                );

                expect(mockDiscoveryService.getInfoObject).toHaveBeenCalled();
                expect(mockDiscoveryService.getInfoObject.mostRecentCall.args[0]).toEqual("roles"); //name
                expect(mockDiscoveryService.getInfoObject.mostRecentCall.args[1]).toEqual(jasmine.any(Function)); //callback

                expect(mockConnectionManager.request).toHaveBeenCalledWith(
                    "GET",
                    testRoles + '?offset=' + testOffset + '&limit=' + testLimit,
                    "",
                    {Accept: "application/vnd.ez.api.RoleList+json"},
                    mockCallback
                );
            });

            it("loadRoles with 1 optional argument", function () {

                userService.loadRoles(
                    testRoleIdentifier,
                    mockCallback
                );

                expect(mockDiscoveryService.getInfoObject).toHaveBeenCalled();
                expect(mockDiscoveryService.getInfoObject.mostRecentCall.args[0]).toEqual("roles"); //name
                expect(mockDiscoveryService.getInfoObject.mostRecentCall.args[1]).toEqual(jasmine.any(Function)); //callback

                expect(mockConnectionManager.request).toHaveBeenCalledWith(
                    "GET",
                    testRoles + '?offset=' + testOffset + '&limit=' + testLimit + '&identifier=' + testRoleIdentifier,
                    "",
                    {Accept: "application/vnd.ez.api.RoleList+json"},
                    mockCallback
                );
            });

            it("loadRoles with 2 optional arguments", function () {

                userService.loadRoles(
                    testRoleIdentifier,
                    testLimit,
                    mockCallback
                );

                expect(mockDiscoveryService.getInfoObject).toHaveBeenCalled();
                expect(mockDiscoveryService.getInfoObject.mostRecentCall.args[0]).toEqual("roles"); //name
                expect(mockDiscoveryService.getInfoObject.mostRecentCall.args[1]).toEqual(jasmine.any(Function)); //callback

                expect(mockConnectionManager.request).toHaveBeenCalledWith(
                    "GET",
                    testRoles + '?offset=' + testOffset + '&limit=' + testLimit + '&identifier=' + testRoleIdentifier,
                    "",
                    {Accept: "application/vnd.ez.api.RoleList+json"},
                    mockCallback
                );
            });


            it("updateRole", function () {

                var roleUpdateStruct = userService.newRoleInputStruct(
                    "random-role-id"
                );

                userService.updateRole(
                    testRoleId,
                    roleUpdateStruct,
                    mockCallback
                );

                expect(mockConnectionManager.request).toHaveBeenCalledWith(
                    "PATCH",
                    testRoleId,
                    JSON.stringify(roleUpdateStruct.body),
                    roleUpdateStruct.headers,
                    mockCallback
                );
            });

            it("deleteRole", function () {
                userService.deleteRole(
                    testRoleId,
                    mockCallback
                );

                expect(mockConnectionManager.request).toHaveBeenCalledWith(
                    "DELETE",
                    testRoleId,
                    "",
                    {},
                    mockCallback
                );
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

                expect(mockConnectionManager.request).toHaveBeenCalledWith(
                    "GET",
                    testUserRoles,
                    "",
                    {Accept: "application/vnd.ez.api.RoleAssignmentList+json"},
                    mockCallback
                );
            });

            it("getRoleAssignmentsForUserGroup", function () {

                spyOn(userService, 'loadUserGroup').andCallFake(fakedLoadUserGroup);

                userService.getRoleAssignmentsForUserGroup(
                    testUserGroupId,
                    mockCallback
                );

                expect(mockConnectionManager.request).toHaveBeenCalledWith(
                    "GET",
                    testUserGroupRoles,
                    "",
                    {Accept: "application/vnd.ez.api.RoleAssignmentList+json"},
                    mockCallback
                );
            });

            it("getUserAssignmentObject", function () {

                userService.getUserAssignmentObject(
                    testUserAssignmentId,
                    mockCallback
                );

                expect(mockConnectionManager.request).toHaveBeenCalledWith(
                    "GET",
                    testUserAssignmentId,
                    "",
                    {Accept: "application/vnd.ez.api.RoleAssignment+json"},
                    mockCallback
                );
            });

            it("getUserGroupAssignmentObject", function () {

                userService.getUserGroupAssignmentObject(
                    testUserGroupAssignmentId,
                    mockCallback
                );

                expect(mockConnectionManager.request).toHaveBeenCalledWith(
                    "GET",
                    testUserGroupAssignmentId,
                    "",
                    {Accept: "application/vnd.ez.api.RoleAssignment+json"},
                    mockCallback
                );
            });

            it("assignRoleToUser", function () {

                spyOn(userService, 'loadUser').andCallFake(fakedLoadUser);

                var roleAssignCreateStruct = userService.newRoleAssignInputStruct({
                        "_href" : "/api/ezp/v2/user/roles/7",
                        "_media-type" : "application/vnd.ez.api.RoleAssignInput+json"
                    }, {
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
                    });

                userService.assignRoleToUser(
                    testUserId,
                    roleAssignCreateStruct,
                    mockCallback
                );

                expect(mockConnectionManager.request).toHaveBeenCalledWith(
                    "POST",
                    testUserRoles,
                    JSON.stringify(roleAssignCreateStruct.body),
                    roleAssignCreateStruct.headers,
                    mockCallback
                );
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

                expect(mockConnectionManager.request).toHaveBeenCalledWith(
                    "POST",
                    testUserGroupRoles,
                    JSON.stringify(roleAssignCreateStruct.body),
                    roleAssignCreateStruct.headers,
                    mockCallback
                );
            });

            it("unassignRoleFromUser", function () {
                userService.unassignRoleFromUser(
                    testUserRoleId,
                    mockCallback
                );

                expect(mockConnectionManager.request).toHaveBeenCalledWith(
                    "DELETE",
                    testUserRoleId,
                    "",
                    {},
                    mockCallback
                );
            });

            it("unassignRoleFromUserGroup", function () {
                userService.unassignRoleFromUserGroup(
                    testUserGroupRoleId,
                    mockCallback
                );

                expect(mockConnectionManager.request).toHaveBeenCalledWith(
                    "DELETE",
                    testUserGroupRoleId,
                    "",
                    {},
                    mockCallback
                );
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

                expect(mockConnectionManager.request).toHaveBeenCalledWith(
                    "POST",
                    testRolePolicies,
                    JSON.stringify(policyCreateStruct.body),
                    policyCreateStruct.headers,
                    mockCallback
                );
            });

            it("loadPolicies", function () {

                spyOn(userService, 'loadRole').andCallFake(fakedLoadRole);

                userService.loadPolicies(
                    testRoleId,
                    mockCallback
                );

                expect(mockConnectionManager.request).toHaveBeenCalledWith(
                    "GET",
                    testRolePolicies,
                    "",
                    {Accept: "application/vnd.ez.api.PolicyList+json"},
                    mockCallback
                );
            });

            it("loadPolicy", function () {

                userService.loadPolicy(
                    testPolicyId,
                    mockCallback
                );

                expect(mockConnectionManager.request).toHaveBeenCalledWith(
                    "GET",
                    testPolicyId,
                    "",
                    {Accept: "application/vnd.ez.api.Policy+json"},
                    mockCallback
                );
            });

            it("updatePolicy", function () {

                var policyUpdateStruct = userService.newPolicyUpdateStruct([{
                    "_identifier": "Section",
                    "values": {
                        "ref": [{
                            "_href": "/api/ezp/v2/content/sections/1",
                            "_media-type": "application/vnd.ez.api.Section+json"
                        }, {
                            "_href": "/api/ezp/v2/content/sections/4",
                            "_media-type": "application/vnd.ez.api.Section+json"
                        }]
                    }
                }]);

                userService.updatePolicy(
                    testPolicyId,
                    policyUpdateStruct,
                    mockCallback
                );

                expect(mockConnectionManager.request).toHaveBeenCalledWith(
                    "PATCH",
                    testPolicyId,
                    JSON.stringify(policyUpdateStruct.body),
                    policyUpdateStruct.headers,
                    mockCallback
                );
            });

            it("deletePolicy", function () {
                userService.deletePolicy(
                    testPolicyId,
                    mockCallback
                );

                expect(mockConnectionManager.request).toHaveBeenCalledWith(
                    "DELETE",
                    testPolicyId,
                    "",
                    {},
                    mockCallback
                );
            });

            it("loadPoliciesByUserId", function () {

                userService.loadPoliciesByUserId(
                    testPolicies,
                    testUserId,
                    mockCallback
                );

                expect(mockConnectionManager.request).toHaveBeenCalledWith(
                    "GET",
                    testPolicies + "?userId=" + testUserId,
                    "",
                    {Accept: "application/vnd.ez.api.PolicyList+json"},
                    mockCallback
                );
            });

            // ******************************
            // Sessions management
            // ******************************
            it("createSession", function () {
                var sessionCreateStruct = userService.newSessionCreateStruct(
                    "admin",
                    "admin"
                );

                mockConnectionManager.notAuthorizedRequest.andCallFake(fakedNotAuthorizedRequest);

                userService.createSession(
                    sessionCreateStruct,
                    mockCallback
                );

                expect(mockConnectionManager.notAuthorizedRequest).toHaveBeenCalledWith(
                    "POST",
                    testRootId,
                    JSON.stringify(sessionCreateStruct.body),
                    sessionCreateStruct.headers,
                    mockCallback
                );
            });

            it("deleteSession", function () {
                userService.deleteSession(
                    testSessionId,
                    mockCallback
                );

                expect(mockConnectionManager.request).toHaveBeenCalledWith(
                    "DELETE",
                    testSessionId,
                    "",
                    {},
                    mockCallback
                );
            });

            it("refreshSession", function () {
                userService.refreshSession(sessionId, mockCallback);

                expect(mockDiscoveryService.getInfoObject).toHaveBeenCalledWith(
                    "refreshSession", jasmine.any(Function)
                );
                expect(mockConnectionManager.request).toHaveBeenCalledWith(
                    "POST",
                    parseUriTemplate(testRefreshSession, {sessionId: sessionId}),
                    "",
                    {"Accept": refreshSessionInfo["_media-type"]},
                    mockCallback
                );
            });

            // ******************************
            // Structures
            // ******************************
            describe("structures creation", function () {

                it("newSessionCreateStruct", function (){

                    testStructure = userService.newSessionCreateStruct(
                        testLogin,
                        testPass
                    );

                    expect(testStructure).toEqual(jasmine.any(SessionCreateStruct));
                    expect(testStructure.body.SessionInput.login).toEqual(testLogin);
                    expect(testStructure.body.SessionInput.password).toEqual(testPass);
                });

                it("newUserGroupCreateStruct", function (){

                    testStructure = userService.newUserGroupCreateStruct(
                        testLanguage,
                        testArray
                    );

                    expect(testStructure).toEqual(jasmine.any(UserGroupCreateStruct));
                    expect(testStructure.body.UserGroupCreate.mainLanguageCode).toEqual(testLanguage);
                    expect(testStructure.body.UserGroupCreate.fields.field).toEqual(testArray);
                });

                it("newUserGroupUpdateStruct", function (){

                    testStructure = userService.newUserGroupUpdateStruct();

                    expect(testStructure).toEqual(jasmine.any(UserGroupUpdateStruct));
                });

                it("newUserCreateStruct", function (){

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

                it("newUserUpdateStruct", function (){

                    testStructure = userService.newUserUpdateStruct();

                    expect(testStructure).toEqual(jasmine.any(UserUpdateStruct));
                });

                it("newRoleInputStruct", function (){

                    testStructure = userService.newRoleInputStruct(
                        testRoleIdentifier
                    );

                    expect(testStructure).toEqual(jasmine.any(RoleInputStruct));
                    expect(testStructure.body.RoleInput.identifier).toEqual(testRoleIdentifier);
                });

                it("newRoleAssignInputStruct", function (){

                    testStructure = userService.newRoleAssignInputStruct(
                        testRoleId,
                        testLimitation
                    );

                    expect(testStructure).toEqual(jasmine.any(RoleAssignInputStruct));
                    expect(testStructure.body.RoleAssignInput.Role).toEqual(testRoleId);
                    expect(testStructure.body.RoleAssignInput.limitation).toEqual(testLimitation);
                });

                it("newPolicyCreateStruct", function (){

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

                it("newPolicyUpdateStruct", function (){

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

            describe("dealing with faulty Discovery Service and performing", function () {

                beforeEach(function (){

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
                        mockFaultyDiscoveryService,
                        testRootId
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
                        "random-role-id"
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

                it("loadRoles", function () {

                    userService.getRoleAssignments(
                        testRoleIdentifier,
                        mockCallback
                    );

                    expect(mockFaultyDiscoveryService.getInfoObject).toHaveBeenCalled();
                    expect(mockFaultyDiscoveryService.getInfoObject.mostRecentCall.args[0]).toEqual("users"); //name
                    expect(mockFaultyDiscoveryService.getInfoObject.mostRecentCall.args[1]).toEqual(jasmine.any(Function)); //callback

                    expect(mockCallback.mostRecentCall.args[0]).toEqual(jasmine.any(CAPIError)); //error
                    expect(mockCallback.mostRecentCall.args[1]).toEqual(false); //response
                });

                it("refreshSession", function () {
                    userService.refreshSession(sessionId, mockCallback);

                    expect(mockFaultyDiscoveryService.getInfoObject).toHaveBeenCalledWith(
                        "refreshSession", jasmine.any(Function)
                    );
                    expect(mockCallback).toHaveBeenCalledWith(jasmine.any(CAPIError), false);
                });

            });

            describe("dealing with faulty Connection Manager and performing", function () {

                it("createSession", function () {
                    var mockFaultyConnectionManager = {
                            notAuthorizedRequest : function (method, url, body, headers, callback) {
                                callback(
                                    new CAPIError("Connection manager failed for some reason"),
                                    false
                                );
                            }
                        },
                        sessionCreateStruct;

                    spyOn(mockFaultyConnectionManager, 'notAuthorizedRequest').andCallThrough();

                    userService = new UserService(
                        mockFaultyConnectionManager,
                        mockDiscoveryService,
                        testRootId
                    );

                    sessionCreateStruct = userService.newSessionCreateStruct(
                        "admin",
                        "admin"
                    );


                    userService.createSession(
                        sessionCreateStruct,
                        mockCallback
                    );

                    expect(mockCallback).toHaveBeenCalledWith(
                        jasmine.any(CAPIError),
                        false
                    );
                });
            });

            describe("dealing with faulty inner calls and performing", function (){

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
