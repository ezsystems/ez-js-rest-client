/* global define */
define(function () {
    "use strict";

    /**
     * Returns a structure used to create and update a Role Assign object. See for ex.
     * {{#crossLink "UserService/assignRoleToUser"}}UserService.assignRoleToUser{{/crossLink}}
     *
     * @class RoleAssignInputStruct
     * @constructor
     * @param role {Object} object representing the target role
     * @param limitation {Object} object representing limitations for assignment (see example in
     * {{#crossLink "UserService/newRoleAssignInputStruct"}}UserService.newRoleAssignInputStruct{{/crossLink}})
     */
    var RoleAssignInputStruct = function (role, limitation) {
        this.body = {};
        this.body.RoleAssignInput = {};

        this.body.RoleAssignInput.Role = role;

        this.body.RoleAssignInput.limitation = limitation;

        this.headers = {};
        this.headers.Accept = "application/vnd.ez.api.RoleAssignmentList+json";
        this.headers["Content-Type"] = "application/vnd.ez.api.RoleAssignInput+json";

        return this;
    };

    return RoleAssignInputStruct;

});