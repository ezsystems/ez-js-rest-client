/* global define */
define(function () {
    "use strict";

    /**
     * Returns a structure used to update a Content Type object. See ContentTypeService.updateContentType() call
     *
     * @class ContentTypeUpdateStruct
     * @constructor
     */
    var ContentTypeUpdateStruct = function () {
        this.body = {};
        this.body.ContentTypeUpdate = {};

        this.headers = {};
        this.headers.Accept = "application/vnd.ez.api.ContentType+json";
        this.headers["Content-Type"] = "application/vnd.ez.api.ContentTypeUpdate+json";

        return this;
    };

    return ContentTypeUpdateStruct;

});