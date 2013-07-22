var PolicyCreateStruct = (function() {
    "use strict";

    /**
     * Returns a structure used to create a new Policy. See UserService.createPolicy() call
     *
     * @class PolicyCreateStruct
     * @constructor
     * @param module {String} name of the module for which new policy should be active
     * @param theFunction {String} name of the function for which the new policy should be active
     * @param limitations {Object} object describing limitations for new policy
     */
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