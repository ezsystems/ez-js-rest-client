var UserUpdateStruct = (function() {
    "use strict";

    /**
     *  Returns an update structure for User
     *
     * @constructor
     */
    var UserUpdateStruct = function(){

        this.body = {};
        this.body.UserUpdate = {};

        this.body.UserUpdate.fields = {};
        this.body.UserUpdate.fields.field = [];

        this.headers = {};
        this.headers["Accept"] = "application/vnd.ez.api.User+json";
        this.headers["Content-Type"] = "application/vnd.ez.api.UserUpdate+json";

        return this;

    }

    return UserUpdateStruct;

}());