/* global define */
define(function () {
    "use strict";

    /**
     * Returns a structure used to update a Policy. See UserService.updatePolicy() call
     *
     * @class PolicyUpdateStruct
     * @constructor
     * @param limitations {Object} object describing limitations change for the policy
     */
    var PolicyUpdateStruct = function(limitations){

        this.body = {};
        this.body.PolicyUpdate = {};

        this.body.PolicyUpdate.limitations = {};
        this.body.PolicyUpdate.limitations.limitation = limitations;

        this.headers = {};
        this.headers.Accept = "application/vnd.ez.api.Policy+json";
        this.headers["Content-Type"] = "application/vnd.ez.api.PolicyUpdate+json";

        return this;
    };

    return PolicyUpdateStruct;

});