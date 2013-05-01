var SessionCreateStruct = (function() {
    "use strict";

    var SessionCreateStruct = function(login, password){

        this.SessionInput = {};

        this.SessionInput.login = login;
        this.SessionInput.password = password;

        return this;

    }

    return SessionCreateStruct;

}());