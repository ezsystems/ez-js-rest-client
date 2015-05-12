/* global define */
define(function () {
    "use strict";

    /**
     * Returns a structure used to create a new Content object. See
     * {{#crossLink "ContentService/createContent"}}ContentService.createContent{{/crossLink}}
     *
     * @class ContentCreateStruct
     * @constructor
     * @param contentTypeId {String} Content Type id (e.g. "/api/ezp/v2/content/types/16")
     * @param locationCreateStruct {LocationCreateStruct} create structure for a Location object, where the new Content object will be situated
     * @param languageCode {String} The language code (e.g. "eng-GB")
     */
    var ContentCreateStruct = function (contentTypeId, locationCreateStruct, languageCode) {
        var now = JSON.parse(JSON.stringify(new Date()));

        this.body = {};
        this.body.ContentCreate = {};

        this.body.ContentCreate.ContentType = {
                "_href": contentTypeId
            };

        this.body.ContentCreate.mainLanguageCode = languageCode;
        this.body.ContentCreate.LocationCreate = locationCreateStruct.body.LocationCreate;

        this.body.ContentCreate.Section = null;
        this.body.ContentCreate.alwaysAvailable = "true";
        this.body.ContentCreate.remoteId = null;
        this.body.ContentCreate.modificationDate = now;
        this.body.ContentCreate.fields = {};
        this.body.ContentCreate.fields.field = [];

        this.headers = {
            "Accept": "application/vnd.ez.api.Content+json",
            "Content-Type": "application/vnd.ez.api.ContentCreate+json"
        };

        return this;
    };

    /**
     * Adds a new field and its value into the structure
     *
     * @method addField
     * @param id {Number}  field id
     * @param fieldIdentifer {String} field identifier
     * @param fieldValue {Mixed} field value
     *
     * @return {ContentCreateStruct}
     */
    ContentCreateStruct.prototype.addField = function (fieldIdentifer, fieldValue) {
        this.body.ContentCreate.fields.field.push({
            fieldDefinitionIdentifier: fieldIdentifer,
            fieldValue: fieldValue,
        });

        return this;
    };

    return ContentCreateStruct;
});
