var UserService = (function() {
    "use strict";

    /**
     * Creates an instance of user service object
     *
     * @constructor
     * @param connectionManager {object} connection manager that will be used to send requests to REST service
     */
    var UserService = function(connectionManager, discoveryService) {

        this.connectionManager_ = connectionManager;
        this.discoveryService_ = discoveryService;

    };

// ******************************
// Structures
// ******************************

    /**
     * Returns session create structure
     *
     * @method newSessionCreateStruct
     * @param login {string}
     * @param password {string}
     */
    UserService.prototype.newSessionCreateStruct = function(login, password) {

        return new SessionCreateStruct(login, password);

    };

    /**
     * User group create structure
     *
     * @method newUserGroupCreateStruct
     * @param language {string}
     * @param fields {Array}
     */
    UserService.prototype.newUserGroupCreateStruct = function(language, fields) {

        return new UserGroupCreateStruct(language, fields);

    };

    /**
     * User group update structure
     *
     * @method newUserGroupUpdateStruct
     */
    UserService.prototype.newUserGroupUpdateStruct = function() {

        return new UserGroupUpdateStruct();

    };

    /**
     * User create structure
     *
     * @method newUserCreateStruct
     * @param languageCode {string}
     * @param login {string}
     * @param email {string}
     * @param password {string}
     * @param fields {Array}
     */
    UserService.prototype.newUserCreateStruct = function(languageCode, login, email, password, fields) {

        return new UserCreateStruct(languageCode, login, email, password, fields);

    };

    /**
     * User update structure
     *
     * @method newUserUpdateStruct
     */
    UserService.prototype.newUserUpdateStruct = function() {

        return new UserUpdateStruct();

    };

    /**
     * Role input structure
     *
     * @method newRoleInputStruct
     * @param identifier {string}
     */
    UserService.prototype.newRoleInputStruct = function(identifier) {

        return new RoleInputStruct(identifier);

    };

    /**
     * Role assignment input structure
     *
     * @method newRoleAssignmentInputStruct
     * @param role {Object}
     * @param limitation {Object}
     */
    UserService.prototype.newRoleAssignInputStruct = function(role, limitation) {

        return new RoleAssignInputStruct(role, limitation);

    };

    /**
     * Policy create structure
     *
     * @method newPolicyCreateStruct
     * @param module {string}
     * @param theFunction {string}
     * @param limitations {Object}
     */
    UserService.prototype.newPolicyCreateStruct = function(module, theFunction, limitations) {

        return new PolicyCreateStruct(module, theFunction, limitations);

    };

    /**
     * Policy update structure
     *
     * @method newPolicyUpdateStruct
     * @param limitations {Object}
     */
    UserService.prototype.newPolicyUpdateStruct = function(limitations) {

        return new PolicyUpdateStruct(limitations);

    };

// ******************************
// User groups management
// ******************************

    /**
     * Load root user group
     *
     * @method loadRootUserGroup
     * @param callback {function} function, which will be executed on request success
     */
    UserService.prototype.loadRootUserGroup = function(callback) {

        var that = this;

        this.discoveryService_.getInfoObject(
            "rootUserGroup",
            function(error, rootUserGroup){
                if (!error) {

                    that.connectionManager_.request(
                        "GET",
                        rootUserGroup["_href"],
                        "",
                        {
                            "Accept" : rootUserGroup["_media-type"]
                        },
                        callback
                    );

                } else {
                    callback(error, false)
                }
            });
    };

    /**
     * Load user group
     *
     * @method loadUserGroup
     * @param userGroupId {href}
     * @param callback {function} function, which will be executed on request success
     */
    UserService.prototype.loadUserGroup = function(userGroupId, callback) {
        this.connectionManager_.request(
            "GET",
            userGroupId,
            "",
            {
                "Accept" : "application/vnd.ez.api.UserGroup+json"
            },
            callback
        );
    };

    /**
     * Load user group by remoteId
     *
     * @method loadUserGroupByRemoteId
     * @param userGroups {href}
     * @param remoteId {string}
     * @param callback {function} function, which will be executed on request success
     */
    UserService.prototype.loadUserGroupByRemoteId = function(userGroups, remoteId, callback) {
        this.connectionManager_.request(
            "GET",
            userGroups + '?remoteId=' + remoteId,
            "",
            {
                "Accept" : "application/vnd.ez.api.UserGroupList+json"
            },
            callback
        );
    };

    /**
     * Delete user group
     *
     * @method deleteUserGroup
     * @param userGroupId {href}
     * @param callback {function} function, which will be executed on request success
     */
    UserService.prototype.deleteUserGroup = function(userGroupId, callback) {
        this.connectionManager_.delete(
            userGroupId,
            callback
        );
    };

    /**
     * Move user group
     *
     * @method moveUserGroup
     * @param userGroupId {href}
     * @param destination {href}
     * @param callback {function} function, which will be executed on request success
     */
    UserService.prototype.moveUserGroup = function(userGroupId, destination, callback) {
        this.connectionManager_.request(
            "MOVE",
            userGroupId,
            "",
            {
                "Destination" : destination
            },
            callback
        );
    };


    /**
     * Create user group
     *
     * @method createUserGroup
     * @param parentGroupId {href}
     * @param userGroupCreateStruct {Object}
     * @param callback {function} function, which will be executed on request success
     */
    UserService.prototype.createUserGroup = function(parentGroupId, userGroupCreateStruct, callback) {

        var that = this;

        this.loadUserGroup(
            parentGroupId,
            function(error, userGroupResponse){
                if (!error) {

                    var subGroups = JSON.parse(userGroupResponse.body).UserGroup.Subgroups;

                    that.connectionManager_.request(
                        "POST",
                        subGroups["_href"],
                        JSON.stringify(userGroupCreateStruct.body),
                        userGroupCreateStruct.headers,
                        callback
                    );

                } else {
                    callback(error, false)
                }
            }
        );
    };

    /**
     * Update user group
     *
     * @method updateUserGroup
     * @param userGroupId {href}
     * @param userGroupUpdateStruct {Object}
     * @param callback {function} function, which will be executed on request success
     */
    UserService.prototype.updateUserGroup = function(userGroupId, userGroupUpdateStruct, callback) {
        this.connectionManager_.request(
            "PATCH",
            userGroupId,
            JSON.stringify(userGroupUpdateStruct.body),
            userGroupUpdateStruct.headers,
            callback
        );
    };


    /**
     * Load subgroups for a user group
     *
     * @method loadSubUserGroups
     * @param userGroupId {href}
     * @param callback {function} function, which will be executed on request success
     */
    UserService.prototype.loadSubUserGroups = function(userGroupId, callback) {

        var that = this;

        this.loadUserGroup(
            userGroupId,
            function(error, userGroupResponse){
                if (!error) {

                    var subGroups = JSON.parse(userGroupResponse.body).UserGroup.Subgroups;

                    that.connectionManager_.request(
                        "GET",
                        subGroups["_href"],
                        "",
                        {
                            "Accept" : subGroups["_media-type"]
                        },
                        callback
                    );

                } else {
                    callback(error, false)
                }
            }
        )
    };

    /**
     * Load users for a user group
     *
     * @method loadUsersOfUserGroup
     * @param userGroupId {href}
     * @param callback {function} function, which will be executed on request success
     */
    UserService.prototype.loadUsersOfUserGroup = function(userGroupId, callback) {

        var that = this;

        this.loadUserGroup(
            userGroupId,
            function(error, userGroupResponse){
                if (!error) {

                    var users = JSON.parse(userGroupResponse.body).UserGroup.Users;

                    that.connectionManager_.request(
                        "GET",
                        users["_href"],
                        "",
                        {
                            "Accept" : users["_media-type"]
                        },
                        callback
                    );

                } else {
                    callback(error, false)
                }
            }
        )

    };

    /**
     * Load user groups for a user
     *
     * @method loadUserGroupsOfUser
     * @param userId {href}
     * @param callback {function} function, which will be executed on request success
     */
    UserService.prototype.loadUserGroupsOfUser = function(userId, callback) {
        this.connectionManager_.request(
            "GET",
            userId + '/groups',
            "",
            {
                "Accept" : "application/vnd.ez.api.UserGroupRefList+json"
            },
            callback
        );
    };

// ******************************
// Users management
// ******************************

    /**
     * Create user
     *
     * @method createUser
     * @param userGroupId {href}
     * @param userCreateStruct {Object}
     * @param callback {function} function, which will be executed on request success
     */
    UserService.prototype.createUser = function(userGroupId, userCreateStruct, callback) {

        var that = this;

        this.loadUserGroup(
            userGroupId,
            function(error, userGroupResponse){
                if (!error) {

                    var users = JSON.parse(userGroupResponse.body).UserGroup.Users;

                    that.connectionManager_.request(
                        "POST",
                        users["_href"],
                        JSON.stringify(userCreateStruct.body),
                        userCreateStruct.headers,
                        callback
                    );

                } else {
                    callback(error, false)
                }
            }
        );
    };

    /**
     * Load users and usergroups according to roleId
     *
     * @method getRoleAssignments
     * @param userList
     * @param roleId {href}
     * @param callback {function} function, which will be executed on request success
     */
    UserService.prototype.getRoleAssignments = function(userList, roleId, callback) {
        this.connectionManager_.request(
            "GET",
            userList + '?roleId=' + roleId,
            "",
            {
                "Accept" : "application/vnd.ez.api.UserList+json"
            },
            callback
        );
    };

    /**
     * Load user
     *
     * @method loadUser
     * @param userId {href}
     * @param callback {function} function, which will be executed on request success
     */
    UserService.prototype.loadUser = function(userId, callback) {
        this.connectionManager_.request(
            "GET",
            userId,
            "",
            {
                "Accept" : "application/vnd.ez.api.User+json"
            },
            callback
        );
    };

    /**
     * Update user
     *
     * @method updateUser
     * @param userId {href}
     * @param userUpdateStruct {Object}
     * @param callback {function} function, which will be executed on request success
     */
    UserService.prototype.updateUser = function(userId, userUpdateStruct, callback) {
        this.connectionManager_.request(
            "PATCH",
            userId,
            JSON.stringify(userUpdateStruct.body),
            userUpdateStruct.headers,
            callback
        );
    };

    /**
     * Delete user
     *
     * @method deleteUser
     * @param userId {href}
     * @param callback {function} function, which will be executed on request success
     */
    UserService.prototype.deleteUser = function(userId, callback) {
        this.connectionManager_.delete(
            userId,
            callback
        );
    };

// ******************************
// Users and groups relation management
// ******************************

    /**
     * Assign user to a user group
     *
     * @method loadUser
     * @param userId {href}
     * @param userGroupId {href}
     * @param callback {function} function, which will be executed on request success
     */
    UserService.prototype.assignUserToUserGroup = function(userId, userGroupId, callback) {

        var that = this;

        this.loadUser(
            userId,
            function(error, userResponse){
                if (!error) {

                    var userGroups = JSON.parse(userResponse.body).User.UserGroups;

                    that.connectionManager_.request(
                        "POST",
                        userGroups["_href"] + "?group=" + userGroupId,
                        "",
                        {
                            "Accept" : userGroups["_media-type"]
                        },
                        callback
                    );

                } else {
                    callback(error, false)
                }

            }
        )
    };

    /**
     * Unassign user from a user group
     *
     * @method unAssignUserFromUserGroup
     * @param userAssignedGroupId {href}
     * @param callback {function} function, which will be executed on request success
     */
    UserService.prototype.unAssignUserFromUserGroup = function(userAssignedGroupId, callback) {

        this.connectionManager_.request(
            "DELETE",
            userAssignedGroupId,
            "",
            {
                "Accept" : "application/vnd.ez.api.UserGroupRefList+json"
            },
            callback
        );

    };

// ******************************
// Roles management
// ******************************

    /**
     * Create a role
     *
     * @method createRole
     * @param roleCreateStruct {Object}
     * @param callback {function} function, which will be executed on request success
     */
    UserService.prototype.createRole = function(roleCreateStruct, callback) {

        var that = this;

        this.discoveryService_.getInfoObject(
            "roles",
            function(error, roles){
                if (!error) {

                    that.connectionManager_.request(
                    "POST",
                    roles["_href"],
                    JSON.stringify(roleCreateStruct.body),
                    roleCreateStruct.headers,
                    callback
                    );

                } else {
                    callback(error, false)
                }
        });
    };

    /**
     * Load a role
     *
     * @method loadRole
     * @param roleId {href}
     * @param callback {function} function, which will be executed on request success
     */
    UserService.prototype.loadRole = function(roleId, callback) {
        this.connectionManager_.request(
            "GET",
            roleId,
            "",
            {
                "Accept" : "application/vnd.ez.api.Role+json"
            },
            callback
        );
    };

    /**
     * Load roles
     *
     * @method loadRoles
     * @param identifier {string}
     * @param limit {int}
     * @param offset {int}
     * @param callback {function} function, which will be executed on request success
     */
    UserService.prototype.loadRoles = function(identifier, limit, offset, callback) {

        var that = this;
        var identifierQuery = (identifier === "") ? "" : "&identifier=" + identifier;

        // default values for some of the parameters
        offset = (typeof offset === "undefined") ? 0 : offset;
        limit = (typeof limit === "undefined") ? -1 : limit;



        this.discoveryService_.getInfoObject(
            "roles",
            function(error, roles){
                if (!error) {

                    that.connectionManager_.request(
                        "GET",
                        roles["_href"] + '?offset=' + offset + '&limit=' + limit + identifierQuery,
                        "",
                        {
                            "Accept" : roles["_media-type"]
                        },
                        callback
                    );

                } else {
                    callback(error, false)
                }
            }
        )
    };



    /**
     * Update a role
     *
     * @method updateRole
     * @param roleId {href}
     * @param roleUpdateStruct
     * @param callback {function} function, which will be executed on request success
     */
    UserService.prototype.updateRole = function(roleId, roleUpdateStruct, callback) {
        this.connectionManager_.request(
            "PATCH",
            roleId,
            JSON.stringify(roleUpdateStruct.body),
            roleUpdateStruct.headers,
            callback
        );
    };


    /**
     * Delete a role
     *
     * @method deleteRole
     * @param roleId {href}
     * @param callback {function} function, which will be executed on request success
     */
    UserService.prototype.deleteRole = function(roleId, callback) {
        this.connectionManager_.delete(
            roleId,
            callback
        );
    };


    /**
     * Get role assignments for a user
     *
     * @method getRoleAssignmentsForUser
     * @param userId {href}
     * @param callback {function} function, which will be executed on request success
     */
    UserService.prototype.getRoleAssignmentsForUser = function(userId, callback) {

        var that = this;

        this.loadUser(
            userId,
            function(error, userResponse){
                if (!error) {

                    var userRoles = JSON.parse(userResponse.body).User.Roles;

                    that.connectionManager_.request(
                        "GET",
                        userRoles["_href"],
                        "",
                        {
                            "Accept" : userRoles["_media-type"]
                        },
                        callback
                    );

                } else {
                    callback(error, false)
                }
            }
        );
    };

    /**
     * Get role assignments for a user group
     *
     * @method getRoleAssignmentsForUserGroup
     * @param userGroupId {href}
     * @param callback {function} function, which will be executed on request success
     */
    UserService.prototype.getRoleAssignmentsForUserGroup = function(userGroupId, callback) {

        var that = this;

        this.loadUserGroup(
            userGroupId,
            function(error, userGroupResponse){
                if (!error) {

                    var userGroupRoles = JSON.parse(userGroupResponse.body).UserGroup.Roles;

                    that.connectionManager_.request(
                        "GET",
                        userGroupRoles["_href"],
                        "",
                        {
                            "Accept" : userGroupRoles["_media-type"]
                        },
                        callback
                    );

                } else {
                    callback(error, false)
                }
            }
        );
    };


    /**
     * Get roleassignment object for a user
     *
     * @method getUserAssignmentObject
     * @param userAssignmentId {href}
     * @param callback {function} function, which will be executed on request success
     */
    UserService.prototype.getUserAssignmentObject = function(userAssignmentId, callback) {
        this.connectionManager_.request(
            "GET",
            userAssignmentId,
            "",
            {
                "Accept" : "application/vnd.ez.api.RoleAssignment+json"
            },
            callback
        );
    };

    /**
     * Get roleassignment object for a user group
     *
     * @method getUserGroupAssignmentObject
     * @param userGroupAssignmentId {href}
     * @param callback {function} function, which will be executed on request success
     */
    UserService.prototype.getUserGroupAssignmentObject = function(userGroupAssignmentId, callback) {
        this.connectionManager_.request(
            "GET",
            userGroupAssignmentId,
            "",
            {
                "Accept" : "application/vnd.ez.api.RoleAssignment+json"
            },
            callback
        );
    };


    /**
     * Assign a role to user
     *
     * @method assignRoleToUser
     * @param userId {href}
     * @param roleAssignInputStruct {Object}
     * @param callback {function} function, which will be executed on request success
     */
    UserService.prototype.assignRoleToUser = function(userId, roleAssignInputStruct, callback) {

        var that = this;

        this.loadUser(
            userId,
            function(error, userResponse){
                if (!error) {

                    var userRoles = JSON.parse(userResponse.body).User.Roles;

                    that.connectionManager_.request(
                        "POST",
                        userRoles["_href"],
                        JSON.stringify(roleAssignInputStruct.body),
                        roleAssignInputStruct.headers,
                        callback
                    );
                } else {
                    callback(error, false)
                }
            }
        );
    };


    /**
     * Assign a role to user group
     *
     * @method assignRoleToUserGroup
     * @param userGroupId {href}
     * @param roleAssignInputStruct {Object}
     * @param callback {function} function, which will be executed on request success
     */
    UserService.prototype.assignRoleToUserGroup = function(userGroupId, roleAssignInputStruct, callback) {

        var that = this;

        this.loadUserGroup(
            userGroupId,
            function(error, userGroupResponse){
                if (!error) {

                    var userGroupRoles = JSON.parse(userGroupResponse.body).UserGroup.Roles;

                    that.connectionManager_.request(
                        "POST",
                        userGroupRoles["_href"],
                        JSON.stringify(roleAssignInputStruct.body),
                        roleAssignInputStruct.headers,
                        callback
                    );
                } else {
                    callback(error, false)
                }
            }
        );
    };

    /**
     * Unassign the role from user
     *
     * @method unassignRoleFromUser
     * @param userRoleId {href}
     * @param callback {function} function, which will be executed on request success
     */
    UserService.prototype.unassignRoleFromUser = function(userRoleId, callback) {
        this.connectionManager_.delete(
            userRoleId,
            callback
        );
    };

    /**
     * Unassign the role from user group
     *
     * @method unassignRoleFromUserGroup
     * @param userGroupRoleId {href}
     * @param callback {function} function, which will be executed on request success
     */
    UserService.prototype.unassignRoleFromUserGroup = function(userGroupRoleId, callback) {
        this.connectionManager_.delete(
            userGroupRoleId,
            callback
        );
    };

// ******************************
// Policies management
// ******************************

    /**
     * Add new policy to the role
     *
     * @method addPolicy
     * @param roleId {href}
     * @param policyCreateStruct {Object}
     * @param callback {function} function, which will be executed on request success
     */
    UserService.prototype.addPolicy = function(roleId, policyCreateStruct, callback) {

        var that = this;

        this.loadRole(
            roleId,
            function(error, roleResponse){
                if (!error) {

                    var rolePolicies = JSON.parse(roleResponse.body).Role.Policies;

                    that.connectionManager_.request(
                        "POST",
                        rolePolicies["_href"],
                        JSON.stringify(policyCreateStruct.body),
                        policyCreateStruct.headers,
                        callback
                    );
                } else {
                    callback(error, false)
                }
            }
        );
    };

    /**
     * Load policies of the role
     *
     * @method loadPolicies
     * @param roleId {href}
     * @param callback {function} function, which will be executed on request success
     */
    UserService.prototype.loadPolicies = function(roleId, callback) {

        var that = this;

        this.loadRole(
            roleId,
            function(error, roleResponse){
                if (!error) {

                    var rolePolicies = JSON.parse(roleResponse.body).Role.Policies;

                    that.connectionManager_.request(
                        "GET",
                        rolePolicies["_href"],
                        "",
                        {
                            "Accept" : rolePolicies["_media-type"]
                        },
                        callback
                    );
                } else {
                    callback(error, false)
                }
            }
        );
    };

    /**
     * Load a policy
     *
     * @method loadPolicy
     * @param policyId {href}
     * @param callback {function} function, which will be executed on request success
     */
    UserService.prototype.loadPolicy = function(policyId, callback) {
        this.connectionManager_.request(
            "GET",
            policyId,
            "",
            {
                "Accept" : "application/vnd.ez.api.Policy+json"
            },
            callback
        );
    };

    /**
     * Update a policy
     *
     * @method updatePolicy
     * @param policyId {href}
     * @param policyUpdateStruct {Object}
     * @param callback {function} function, which will be executed on request success
     */
    UserService.prototype.updatePolicy = function(policyId, policyUpdateStruct, callback) {
        this.connectionManager_.request(
            "PATCH",
            policyId,
            JSON.stringify(policyUpdateStruct.body),
            policyUpdateStruct.headers,
            callback
        );
    };

    /**
     * Delete the policy
     *
     * @method deletePolicy
     * @param policyId {href}
     * @param callback {function} function, which will be executed on request success
     */
    UserService.prototype.deletePolicy = function(policyId, callback) {
        this.connectionManager_.delete(
            policyId,
            callback
        );
    };

    /**
     * Load users policies
     *
     * @method loadPoliciesByUserId
     * @param userPolicies
     * @param userId {href}
     * @param callback {function} function, which will be executed on request success
     */
    UserService.prototype.loadPoliciesByUserId = function(userPolicies, userId, callback) {
        this.connectionManager_.request(
            "GET",
            userPolicies + "?userId=" + userId,
            "",
            {
                "Accept" : "application/vnd.ez.api.PolicyList+json"
            },
            callback
        );
    };

// ******************************
// Sessions management
// ******************************

    /**
     * Create a session (login a user)
     *
     * @method createSession
     * @param sessions {href}
     * @param sessionCreateStruct {Object}
     * @param callback {function} function, which will be executed on request success
     */
    UserService.prototype.createSession = function(sessions, sessionCreateStruct, callback) {
        this.connectionManager_.notAuthorizedRequest(
            "POST",
            sessions,
            JSON.stringify(sessionCreateStruct.body),
            sessionCreateStruct.headers,
            callback
        );
    };

    /**
     * Delete the session (without actual client logout)
     *
     * @method deleteSession
     * @param sessionId {href}
     * @param callback {function} function, which will be executed on request success
     */
    UserService.prototype.deleteSession = function(sessionId, callback) {
        this.connectionManager_.request(
            "DELETE",
            sessionId,
            "",
            {
                "X-CSRF-Token" : "6245d05aa911d064c3f68fcf6b01aaaf65fca8ca"
            },
            callback
        );
    };

    /**
     * Actual client logout (based on deleteSession)
     * Kills currently active session and resets localStorage params (sessionId, CSRFToken)
     *
     * @method logOut
     * @param callback {function} function, which will be executed on request success
     */
    UserService.prototype.logOut = function(callback) {

        this.connectionManager_.logOut(callback);

    };


    return UserService;

}());

