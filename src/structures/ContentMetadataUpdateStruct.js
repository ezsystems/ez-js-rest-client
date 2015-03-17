/* global define */
define(function () {
    "use strict";

    /**
     * The Content Update structure that can be used with {{#crossLink
     * "ContentService/updateContentMetadata"}}ContentService.updateContentMetadata{{/crossLink}}
     *
     * @class ContentMetadataUpdateStruct
     * @constructor
     */
    var ContentMetadataUpdateStruct = function () {
        this.body = {'ContentUpdate': {}};

        this.headers = {
            "Accept": "application/vnd.ez.api.ContentInfo+json",
            "Content-Type": "application/vnd.ez.api.ContentUpdate+json"
        };
    };

    return ContentMetadataUpdateStruct;

});
