/* global define */
define(function () {
    "use strict";

    /**
     * Class describing any error which could be thrown during CAPI workflow
     *
     * @class CAPIError
     * @constructor
     * @param message {String} error message
     * @param additionalInfo {Object} object literal containing any additional error properties
     */
    var CAPIError = function (message, additionalInfo) {
        this.name = "CAPIError";
        this.message = message;
        this.additionalInfo = additionalInfo;
    };

    CAPIError.prototype = new Error();

    CAPIError.prototype.constructor = CAPIError;

    return CAPIError;

});