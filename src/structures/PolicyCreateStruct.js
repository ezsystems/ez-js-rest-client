var PolicyCreateStruct = (function() {
    "use strict";

    var PolicyCreateStruct = function(module, theFunction, limitations){

        this.body = {};
        this.body.PolicyCreate = {};

        this.body.PolicyCreate.module = module;
        this.body.PolicyCreate.function = theFunction;

        this.body.PolicyCreate.limitations = {};
        this.body.PolicyCreate.limitations.limitation = limitations;

        this.headers = {};
        this.headers.Accept = "application/vnd.ez.api.Policy+json";
        this.headers["Content-Type"] = "application/vnd.ez.api.PolicyCreate+json";

        return this;
    };

    return PolicyCreateStruct;

}());