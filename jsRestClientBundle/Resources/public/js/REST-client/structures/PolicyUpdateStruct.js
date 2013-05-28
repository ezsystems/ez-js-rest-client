var PolicyUpdateStruct = (function() {
    "use strict";

    var PolicyUpdateStruct = function(limitations){

        this.body = {};
        this.body.PolicyUpdate = {};

        this.body.PolicyUpdate.limitations = {}
        this.body.PolicyUpdate.limitations.limitation = limitations;

        this.headers = {};
        this.headers["Accept"] = "application/vnd.ez.api.Policy+json";
        this.headers["Content-Type"] = "application/vnd.ez.api.PolicyUpdate+json";

        return this;
    }

    return PolicyUpdateStruct;

}());