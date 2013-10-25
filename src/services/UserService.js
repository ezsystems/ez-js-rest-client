/* global define */
define(['structures/SessionCreateStruct', 'structures/UserCreateStruct', 'structures/UserUpdateStruct',
        'structures/UserGroupCreateStruct', 'structures/UserGroupUpdateStruct', 'structures/PolicyCreateStruct',
        'structures/PolicyUpdateStruct', 'structures/RoleInputStruct', 'structures/RoleAssignInputStruct'],
    function (SessionCreateStruct, UserCreateStruct, UserUpdateStruct,
              UserGroupCreateStruct, UserGroupUpdateStruct, PolicyCreateStruct,
              PolicyUpdateStruct, RoleInputStruct, RoleAssignInputStruct) {
    "use strict";

    /**
     * Creates an instance of user service object. Should be retrieved from CAPI instance (see example).
     *
     * ## Note on the *callbacks* usage
     *
     * The **callback** argument of the service methods always take 2 arguments:
     *
     *    *     **error** either `false` or {{#crossLink "CAPIError"}}CAPIError{{/crossLink}} object when an error occurred
     *
     *    *     **response** the {{#crossLink "Response"}}Response{{/crossLink}} object
     *
     * Example:
     *
     *     userService.loadRootUserGroup(function (error, response) {
     *            if (error) {
     *                console.log('An error occurred', error);
     *            } else {
     *                console.log('Success!', response);
     *            }
     *     });
     *
     * @class UserService
     * @constructor
     * @param connectionManager {ConnectionManager} connection manager that will be used to send requests to REST service
     * @param discoveryService {DiscoveryService} discovery service is used for urls auto-discovery automation
     * @example
     *     var userService = jsCAPI.getUserService();
     */
    var UserService = function (connectionManager, discoveryService) {
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
     * @param login {String} login for a user, which wants to start a session
     * @param password {String} password for a user, which wants to start a session
     * @return {SessionCreateStruct}
     */
    UserService.prototype.newSessionCreateStruct = function newSessionCreateStruct(login, password) {
        return new SessionCreateStruct(login, password);
    };

    /**
     * Returns user group create structure
     *
     * @method newUserGroupCreateStruct
     * @param language {String} The language code (eng-GB, fre-FR, ...)
     * @param fields {Array} fields array (see example)
     * @return {UserGroupCreateStruct}
     * @example
     *     var userGroupCreateStruct = userService.newUserGroupCreateStruct(
     *         "eng-US",[{
     *             fieldDefinitionIdentifier: "name",
     *             languageCode: "eng-US",
     *             fieldValue: "UserGroup"
     *         }, {
     *             fieldDefinitionIdentifier: "description",
     *             languageCode: "eng-US",
     *             fieldValue: "This is the description of the user group"
     *         }]
     *     );
     */
    UserService.prototype.newUserGroupCreateStruct = function newUserGroupCreateStruct(language, fields) {
        return new UserGroupCreateStruct(language, fields);
    };

    /**
     * User group update structure
     *
     * @method newUserGroupUpdateStruct
     * @return {UserGroupCreateStruct}
     */
    UserService.prototype.newUserGroupUpdateStruct = function newUserGroupUpdateStruct() {
        return new UserGroupUpdateStruct();
    };

    /**
     * User create structure
     *
     * @method newUserCreateStruct
     * @param languageCode {String} The language code (eng-GB, fre-FR, ...)
     * @param login {String} login for a new user
     * @param email {String} email for a new user
     * @param password {String} password for a new user
     * @param fields {Array} fields array (see example for "newUserGroupCreateStruct")
     * @return {UserCreateStruct}
     */
    UserService.prototype.newUserCreateStruct = function newUserCreateStruct(languageCode, login, email, password, fields) {
        return new UserCreateStruct(languageCode, login, email, password, fields);
    };

    /**
     * Returns user update structure
     *
     * @method newUserUpdateStruct
     * @return {UserUpdateStruct}
     */
    UserService.prototype.newUserUpdateStruct = function newUserUpdateStruct() {
        return new UserUpdateStruct();
    };

    /**
     * Returns role input structure
     *
     * @method newRoleInputStruct
     * @param identifier {String} unique identifier for the new role (e.g. "editor")
     * @return {RoleInputStruct}
     */
    UserService.prototype.newRoleInputStruct = function newRoleInputStruct(identifier) {
        return new RoleInputStruct(identifier);
    };

    /**
     * Returns target role assignment input structure
     *
     * @method newRoleAssignInputStruct
     * @param role {Object} object representing the target role (see example)
     * @param limitation {Object} object representing limitations for assignment (see example)
     * @return {RoleAssignInputStruct}
     * @example
     *     var roleAssignCreateStruct = userService.newRoleAssignInputStruct(
     *         {
     *             "_href": "/api/ezp/v2/user/roles/7",
     *             "_media-type": "application/vnd.ez.api.RoleAssignInput+json"
     *         }, {
     *             "_identifier": "Section",
     *             "values": {
     *                 "ref": [{
     *                     "_href": "/api/ezp/v2/content/sections/1",
     *                     "_media-type": "application/vnd.ez.api.Section+json"
     *                 }, {
     *                     "_href": "/api/ezp/v2/content/sections/4",
     *                     "_media-type": "application/vnd.ez.api.Section+json"
     *                 }]
     *             }
     *         });
     *
     */
    UserService.prototype.newRoleAssignInputStruct = function newRoleAssignInputStruct(role, limitation) {
        return new RoleAssignInputStruct(role, limitation);
    };

    /**
     * Returns policy create structure
     *
     * @method newPolicyCreateStruct
     * @param module {String} name of the module for which new policy should be active
     * @param theFunction {String} name of the function for which the new policy should be active
     * @param limitations {Object} object describing limitations for new policy
     * @return {PolicyCreateStruct}
     * @example
     *     var policyCreateStruct = userService.newPolicyCreateStruct(
     *         "content", "publish", [{
     *             limitation: [{
     *                 "_identifier": "Section",
     *                 "values": {
     *                     "ref": [{
     *                         "_href": "5"
     *                     }, {
     *                         "_href": "4"
     *                     }]
     *                 }
     *             }]
     *         }]
     *     );
     */
    UserService.prototype.newPolicyCreateStruct = function newPolicyCreateStruct(module, theFunction, limitations) {
        return new PolicyCreateStruct(module, theFunction, limitations);
    };

    /**
     * Policy update structure
     *
     * @method newPolicyUpdateStruct
     * @param limitations {Object} object describing limitations change for the policy (see "newPolicyCreateStruct" example)
     * @return {PolicyUpdateStruct}
     */
    UserService.prototype.newPolicyUpdateStruct = function newPolicyUpdateStruct(limitations) {
        return new PolicyUpdateStruct(limitations);
    };

// ******************************
// User groups management
// ******************************

    /**
     * Load the root user group
     *
     * @method loadRootUserGroup
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "UserService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    UserService.prototype.loadRootUserGroup = function loadRootUserGroup(callback) {
        var that = this;

        this._discoveryService.getInfoObject(
            "rootUserGroup",
            function (error, rootUserGroup) {
                if (!error) {
                    that._connectionManager.request(
                        "GET",
                        rootUserGroup._href,
                        "",
                        {"Accept": rootUserGroup["_media-type"]},
                        callback
                    );

                } else {
                    callback(error, false);
                }
            });
    };

    /**
     * Load the target user group
     *
     * @method loadUserGroup
     * @param userGroupId {String} target user group identifier (e.g. "/api/ezp/v2/user/groups/1/5")
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "UserService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    UserService.prototype.loadUserGroup = function loadUserGroup(userGroupId, callback) {
        this._connectionManager.request(
            "GET",
            userGroupId,
            "",
            {"Accept": "application/vnd.ez.api.UserGroup+json"},
            callback
        );
    };

    /**
     * Load the target user group by remoteId
     *
     * @method loadUserGroupByRemoteId
     * @param userGroups {String} link to root UserGroups resource (should be auto-discovered)
     * @param remoteId {String} target user group remote identifier (e.g. "f5c88a2209584891056f987fd965b0ba")
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "UserService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    UserService.prototype.loadUserGroupByRemoteId = function loadUserGroupByRemoteId(userGroups, remoteId, callback) {
        this._connectionManager.request(
            "GET",
            userGroups + '?remoteId=' + remoteId,
            "",
            {"Accept": "application/vnd.ez.api.UserGroupList+json"},
            callback
        );
    };

    /**
     * Delete the target user group
     *
     * @method deleteUserGroup
     * @param userGroupId {String} target user group identifier (e.g. "/api/ezp/v2/user/groups/1/5")
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "UserService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    UserService.prototype.deleteUserGroup = function deleteUserGroup(userGroupId, callback) {
        this._connectionManager.delete(
            userGroupId,
            callback
        );
    };

    /**
     * Move the target user group to the destination
     *
     * @method moveUserGroup
     * @param userGroupId {String} target user group identifier (e.g. "/api/ezp/v2/user/groups/1/5")
     * @param destination {String} destination identifier (e.g. "/api/ezp/v2/user/groups/1/5/110")
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "UserService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    UserService.prototype.moveUserGroup = function moveUserGroup(userGroupId, destination, callback) {
        this._connectionManager.request(
            "MOVE",
            userGroupId,
            "",
            {"Destination": destination},
            callback
        );
    };

    /**
     * Create a new user group in the provided parent user group
     *
     * @method createUserGroup
     * @param parentGroupId {String} target parent user group identifier (e.g. "/api/ezp/v2/user/groups/1/5")
     * @param userGroupCreateStruct {UserGroupCreateStruct} object describing new user group to be created
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "UserService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    UserService.prototype.createUserGroup = function createUserGroup(parentGroupId, userGroupCreateStruct, callback) {
        var that = this;

        this.loadUserGroup(
            parentGroupId,
            function (error, userGroupResponse) {
                if (!error) {
                    var subGroups = userGroupResponse.document.UserGroup.Subgroups;

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
     * Update the target user group
     *
     * @method updateUserGroup
     * @param userGroupId {String} target user group identifier (e.g. "/api/ezp/v2/user/groups/1/5")
     * @param userGroupUpdateStruct {UserGroupUpdateStruct} object describing changes to the target user group
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "UserService"}}Note on the callbacks usage{{/crossLink}} for more info)
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
     * Load subgroups of the target user group
     *
     * @method loadSubUserGroups
     * @param userGroupId {String} target user group identifier (e.g. "/api/ezp/v2/user/groups/1/5")
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "UserService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    UserService.prototype.loadSubUserGroups = function loadSubUserGroups(userGroupId, callback) {
        var that = this;

        this.loadUserGroup(
            userGroupId,
            function (error, userGroupResponse) {
                if (!error) {
                    var subGroups = userGroupResponse.document.UserGroup.Subgroups;

                    that._connectionManager.request(
                        "GET",
                        subGroups._href,
                        "",
                        {"Accept": subGroups["_media-type"]},
                        callback
                    );

                } else {
                    callback(error, false);
                }
            }
        );
    };

    /**
     * Load users of the target user group
     *
     * @method loadUsersOfUserGroup
     * @param userGroupId {String} target user group identifier (e.g. "/api/ezp/v2/user/groups/1/5")
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "UserService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    UserService.prototype.loadUsersOfUserGroup = function loadUsersOfUserGroup(userGroupId, callback) {
        var that = this;

        this.loadUserGroup(
            userGroupId,
            function (error, userGroupResponse) {
                if (!error) {
                    var users = userGroupResponse.document.UserGroup.Users;

                    that._connectionManager.request(
                        "GET",
                        users._href,
                        "",
                        {"Accept": users["_media-type"]},
                        callback
                    );

                } else {
                    callback(error, false);
                }
            }
        );
    };

    /**
     * Load user groups for the target user
     *
     * @method loadUserGroupsOfUser
     * @param userId {String} target user identifier (e.g. "/api/ezp/v2/user/users/14")
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "UserService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    UserService.prototype.loadUserGroupsOfUser = function loadUserGroupsOfUser(userId, callback) {
        this._connectionManager.request(
            "GET",
            userId + '/groups',
            "",
            {"Accept": "application/vnd.ez.api.UserGroupRefList+json"},
            callback
        );
    };

// ******************************
// Users management
// ******************************

    /**
     * Create a new user
     *
     * @method createUser
     * @param userGroupId {String} target user group identifier (e.g. "/api/ezp/v2/user/groups/1/5")
     * @param userCreateStruct {UserCreateStruct} object describing new user to be created
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "UserService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    UserService.prototype.createUser = function createUser(userGroupId, userCreateStruct, callback) {
        var that = this;

        this.loadUserGroup(
            userGroupId,
            function (error, userGroupResponse) {
                if (!error) {
                    var users = userGroupResponse.document.UserGroup.Users;

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
     * Load users and usergroups for the target roleId
     *
     * @method getRoleAssignments
     * @param userList {String} link to root UserList resource (should be auto-discovered)
     * @param roleId {String} target role identifier (e.g. "/api/ezp/v2/user/roles/5")
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "UserService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    UserService.prototype.getRoleAssignments = function getRoleAssignments(userList, roleId, callback) {
        this._connectionManager.request(
            "GET",
            userList + '?roleId=' + roleId,
            "",
            {"Accept": "application/vnd.ez.api.UserList+json"},
            callback
        );
    };

    /**
     * Load the target user
     *
     * @method loadUser
     * @param userId {String} target user identifier (e.g. "/api/ezp/v2/user/users/144")
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "UserService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    UserService.prototype.loadUser = function loadUser(userId, callback) {
        this._connectionManager.request(
            "GET",
            userId,
            "",
            {"Accept": "application/vnd.ez.api.User+json"},
            callback
        );
    };

    /**
     * Update the target user
     *
     * @method updateUser
     * @param userId {String} target user identifier (e.g. "/api/ezp/v2/user/users/144")
     * @param userUpdateStruct {UserUpdateStruct} object describing changes to the user
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "UserService"}}Note on the callbacks usage{{/crossLink}} for more info)
     * @example
     *     var userUpdateStruct = userService.newUserUpdateStruct();
     *     userUpdateStruct.body.UserUpdate.email = "somenewemail@nowhere.no";
     *     userService.updateUser(
     *         "/api/ezp/v2/user/users/144",
     *         userUpdateStruct,
     *         callback
     *     );
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
     * Delete the target user
     *
     * @method deleteUser
     * @param userId {String} target user identifier (e.g. "/api/ezp/v2/user/users/144")
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "UserService"}}Note on the callbacks usage{{/crossLink}} for more info)
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
     * Assign the target user to the target user group
     *
     * @method loadUser
     * @param userId {String} target user identifier (e.g. "/api/ezp/v2/user/users/144")
     * @param userGroupId {String} target user group identifier (e.g. "/api/ezp/v2/user/groups/2")
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "UserService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    UserService.prototype.assignUserToUserGroup = function assignUserToUserGroup(userId, userGroupId, callback) {
        var that = this;

        this.loadUser(
            userId,
            function (error, userResponse) {
                if (!error) {
                    var userGroups = userResponse.document.User.UserGroups;

                    that._connectionManager.request(
                        "POST",
                        userGroups._href + "?group=" + userGroupId,
                        "",
                        {"Accept": userGroups["_media-type"]},
                        callback
                    );

                } else {
                    callback(error, false);
                }
            }
        );
    };

    /**
     * Remove target assignment (of a user to a user group)
     *
     * @method unassignUserFromUserGroup
     * @param userAssignedGroupId {String} target assignment identifier (e.g. "/api/ezp/v2/user/users/146/groups/1")
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "UserService"}}Note on the callbacks usage{{/crossLink}} for more info)
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
     * Create a new role
     *
     * @method createRole
     * @param roleCreateStruct {RoleCreateStruct} object describing new role to be created
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "UserService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    UserService.prototype.createRole = function createRole(roleCreateStruct, callback) {
        var that = this;

        this._discoveryService.getInfoObject(
            "roles",
            function (error, roles) {
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
     * Load the target role
     *
     * @method loadRole
     * @param roleId {String} target role identifier (e.g. "/api/ezp/v2/user/roles/5")
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "UserService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    UserService.prototype.loadRole = function loadRole(roleId, callback) {
        this._connectionManager.request(
            "GET",
            roleId,
            "",
            {"Accept": "application/vnd.ez.api.Role+json"},
            callback
        );
    };

    /**
     * Search roles by string identifier and apply certain limit and offset on the result set
     *
     * @method loadRoles
     * @param identifier {String} string identifier of the roles to search (e.g. "admin")
     * @param [offset=0] {int} the offset of the result set
     * @param [limit=-1] {int} the limit of the result set
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "UserService"}}Note on the callbacks usage{{/crossLink}} for more info)
     * @example
     *     userService.loadRoles("admin", 5, 5, callback);
     */
    UserService.prototype.loadRoles = function loadRoles(identifier, offset, limit, callback) {
        var that = this,
            identifierQuery = (identifier === "") ? "" : "&identifier=" + identifier;

        // default values for some of the parameters
        offset = (typeof offset === "undefined") ? 0 : offset;
        limit = (typeof limit === "undefined") ? -1 : limit;

        this._discoveryService.getInfoObject(
            "roles",
            function (error, roles) {
                if (!error) {
                    that._connectionManager.request(
                        "GET",
                        roles._href + '?offset=' + offset + '&limit=' + limit + identifierQuery,
                        "",
                        {"Accept": roles["_media-type"]},
                        callback
                    );

                } else {
                    callback(error, false);
                }
            }
        );
    };

    /**
     * Update the target role
     *
     * @method updateRole
     * @param roleId {String} target role identifier (e.g. "/api/ezp/v2/user/roles/5")
     * @param roleUpdateStruct {RoleUpdateStruct} object describing changes to the role
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "UserService"}}Note on the callbacks usage{{/crossLink}} for more info)
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
     * Delete the target role
     *
     * @method deleteRole
     * @param roleId {String} target role identifier (e.g. "/api/ezp/v2/user/roles/5")
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "UserService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    UserService.prototype.deleteRole = function deleteRole(roleId, callback) {
        this._connectionManager.delete(
            roleId,
            callback
        );
    };

    /**
     * Get role assignments for the target user
     *
     * @method getRoleAssignmentsForUser
     * @param userId {String} target user identifier (e.g. "/api/ezp/v2/user/users/8")
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "UserService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    UserService.prototype.getRoleAssignmentsForUser = function getRoleAssignmentsForUser(userId, callback) {
        var that = this;

        this.loadUser(
            userId,
            function (error, userResponse) {
                if (!error) {
                    var userRoles = userResponse.document.User.Roles;

                    that._connectionManager.request(
                        "GET",
                        userRoles._href,
                        "",
                        {"Accept": userRoles["_media-type"]},
                        callback
                    );

                } else {
                    callback(error, false);
                }
            }
        );
    };

    /**
     * Get role assignments for the target user group
     *
     * @method getRoleAssignmentsForUserGroup
     * @param userGroupId {String} target user group identifier (e.g. "/api/ezp/v2/user/groups/2")
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "UserService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    UserService.prototype.getRoleAssignmentsForUserGroup = function getRoleAssignmentsForUserGroup(userGroupId, callback) {
        var that = this;

        this.loadUserGroup(
            userGroupId,
            function (error, userGroupResponse) {
                if (!error) {
                    var userGroupRoles = userGroupResponse.document.UserGroup.Roles;

                    that._connectionManager.request(
                        "GET",
                        userGroupRoles._href,
                        "",
                        {"Accept": userGroupRoles["_media-type"]},
                        callback
                    );

                } else {
                    callback(error, false);
                }
            }
        );
    };

    /**
     * Get RoleAssignment object for the target assignment (of a user to a role)
     *
     * @method getUserAssignmentObject
     * @param userAssignmentId {String} target role assignment identifier (e.g. "/api/ezp/v2/user/13/roles/7")
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "UserService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    UserService.prototype.getUserAssignmentObject = function getUserAssignmentObject(userAssignmentId, callback) {
        this._connectionManager.request(
            "GET",
            userAssignmentId,
            "",
            {"Accept": "application/vnd.ez.api.RoleAssignment+json"},
            callback
        );
    };

    /**
     * Get RoleAssignment object for the target assignment (of a user group to a role)
     *
     * @method getUserGroupAssignmentObject
     * @param userGroupAssignmentId {String} target role assignment identifier (e.g. "/api/ezp/v2/user/groups/1/5/110/roles/7")
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "UserService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    UserService.prototype.getUserGroupAssignmentObject = function getUserGroupAssignmentObject(userGroupAssignmentId, callback) {
        this._connectionManager.request(
            "GET",
            userGroupAssignmentId,
            "",
            {"Accept": "application/vnd.ez.api.RoleAssignment+json"},
            callback
        );
    };

    /**
     * Assign a role to user
     *
     * @method assignRoleToUser
     * @param userId {String}  target user identifier (e.g. "/api/ezp/v2/user/users/8")
     * @param roleAssignInputStruct {RoleAssignInputStruct} object describing the new role assignment (see "newRoleAssignInputStruct")
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "UserService"}}Note on the callbacks usage{{/crossLink}} for more info)
     *
     */
    UserService.prototype.assignRoleToUser = function assignRoleToUser(userId, roleAssignInputStruct, callback) {
        var that = this;

        this.loadUser(
            userId,
            function (error, userResponse) {
                if (!error) {
                    var userRoles = userResponse.document.User.Roles;

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
     * @param userGroupId {String} target user group identifier (e.g. "/api/ezp/v2/user/groups/2")
     * @param roleAssignInputStruct {RoleAssignInputStruct} object describing the new role assignment (see "newRoleAssignInputStruct")
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "UserService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    UserService.prototype.assignRoleToUserGroup = function assignRoleToUserGroup(userGroupId, roleAssignInputStruct, callback) {
        var that = this;

        this.loadUserGroup(
            userGroupId,
            function (error, userGroupResponse) {
                if (!error) {
                    var userGroupRoles = userGroupResponse.document.UserGroup.Roles;

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
     * Remove target assignment (of a user to a role)
     *
     * @method unassignRoleFromUser
     * @param userRoleId {String} target role assignment identifier (e.g. "/api/ezp/v2/user/users/110/roles/7")
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "UserService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    UserService.prototype.unassignRoleFromUser = function unassignRoleFromUser(userRoleId, callback) {
        this._connectionManager.delete(
            userRoleId,
            callback
        );
    };

    /**
     * Remove target assignment (of a user group to a role)
     *
     * @method unassignRoleFromUserGroup
     * @param userGroupRoleId {String} target role assignment identifier (e.g. "/api/ezp/v2/user/groups/2/roles/7")
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "UserService"}}Note on the callbacks usage{{/crossLink}} for more info)
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
     * Add the new policy to the target role
     *
     * @method addPolicy
     * @param roleId {String} target role identifier (e.g. "/api/ezp/v2/user/roles/7")
     * @param policyCreateStruct {PolicyCreateStruct} object describing new policy to be created
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "UserService"}}Note on the callbacks usage{{/crossLink}} for more info)
     * @example
     *     var policyCreateStruct = userService.newPolicyCreateStruct(
     *     "content",
     *     "create",
     *     [{  _identifier: "Class",
     *         values: {
     *             ref: [{
     *                 _href: "18"
     *             }]
     *         }
     *     }]);
     *
     *     userService.addPolicy(
     *     "/api/ezp/v2/user/roles/7",
     *     policyCreateStruct,
     *     callback);
     */
    UserService.prototype.addPolicy = function addPolicy(roleId, policyCreateStruct, callback) {
        var that = this;

        this.loadRole(
            roleId,
            function (error, roleResponse) {
                if (!error) {
                    var rolePolicies = roleResponse.document.Role.Policies;

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
     * Load policies of the target role
     *
     * @method loadPolicies
     * @param roleId {String} target role identifier (e.g. "/api/ezp/v2/user/roles/7")
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "UserService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    UserService.prototype.loadPolicies = function loadPolicies(roleId, callback) {
        var that = this;

        this.loadRole(
            roleId,
            function (error, roleResponse) {
                if (!error) {
                    var rolePolicies = roleResponse.document.Role.Policies;

                    that._connectionManager.request(
                        "GET",
                        rolePolicies._href,
                        "",
                        {"Accept": rolePolicies["_media-type"]},
                        callback
                    );
                } else {
                    callback(error, false);
                }
            }
        );
    };

    /**
     * Load the target policy
     *
     * @method loadPolicy
     * @param policyId {String} target policy identifier (e.g. "/api/ezp/v2/user/roles/7/policies/1")
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "UserService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    UserService.prototype.loadPolicy = function loadPolicy(policyId, callback) {
        this._connectionManager.request(
            "GET",
            policyId,
            "",
            {"Accept": "application/vnd.ez.api.Policy+json"},
            callback
        );
    };

    /**
     * Update the target policy
     *
     * @method updatePolicy
     * @param policyId {String} target policy identifier (e.g. "/api/ezp/v2/user/roles/7/policies/1")
     * @param policyUpdateStruct {PolicyUpdateStruct} object describing changes to the policy
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "UserService"}}Note on the callbacks usage{{/crossLink}} for more info)
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
     * Delete the target policy
     *
     * @method deletePolicy
     * @param policyId {String} target policy identifier (e.g. "/api/ezp/v2/user/roles/7/policies/1")
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "UserService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    UserService.prototype.deletePolicy = function deletePolicy(policyId, callback) {
        this._connectionManager.delete(
            policyId,
            callback
        );
    };

    /**
     * Load policies for the target user
     *
     * @method loadPoliciesByUserId
     * @param userPolicies {String} link to root UserPolicies resource (should be auto-discovered)
     * @param userId {String} target user numerical identifier (e.g. 110)
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "UserService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    UserService.prototype.loadPoliciesByUserId = function loadPoliciesByUserId(userPolicies, userId, callback) {
        this._connectionManager.request(
            "GET",
            userPolicies + "?userId=" + userId,
            "",
            {"Accept": "application/vnd.ez.api.PolicyList+json"},
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
     * @param sessions {String} link to root Sessions resource (should be auto-discovered)
     * @param sessionCreateStruct {SessionCreateStruct} object describing new session to be created (see "newSessionCreateStruct")
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "UserService"}}Note on the callbacks usage{{/crossLink}} for more info)
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
     * Delete the target session (without actual client logout)
     *
     * @method deleteSession
     * @param sessionId {String} target session identifier (e.g. "/api/ezp/v2/user/sessions/o7i8r1sapfc9r84ae53bgq8gp4")
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "UserService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    UserService.prototype.deleteSession = function deleteSession(sessionId, callback) {
        this._connectionManager.delete(
            sessionId,
            callback
        );
    };

    /**
     * Actual client logout (based on deleteSession)
     * Implemented by ConnectionManager. Depends on current system configuration.
     * Kills currently active session and resets storage (e.g. LocalStorage) params (sessionId, CSRFToken)
     *
     * @method logOut
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "UserService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    UserService.prototype.logOut = function logOut(callback) {
        this._connectionManager.logOut(callback);
    };

    return UserService;

});
