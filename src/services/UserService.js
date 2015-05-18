/* global define */
define(['structures/SessionCreateStruct', 'structures/UserCreateStruct', 'structures/UserUpdateStruct',
        'structures/UserGroupCreateStruct', 'structures/UserGroupUpdateStruct', 'structures/PolicyCreateStruct',
        'structures/PolicyUpdateStruct', 'structures/RoleInputStruct', 'structures/RoleAssignInputStruct',
        "utils/uriparse"],
    function (SessionCreateStruct, UserCreateStruct, UserUpdateStruct,
              UserGroupCreateStruct, UserGroupUpdateStruct, PolicyCreateStruct,
              PolicyUpdateStruct, RoleInputStruct, RoleAssignInputStruct,
              parseUriTemplate) {
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
    var UserService = function (connectionManager, discoveryService, rootPath) {
        this._connectionManager = connectionManager;
        this._discoveryService = discoveryService;
        this._rootPath = rootPath;
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
    UserService.prototype.newSessionCreateStruct = function (login, password) {
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
    UserService.prototype.newUserGroupCreateStruct = function (language, fields) {
        return new UserGroupCreateStruct(language, fields);
    };

    /**
     * User group update structure
     *
     * @method newUserGroupUpdateStruct
     * @return {UserGroupCreateStruct}
     */
    UserService.prototype.newUserGroupUpdateStruct = function () {
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
     * @param fields {Array} fields array (see example for
     * {{#crossLink "UserService/newUserGroupCreateStruct"}}UserService.newUserGroupCreateStruct{{/crossLink}})
     * @return {UserCreateStruct}
     */
    UserService.prototype.newUserCreateStruct = function (languageCode, login, email, password, fields) {
        return new UserCreateStruct(languageCode, login, email, password, fields);
    };

    /**
     * Returns user update structure
     *
     * @method newUserUpdateStruct
     * @return {UserUpdateStruct}
     */
    UserService.prototype.newUserUpdateStruct = function () {
        return new UserUpdateStruct();
    };

    /**
     * Returns role input structure
     *
     * @method newRoleInputStruct
     * @param identifier {String} unique identifier for the new role (e.g. "editor")
     * @return {RoleInputStruct}
     */
    UserService.prototype.newRoleInputStruct = function (identifier) {
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
    UserService.prototype.newRoleAssignInputStruct = function (role, limitation) {
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
    UserService.prototype.newPolicyCreateStruct = function (module, theFunction, limitations) {
        return new PolicyCreateStruct(module, theFunction, limitations);
    };

    /**
     * Policy update structure
     *
     * @method newPolicyUpdateStruct
     * @param limitations {Object} object describing limitations change for the policy (see "newPolicyCreateStruct" example)
     * @return {PolicyUpdateStruct}
     */
    UserService.prototype.newPolicyUpdateStruct = function (limitations) {
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
    UserService.prototype.loadRootUserGroup = function (callback) {
        var that = this;

        this._discoveryService.getInfoObject(
            "rootUserGroup",
            function (error, rootUserGroup) {
                if (error) {
                    callback(error, rootUserGroup);
                    return;
                }

                that._connectionManager.request(
                    "GET",
                    rootUserGroup._href,
                    "",
                    {"Accept": rootUserGroup["_media-type"]},
                    callback
                );
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
    UserService.prototype.loadUserGroup = function (userGroupId, callback) {
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
    UserService.prototype.loadUserGroupByRemoteId = function (userGroups, remoteId, callback) {
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
    UserService.prototype.deleteUserGroup = function (userGroupId, callback) {
        this._connectionManager.request(
            "DELETE",
            userGroupId,
            "",
            {},
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
    UserService.prototype.moveUserGroup = function (userGroupId, destination, callback) {
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
    UserService.prototype.createUserGroup = function (parentGroupId, userGroupCreateStruct, callback) {
        var that = this;

        this.loadUserGroup(
            parentGroupId,
            function (error, userGroupResponse) {
                if (error) {
                    callback(error, userGroupResponse);
                    return;
                }

                var subGroups = userGroupResponse.document.UserGroup.Subgroups;

                that._connectionManager.request(
                    "POST",
                    subGroups._href,
                    JSON.stringify(userGroupCreateStruct.body),
                    userGroupCreateStruct.headers,
                    callback
                );
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
    UserService.prototype.updateUserGroup = function (userGroupId, userGroupUpdateStruct, callback) {
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
    UserService.prototype.loadSubUserGroups = function (userGroupId, callback) {
        var that = this;

        this.loadUserGroup(
            userGroupId,
            function (error, userGroupResponse) {
                if (error) {
                    callback(error, userGroupResponse);
                    return;
                }

                var subGroups = userGroupResponse.document.UserGroup.Subgroups;

                that._connectionManager.request(
                    "GET",
                    subGroups._href,
                    "",
                    {"Accept": subGroups["_media-type"]},
                    callback
                );
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
    UserService.prototype.loadUsersOfUserGroup = function (userGroupId, callback) {
        var that = this;

        this.loadUserGroup(
            userGroupId,
            function (error, userGroupResponse) {
                if (error) {
                    callback(error, userGroupResponse);
                    return;
                }

                var users = userGroupResponse.document.UserGroup.Users;

                that._connectionManager.request(
                    "GET",
                    users._href,
                    "",
                    {"Accept": users["_media-type"]},
                    callback
                );
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
    UserService.prototype.loadUserGroupsOfUser = function (userId, callback) {
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
    UserService.prototype.createUser = function (userGroupId, userCreateStruct, callback) {
        var that = this;

        this.loadUserGroup(
            userGroupId,
            function (error, userGroupResponse) {
                if (error) {
                    callback(error, userGroupResponse);
                    return;
                }

                var users = userGroupResponse.document.UserGroup.Users;

                that._connectionManager.request(
                    "POST",
                    users._href,
                    JSON.stringify(userCreateStruct.body),
                    userCreateStruct.headers,
                    callback
                );
            }
        );
    };

    /**
     * Load users and usergroups for the target roleId
     *
     * @method getRoleAssignments
     * @param roleId {String} target role identifier (e.g. "/api/ezp/v2/user/roles/5")
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "UserService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    UserService.prototype.getRoleAssignments = function (roleId, callback) {
        var that = this;
        this._discoveryService.getInfoObject(
            "users",
            function (error, users) {
                if (error) {
                    callback(error, users);
                    return;
                }
                that._connectionManager.request(
                    "GET",
                    users._href + '?roleId=' + roleId,
                    "",
                    {"Accept": "application/vnd.ez.api.UserList+json"},
                    callback
                );
            }
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
    UserService.prototype.loadUser = function (userId, callback) {
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
    UserService.prototype.updateUser = function (userId, userUpdateStruct, callback) {
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
    UserService.prototype.deleteUser = function (userId, callback) {
        this._connectionManager.request(
            "DELETE",
            userId,
            "",
            {},
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
    UserService.prototype.assignUserToUserGroup = function (userId, userGroupId, callback) {
        var that = this;

        this.loadUser(
            userId,
            function (error, userResponse) {
                if (error) {
                    callback(error, userResponse);
                    return;
                }

                var userGroups = userResponse.document.User.UserGroups;

                that._connectionManager.request(
                    "POST",
                    userGroups._href + "?group=" + userGroupId,
                    "",
                    {"Accept": userGroups["_media-type"]},
                    callback
                );
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
    UserService.prototype.unassignUserFromUserGroup = function (userAssignedGroupId, callback) {
        this._connectionManager.request(
            "DELETE",
            userAssignedGroupId,
            "",
            {},
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
    UserService.prototype.createRole = function (roleCreateStruct, callback) {
        var that = this;

        this._discoveryService.getInfoObject(
            "roles",
            function (error, roles) {
                if (error) {
                    callback(error, roles);
                    return;
                }

                that._connectionManager.request(
                    "POST",
                    roles._href,
                    JSON.stringify(roleCreateStruct.body),
                    roleCreateStruct.headers,
                    callback
                );
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
    UserService.prototype.loadRole = function (roleId, callback) {
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
     * @param [identifier] {String} string identifier of the roles to search (e.g. "admin")
     * @param [limit=-1] {Number} the limit of the result set
     * @param [offset=0] {Number} the offset of the result set
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "UserService"}}Note on the callbacks usage{{/crossLink}} for more info)
     * @example
     *     userService.loadRoles("admin", 5, 5, callback);
     */
    UserService.prototype.loadRoles = function (identifier, limit, offset, callback) {

        var that = this,
            identifierQuery,
            defaultIdentifier = "",
            defaultLimit = -1,
            defaultOffset = 0;

        // default values for omitted parameters (if any)
        if (arguments.length < 4) {
            if (typeof identifier == "function") {
                // no optional params are passed
                callback = identifier;
                identifier = defaultIdentifier;
                limit = defaultLimit;
                offset = defaultOffset;
            } else if (typeof limit == "function") {
                // only identifier is passed
                callback = limit;
                limit = defaultLimit;
                offset = defaultOffset;
            } else {
                // identifier and limit are passed
                callback = offset;
                offset = defaultOffset;
            }
        }

        identifierQuery = (identifier === "") ? "" : "&identifier=" + identifier;

        this._discoveryService.getInfoObject(
            "roles",
            function (error, roles) {
                if (error) {
                    callback(error, roles);
                    return;
                }

                that._connectionManager.request(
                    "GET",
                    roles._href + '?offset=' + offset + '&limit=' + limit + identifierQuery,
                    "",
                    {"Accept": roles["_media-type"]},
                    callback
                );
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
    UserService.prototype.updateRole = function (roleId, roleUpdateStruct, callback) {
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
    UserService.prototype.deleteRole = function (roleId, callback) {
        this._connectionManager.request(
            "DELETE",
            roleId,
            "",
            {},
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
    UserService.prototype.getRoleAssignmentsForUser = function (userId, callback) {
        var that = this;

        this.loadUser(
            userId,
            function (error, userResponse) {
                if (error) {
                    callback(error, userResponse);
                    return;
                }

                var userRoles = userResponse.document.User.Roles;

                that._connectionManager.request(
                    "GET",
                    userRoles._href,
                    "",
                    {"Accept": userRoles["_media-type"]},
                    callback
                );
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
    UserService.prototype.getRoleAssignmentsForUserGroup = function (userGroupId, callback) {
        var that = this;

        this.loadUserGroup(
            userGroupId,
            function (error, userGroupResponse) {
                if (error) {
                    callback(error, userGroupResponse);
                    return;
                }

                var userGroupRoles = userGroupResponse.document.UserGroup.Roles;

                that._connectionManager.request(
                    "GET",
                    userGroupRoles._href,
                    "",
                    {"Accept": userGroupRoles["_media-type"]},
                    callback
                );
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
    UserService.prototype.getUserAssignmentObject = function (userAssignmentId, callback) {
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
    UserService.prototype.getUserGroupAssignmentObject = function (userGroupAssignmentId, callback) {
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
    UserService.prototype.assignRoleToUser = function (userId, roleAssignInputStruct, callback) {
        var that = this;

        this.loadUser(
            userId,
            function (error, userResponse) {
                if (error) {
                    callback(error, userResponse);
                    return;
                }

                var userRoles = userResponse.document.User.Roles;

                that._connectionManager.request(
                    "POST",
                    userRoles._href,
                    JSON.stringify(roleAssignInputStruct.body),
                    roleAssignInputStruct.headers,
                    callback
                );
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
    UserService.prototype.assignRoleToUserGroup = function (userGroupId, roleAssignInputStruct, callback) {
        var that = this;

        this.loadUserGroup(
            userGroupId,
            function (error, userGroupResponse) {
                if (error) {
                    callback(error, userGroupResponse);
                    return;
                }

                var userGroupRoles = userGroupResponse.document.UserGroup.Roles;

                that._connectionManager.request(
                    "POST",
                    userGroupRoles._href,
                    JSON.stringify(roleAssignInputStruct.body),
                    roleAssignInputStruct.headers,
                    callback
                );
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
    UserService.prototype.unassignRoleFromUser = function (userRoleId, callback) {
        this._connectionManager.request(
            "DELETE",
            userRoleId,
            "",
            {},
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
    UserService.prototype.unassignRoleFromUserGroup = function (userGroupRoleId, callback) {
        this._connectionManager.request(
            "DELETE",
            userGroupRoleId,
            "",
            {},
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
    UserService.prototype.addPolicy = function (roleId, policyCreateStruct, callback) {
        var that = this;

        this.loadRole(
            roleId,
            function (error, roleResponse) {
                if (error) {
                    callback(error, roleResponse);
                    return;
                }

                var rolePolicies = roleResponse.document.Role.Policies;

                that._connectionManager.request(
                    "POST",
                    rolePolicies._href,
                    JSON.stringify(policyCreateStruct.body),
                    policyCreateStruct.headers,
                    callback
                );
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
    UserService.prototype.loadPolicies = function (roleId, callback) {
        var that = this;

        this.loadRole(
            roleId,
            function (error, roleResponse) {
                if (error) {
                    callback(error, roleResponse);
                    return;
                }

                var rolePolicies = roleResponse.document.Role.Policies;

                that._connectionManager.request(
                    "GET",
                    rolePolicies._href,
                    "",
                    {"Accept": rolePolicies["_media-type"]},
                    callback
                );
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
    UserService.prototype.loadPolicy = function (policyId, callback) {
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
    UserService.prototype.updatePolicy = function (policyId, policyUpdateStruct, callback) {
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
    UserService.prototype.deletePolicy = function (policyId, callback) {
        this._connectionManager.request(
            "DELETE",
            policyId,
            "",
            {},
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
    UserService.prototype.loadPoliciesByUserId = function (userPolicies, userId, callback) {
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
     * Creates a session. This method **only** creates a session, for a complete
     * and correct authentication from CAPI point of view, you need to use
     * {{#crossLink "CAPI/logIn:method"}}the `logIn` method of the CAPI
     * object{{/crossLink}}
     *
     * @method createSession
     * @param sessionCreateStruct {SessionCreateStruct} object describing new session to be created (see "newSessionCreateStruct")
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "UserService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    UserService.prototype.createSession = function (sessionCreateStruct, callback) {
        var that = this;

        this._connectionManager.notAuthorizedRequest(
            "GET",
            this._rootPath,
            "",
            {"Accept": "application/vnd.ez.api.Root+json"},
            function (error, rootResource) {
                if (error) {
                    callback(error, rootResource);
                    return;
                }
                that._connectionManager.notAuthorizedRequest(
                    "POST",
                    rootResource.document.Root.createSession._href,
                    JSON.stringify(sessionCreateStruct.body),
                    sessionCreateStruct.headers,
                    callback
                );
            }
        );
    };

    /**
     * Calls the refresh session resource to check whether the current session
     * is valid. For a complete and correct *is logged in* check, you need to
     * use {{#crossLink "CAPI/isLoggedIn:method"}}CAPI.isLoggedIn{{/crossLink}}
     *
     * @method refreshSession
     * @param {String} sessionId the session identifier (e.g. "o7i8r1sapfc9r84ae53bgq8gp4")
     * @param {Function} callback
     */
    UserService.prototype.refreshSession = function (sessionId, callback) {
        var that = this;

        this._discoveryService.getInfoObject(
            "refreshSession",
            function (error, refreshSession) {
                if (error) {
                    callback(error, refreshSession);
                    return;
                }
                that._connectionManager.request(
                    "POST",
                    parseUriTemplate(refreshSession._href, {sessionId: sessionId}),
                    "",
                    {"Accept": refreshSession["_media-type"]},
                    callback
                );
            }
        );
    };

    /**
     * Delete the target session. For a complete and correct de-authentifcation,
     * you need to use {{#crossLink "CAPI/logOut:method"}}the `logOut` method of
     * the CAPI object{{/crossLink}}
     *
     * @method deleteSession
     * @param sessionId {String} target session identifier (e.g. "/api/ezp/v2/user/sessions/o7i8r1sapfc9r84ae53bgq8gp4")
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "UserService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    UserService.prototype.deleteSession = function (sessionId, callback) {
        this._connectionManager.request(
            "DELETE",
            sessionId,
            "",
            {},
            callback
        );
    };

    return UserService;
});
