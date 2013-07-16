var UserService = (function() {
    "use strict";

    /**
     * Creates an instance of user service object
     *
     * @constructor
     * @param connectionManager {object} connection manager that will be used to send requests to REST service
     */
    var UserService = function(connectionManager, discoveryService) {

        this._connectionManager = connectionManager;
        this._discoveryService = discoveryService;

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
    UserService.prototype.newSessionCreateStruct = function newSessionCreateStruct(login, password) {

        return new SessionCreateStruct(login, password);

    };

    /**
     * User group create structure
     *
     * @method newUserGroupCreateStruct
     * @param language {string}
     * @param fields {Array}
     */
    UserService.prototype.newUserGroupCreateStruct = function newUserGroupCreateStruct(language, fields) {

        return new UserGroupCreateStruct(language, fields);

    };

    /**
     * User group update structure
     *
     * @method newUserGroupUpdateStruct
     */
    UserService.prototype.newUserGroupUpdateStruct = function newUserGroupUpdateStruct() {

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
    UserService.prototype.newUserCreateStruct = function newUserCreateStruct(languageCode, login, email, password, fields) {

        return new UserCreateStruct(languageCode, login, email, password, fields);

    };

    /**
     * User update structure
     *
     * @method newUserUpdateStruct
     */
    UserService.prototype.newUserUpdateStruct = function newUserUpdateStruct() {

        return new UserUpdateStruct();

    };

    /**
     * Role input structure
     *
     * @method newRoleInputStruct
     * @param identifier {string}
     */
    UserService.prototype.newRoleInputStruct = function newRoleInputStruct(identifier) {

        return new RoleInputStruct(identifier);

    };

    /**
     * Role assignment input structure
     *
     * @method newRoleAssignmentInputStruct
     * @param role {Object}
     * @param limitation {Object}
     */
    UserService.prototype.newRoleAssignInputStruct = function newRoleAssignInputStruct(role, limitation) {

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
    UserService.prototype.newPolicyCreateStruct = function newPolicyCreateStruct(module, theFunction, limitations) {

        return new PolicyCreateStruct(module, theFunction, limitations);

    };

    /**
     * Policy update structure
     *
     * @method newPolicyUpdateStruct
     * @param limitations {Object}
     */
    UserService.prototype.newPolicyUpdateStruct = function newPolicyUpdateStruct(limitations) {

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
    UserService.prototype.loadRootUserGroup = function loadRootUserGroup(callback) {

        var that = this;

        this._discoveryService.getInfoObject(
            "rootUserGroup",
            function(error, rootUserGroup){
                if (!error) {

                    that._connectionManager.request(
                        "GET",
                        rootUserGroup._href,
                        "",
                        {
                            "Accept" : rootUserGroup["_media-type"]
                        },
                        callback
                    );

                } else {
                    callback(error, false);
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
    UserService.prototype.loadUserGroup = function loadUserGroup(userGroupId, callback) {
        this._connectionManager.request(
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
    UserService.prototype.loadUserGroupByRemoteId = function loadUserGroupByRemoteId(userGroups, remoteId, callback) {
        this._connectionManager.request(
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
    UserService.prototype.deleteUserGroup = function deleteUserGroup(userGroupId, callback) {
        this._connectionManager.delete(
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
    UserService.prototype.moveUserGroup = function moveUserGroup(userGroupId, destination, callback) {
        this._connectionManager.request(
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
    UserService.prototype.createUserGroup = function createUserGroup(parentGroupId, userGroupCreateStruct, callback) {

        var that = this;

        this.loadUserGroup(
            parentGroupId,
            function(error, userGroupResponse){
                if (!error) {

                    var subGroups = JSON.parse(userGroupResponse.body).UserGroup.Subgroups;

                    that._connectionManager.request(
                        "POST",
                        subGroups._href,
                        JSON.stringify(userGroupCreateStruct.body),
                        userGroupCreateStruct.headers,
                        callback
                    );

                } else {
                    callback(error, false);
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
    UserService.prototype.updateUserGroup = function updateUserGroup(userGroupId, userGroupUpdateStruct, callback) {
        this._connectionManager.request(
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
    UserService.prototype.loadSubUserGroups = function loadSubUserGroups(userGroupId, callback) {

        var that = this;

        this.loadUserGroup(
            userGroupId,
            function(error, userGroupResponse){
                if (!error) {

                    var subGroups = JSON.parse(userGroupResponse.body).UserGroup.Subgroups;

                    that._connectionManager.request(
                        "GET",
                        subGroups._href,
                        "",
                        {
                            "Accept" : subGroups["_media-type"]
                        },
                        callback
                    );

                } else {
                    callback(error, false);
                }
            }
        );
    };

    /**
     * Load users for a user group
     *
     * @method loadUsersOfUserGroup
     * @param userGroupId {href}
     * @param callback {function} function, which will be executed on request success
     */
    UserService.prototype.loadUsersOfUserGroup = function loadUsersOfUserGroup(userGroupId, callback) {

        var that = this;

        this.loadUserGroup(
            userGroupId,
            function(error, userGroupResponse){
                if (!error) {

                    var users = JSON.parse(userGroupResponse.body).UserGroup.Users;

                    that._connectionManager.request(
                        "GET",
                        users._href,
                        "",
                        {
                            "Accept" : users["_media-type"]
                        },
                        callback
                    );

                } else {
                    callback(error, false);
                }
            }
        );

    };

    /**
     * Load user groups for a user
     *
     * @method loadUserGroupsOfUser
     * @param userId {href}
     * @param callback {function} function, which will be executed on request success
     */
    UserService.prototype.loadUserGroupsOfUser = function loadUserGroupsOfUser(userId, callback) {
        this._connectionManager.request(
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
    UserService.prototype.createUser = function createUser(userGroupId, userCreateStruct, callback) {

        var that = this;

        this.loadUserGroup(
            userGroupId,
            function(error, userGroupResponse){
                if (!error) {

                    var users = JSON.parse(userGroupResponse.body).UserGroup.Users;

                    that._connectionManager.request(
                        "POST",
                        users._href,
                        JSON.stringify(userCreateStruct.body),
                        userCreateStruct.headers,
                        callback
                    );

                } else {
                    callback(error, false);
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
    UserService.prototype.getRoleAssignments = function getRoleAssignments(userList, roleId, callback) {
        this._connectionManager.request(
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
    UserService.prototype.loadUser = function loadUser(userId, callback) {
        this._connectionManager.request(
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
    UserService.prototype.updateUser = function updateUser(userId, userUpdateStruct, callback) {
        this._connectionManager.request(
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
    UserService.prototype.deleteUser = function deleteUser(userId, callback) {
        this._connectionManager.delete(
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
    UserService.prototype.assignUserToUserGroup = function assignUserToUserGroup(userId, userGroupId, callback) {

        var that = this;

        this.loadUser(
            userId,
            function(error, userResponse){
                if (!error) {

                    var userGroups = JSON.parse(userResponse.body).User.UserGroups;

                    that._connectionManager.request(
                        "POST",
                        userGroups._href + "?group=" + userGroupId,
                        "",
                        {
                            "Accept" : userGroups["_media-type"]
                        },
                        callback
                    );

                } else {
                    callback(error, false);
                }

            }
        );
    };

    /**
     * Unassign user from a user group
     *
     * @method unAssignUserFromUserGroup
     * @param userAssignedGroupId {href}
     * @param callback {function} function, which will be executed on request success
     */
    UserService.prototype.unassignUserFromUserGroup = function unassignUserFromUserGroup(userAssignedGroupId, callback) {
        this._connectionManager.delete(
            userAssignedGroupId,
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
    UserService.prototype.createRole = function createRole(roleCreateStruct, callback) {

        var that = this;

        this._discoveryService.getInfoObject(
            "roles",
            function(error, roles){
                if (!error) {

                    that._connectionManager.request(
                    "POST",
                    roles._href,
                    JSON.stringify(roleCreateStruct.body),
                    roleCreateStruct.headers,
                    callback
                    );

                } else {
                    callback(error, false);
                }
            }
        );
    };

    /**
     * Load a role
     *
     * @method loadRole
     * @param roleId {href}
     * @param callback {function} function, which will be executed on request success
     */
    UserService.prototype.loadRole = function loadRole(roleId, callback) {
        this._connectionManager.request(
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
    UserService.prototype.loadRoles = function loadRoles(identifier, limit, offset, callback) {

        var that = this,
            identifierQuery = (identifier === "") ? "" : "&identifier=" + identifier;

        // default values for some of the parameters
        offset = (typeof offset === "undefined") ? 0 : offset;
        limit = (typeof limit === "undefined") ? -1 : limit;



        this._discoveryService.getInfoObject(
            "roles",
            function(error, roles){
                if (!error) {

                    that._connectionManager.request(
                        "GET",
                        roles._href + '?offset=' + offset + '&limit=' + limit + identifierQuery,
                        "",
                        {
                            "Accept" : roles["_media-type"]
                        },
                        callback
                    );

                } else {
                    callback(error, false);
                }
            }
        );
    };

    /**
     * Update a role
     *
     * @method updateRole
     * @param roleId {href}
     * @param roleUpdateStruct
     * @param callback {function} function, which will be executed on request success
     */
    UserService.prototype.updateRole = function updateRole(roleId, roleUpdateStruct, callback) {
        this._connectionManager.request(
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
    UserService.prototype.deleteRole = function deleteRole(roleId, callback) {
        this._connectionManager.delete(
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
    UserService.prototype.getRoleAssignmentsForUser = function getRoleAssignmentsForUser(userId, callback) {

        var that = this;

        this.loadUser(
            userId,
            function(error, userResponse){
                if (!error) {

                    var userRoles = JSON.parse(userResponse.body).User.Roles;

                    that._connectionManager.request(
                        "GET",
                        userRoles._href,
                        "",
                        {
                            "Accept" : userRoles["_media-type"]
                        },
                        callback
                    );

                } else {
                    callback(error, false);
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
    UserService.prototype.getRoleAssignmentsForUserGroup = function getRoleAssignmentsForUserGroup(userGroupId, callback) {

        var that = this;

        this.loadUserGroup(
            userGroupId,
            function(error, userGroupResponse){
                if (!error) {

                    var userGroupRoles = JSON.parse(userGroupResponse.body).UserGroup.Roles;

                    that._connectionManager.request(
                        "GET",
                        userGroupRoles._href,
                        "",
                        {
                            "Accept" : userGroupRoles["_media-type"]
                        },
                        callback
                    );

                } else {
                    callback(error, false);
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
    UserService.prototype.getUserAssignmentObject = function getUserAssignmentObject(userAssignmentId, callback) {
        this._connectionManager.request(
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
    UserService.prototype.getUserGroupAssignmentObject = function getUserGroupAssignmentObject(userGroupAssignmentId, callback) {
        this._connectionManager.request(
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
    UserService.prototype.assignRoleToUser = function assignRoleToUser(userId, roleAssignInputStruct, callback) {

        var that = this;

        this.loadUser(
            userId,
            function(error, userResponse){
                if (!error) {

                    var userRoles = JSON.parse(userResponse.body).User.Roles;

                    that._connectionManager.request(
                        "POST",
                        userRoles._href,
                        JSON.stringify(roleAssignInputStruct.body),
                        roleAssignInputStruct.headers,
                        callback
                    );
                } else {
                    callback(error, false);
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
    UserService.prototype.assignRoleToUserGroup = function assignRoleToUserGroup(userGroupId, roleAssignInputStruct, callback) {

        var that = this;

        this.loadUserGroup(
            userGroupId,
            function(error, userGroupResponse){
                if (!error) {

                    var userGroupRoles = JSON.parse(userGroupResponse.body).UserGroup.Roles;

                    that._connectionManager.request(
                        "POST",
                        userGroupRoles._href,
                        JSON.stringify(roleAssignInputStruct.body),
                        roleAssignInputStruct.headers,
                        callback
                    );
                } else {
                    callback(error, false);
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
    UserService.prototype.unassignRoleFromUser = function unassignRoleFromUser(userRoleId, callback) {
        this._connectionManager.delete(
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
    UserService.prototype.unassignRoleFromUserGroup = function unassignRoleFromUserGroup(userGroupRoleId, callback) {
        this._connectionManager.delete(
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
    UserService.prototype.addPolicy = function addPolicy(roleId, policyCreateStruct, callback) {

        var that = this;

        this.loadRole(
            roleId,
            function(error, roleResponse){
                if (!error) {

                    var rolePolicies = JSON.parse(roleResponse.body).Role.Policies;

                    that._connectionManager.request(
                        "POST",
                        rolePolicies._href,
                        JSON.stringify(policyCreateStruct.body),
                        policyCreateStruct.headers,
                        callback
                    );
                } else {
                    callback(error, false);
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
    UserService.prototype.loadPolicies = function loadPolicies(roleId, callback) {

        var that = this;

        this.loadRole(
            roleId,
            function(error, roleResponse){
                if (!error) {

                    var rolePolicies = JSON.parse(roleResponse.body).Role.Policies;

                    that._connectionManager.request(
                        "GET",
                        rolePolicies._href,
                        "",
                        {
                            "Accept" : rolePolicies["_media-type"]
                        },
                        callback
                    );
                } else {
                    callback(error, false);
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
    UserService.prototype.loadPolicy = function loadPolicy(policyId, callback) {
        this._connectionManager.request(
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
    UserService.prototype.updatePolicy = function updatePolicy(policyId, policyUpdateStruct, callback) {
        this._connectionManager.request(
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
    UserService.prototype.deletePolicy = function deletePolicy(policyId, callback) {
        this._connectionManager.delete(
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
    UserService.prototype.loadPoliciesByUserId = function loadPoliciesByUserId(userPolicies, userId, callback) {
        this._connectionManager.request(
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
    UserService.prototype.createSession = function createSession(sessions, sessionCreateStruct, callback) {
        this._connectionManager.notAuthorizedRequest(
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
    UserService.prototype.deleteSession = function deleteSession(sessionId, callback) {
        this._connectionManager.delete(
            sessionId,
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
    UserService.prototype.logOut = function logOut(callback) {

        this._connectionManager.logOut(callback);

    };


    return UserService;

}());

