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

                that.connectionManager_.request(
                    "GET",
                    rootUserGroup["_href"],
                    "",
                    {
                        "Accept" : rootUserGroup["_media-type"]
                    },
                    callback
                );

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

                var subGroups = JSON.parse(userGroupResponse.body).UserGroup.Subgroups;

                that.connectionManager_.request(
                    "POST",
                    subGroups["_href"],
                    JSON.stringify(userGroupCreateStruct.body),
                    userGroupCreateStruct.headers,
                    callback
                );
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
        this.connectionManager_.request(
            "POST",
            sessions,
            JSON.stringify(sessionCreateStruct.body),
            sessionCreateStruct.headers,
            callback
        );
    };

    return UserService;

}());

