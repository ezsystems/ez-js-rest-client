/* global define */
define(function () {
    "use strict";

    /**
     * Returns a structure used to create and update a Content Type group. See
     * {{#crossLink "ContentTypeService/createContentTypeGroup"}}ContentTypeService.createContentTypeGroup{{/crossLink}}
     *
     * @class ContentTypeGroupInputStruct
     * @constructor
     * @param identifier {String} Unique identifier for the target Content Type group (e.g. "my_new_content_type_group")
     */
    var ContentTypeGroupInputStruct = function (identifier) {
        this.body = {};
        this.body.ContentTypeGroupInput = {};

        this.body.ContentTypeGroupInput.identifier = identifier;

        this.headers = {};
        this.headers.Accept = "application/vnd.ez.api.ContentTypeGroup+json";
        this.headers["Content-Type"] = "application/vnd.ez.api.ContentTypeGroupInput+json";

        return this;
    };

    return ContentTypeGroupInputStruct;

});