var RoleAssignInputStruct = (function() {
    "use strict";

    var RoleAssignInputStruct = function(role, limitation){

        this.body = {};
        this.body.RoleAssignInput = {};

        this.body.RoleAssignInput.Role = role;

        this.body.RoleAssignInput.limitation = limitation;

        this.headers = {};
        this.headers["Accept"] = "application/vnd.ez.api.RoleAssignmentList+json";
        this.headers["Content-Type"] = "application/vnd.ez.api.RoleAssignInput+json";

        return this;
    }

    return RoleAssignInputStruct;

}());