/* global define */
define(function () {
    "use strict";

    /**
     * Returns a structure used to update a Content object. See
     * {{#crossLink "ContentService/updateContent"}}ContentService.updateContent{{/crossLink}}
     *
     * @class ContentUpdateStruct
     * @constructor
     * @param languageCode {String} The language code (eng-GB, fre-FR, ...)
     */
    var ContentUpdateStruct = function (languageCode) {
        var now = JSON.parse(JSON.stringify(new Date()));

        this.body = {};
        this.body.VersionUpdate = {};

        this.body.VersionUpdate.modificationDate = now;
        this.body.VersionUpdate.initialLanguageCode = languageCode;
        this.body.VersionUpdate.fields = {
            "field": []
        };

        this.headers = {
            "Accept": "application/vnd.ez.api.Version+json",
            "Content-Type": "application/vnd.ez.api.VersionUpdate+json"
        };

        return this;
    };

    return ContentUpdateStruct;

});
