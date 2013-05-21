var SessionCreateStruct = (function() {
    "use strict";

    var SessionCreateStruct = function(login, password){

        this.body = {};
        this.body.SessionInput = {};

        this.body.SessionInput.login = login;
        this.body.SessionInput.password = password;

        this.headers = { "Accept" : "application/vnd.ez.api.Root+json" };

        return this;

    }

    return SessionCreateStruct;

}());