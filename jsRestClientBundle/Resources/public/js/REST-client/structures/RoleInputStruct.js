var RoleInputStruct = (function() {
    "use strict";

    var RoleInputStruct = function(identifier){

        this.body = {};
        this.body.RoleInput = {};

        this.body.RoleInput.identifier = identifier;

        this.headers = {};
        this.headers["Accept"] = "application/vnd.ez.api.Role+json";
        this.headers["Content-Type"] = "application/vnd.ez.api.RoleInput+json";

        return this;
    }

    return RoleInputStruct;

}());