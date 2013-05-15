var ContentTypeService = (function() {
    "use strict";

    /**
     * Creates an instance of content type service object
     *
     * @constructor
     * @param connectionManager {Object} connection manager that will be used to send requests to REST service
     * @param discoveryService {Object}
     */
    var ContentTypeService = function(connectionManager, discoveryService) {

        this.connectionManager_ = connectionManager;
        this.discoveryService_ = discoveryService;

    };

// ******************************
// Structures
// ******************************

    /**
     * Returns content type group create structure
     *
     * @method newContentTypeGroupInputStruct
     * @param identifier {string}
     * @param languageCode {string}
     */
    ContentTypeService.prototype.newContentTypeGroupInputStruct = function(identifier, languageCode) {

        return new ContentTypeGroupInputStruct(identifier, languageCode);

    };

    /**
     * @method newContentTypeCreateStruct
     * @param identifier {string}
     * @param languageCode {string}
     * @param names {Array}
     * @param user {string}
     * @return {ContentTypeCreateStruct}
     */
    ContentTypeService.prototype.newContentTypeCreateStruct = function(identifier, languageCode, names, user) {

        return new ContentTypeCreateStruct(identifier, languageCode, names, user);

    };

    /**
     * @method newContentTypeUpdateStruct
     * @return {ContentTypeCreateStruct}
     */
    ContentTypeService.prototype.newContentTypeUpdateStruct = function() {

        return new ContentTypeUpdateStruct();

    };


    /**
     * @method newFieldDefinitionCreateStruct
     * @param identifier
     * @param fieldType
     * @param fieldGroup
     * @param names
     * @return {FieldDefinitionCreateStruct}
     */
    ContentTypeService.prototype.newFieldDefinitionCreateStruct = function(identifier, fieldType, fieldGroup, names) {

        return new FieldDefinitionCreateStruct(identifier, fieldType, fieldGroup, names);

    };


// ******************************
// Content Types Groups management
// ******************************

    /**
     * Create a content type group
     *
     * @method createContentTypeGroup
     * @param contentTypeGroups {href}
     * @param contentTypeGroupCreateStruct {Object}
     * @param callback {function} function, which will be executed on request success
     */
    ContentTypeService.prototype.createContentTypeGroup = function(contentTypeGroups, contentTypeGroupCreateStruct, callback) {
        this.connectionManager_.request(
            "POST",
            contentTypeGroups,
            JSON.stringify(contentTypeGroupCreateStruct.body),
            contentTypeGroupCreateStruct.headers,
            callback
        );
    };


    /**
     * Load all content type groups
     *
     * @method loadContentTypeGroups
     * @param contentTypeGroups {href} reference to type groups resource
     * @param callback {function} function, which will be executed on request success
     */
    ContentTypeService.prototype.loadContentTypeGroups = function(contentTypeGroups, callback) {
        this.connectionManager_.request(
            "GET",
            contentTypeGroups,
            {},
            { "Accept" : "application/vnd.ez.api.ContentTypeGroupList+json" },
            callback
        );
    };

    /**
     * Load single content type group
     *
     * @method loadContentTypeGroups
     * @param contentTypeGroupId {href}
     * @param callback {function} function, which will be executed on request success
     */
    ContentTypeService.prototype.loadContentTypeGroup = function(contentTypeGroupId, callback) {
        this.connectionManager_.request(
            "GET",
            contentTypeGroupId,
            {},
            { "Accept" : "application/vnd.ez.api.ContentTypeGroup+json" },
            callback
        );
    };


    /**
     * Update a content type group
     *
     * @method updateContentTypeGroup
     * @param contentTypeGroupId {href}
     * @param contentTypeGroupUpdateStruct {Object}
     * @param callback {function} function, which will be executed on request success
     */
    ContentTypeService.prototype.updateContentTypeGroup = function(contentTypeGroupId, contentTypeGroupUpdateStruct, callback) {
        this.connectionManager_.request(
            "PATCH",
            contentTypeGroupId,
            JSON.stringify(contentTypeGroupUpdateStruct.body),
            contentTypeGroupUpdateStruct.headers,
            callback
        );
    };

    /**
     * Delete content type group
     *
     * @method deleteContentTypeGroup
     * @param contentTypeGroupId {href}
     * @param callback {function} function, which will be executed on request success
     */
    ContentTypeService.prototype.deleteContentTypeGroup = function(contentTypeGroupId, callback) {
        this.connectionManager_.request(
            "DELETE",
            contentTypeGroupId,
            "",
            {},
            callback
        );
    };

    /**
     * List content for a content type group
     *
     * @method loadContentTypes
     * @param contentTypeGroupId {href}
     * @param callback {function} function, which will be executed on request success
     */
    ContentTypeService.prototype.loadContentTypes = function(contentTypeGroupId, callback) {

        var that = this;

        this.loadContentTypeGroup(
            contentTypeGroupId,
            function(error, contentTypeGroupResponse){

                var contentTypeGroup = JSON.parse(contentTypeGroupResponse.body).ContentTypeGroup;

                that.connectionManager_.request(
                    "GET",
                     contentTypeGroup.ContentTypes["_href"],
                    "",
                    { "Accept" : contentTypeGroup.ContentTypes["_media-type"] },
                    callback
                );

            }
        );
    };

    /**
     * Create a content type
     *
     * @method createContentType
     * @param contentTypeGroupId {href}
     * @param contentTypeCreateStruct {Object}
     * @param publish {boolean}
     * @param callback {function} function, which will be executed on request success
     */
    ContentTypeService.prototype.createContentType = function(contentTypeGroupId, contentTypeCreateStruct, publish, callback) {

        var that = this;

        this.loadContentTypeGroup(
            contentTypeGroupId,
            function(error, contentTypeGroupResponse){

                var contentTypeGroup = JSON.parse(contentTypeGroupResponse.body).ContentTypeGroup;
                var parameters = (publish === true) ? "?publish=true" : "";

                that.connectionManager_.request(
                    "POST",
                    contentTypeGroup.ContentTypes["_href"] + parameters,
                    JSON.stringify(contentTypeCreateStruct.body),
                    contentTypeCreateStruct.headers,
                    callback
                );

            }
        );
    };

    /**
     * Copy content type
     *
     * @method copyContentType
     * @param contentTypeId {href}
     * @param callback {function} function, which will be executed on request success
     */
    ContentTypeService.prototype.copyContentType = function(contentTypeId, callback) {
        this.connectionManager_.request(
            "COPY",
            contentTypeId,
            "",
            {},
            callback
        );
    };

    /**
     * Load content type
     *
     * @method loadContentType
     * @param contentTypeId {href}
     * @param callback {function} function, which will be executed on request success
     */
    ContentTypeService.prototype.loadContentType = function(contentTypeId, callback) {
        this.connectionManager_.request(
            "GET",
            contentTypeId,
            "",
            { "Accept" : "application/vnd.ez.api.ContentType+json" },
            callback
        );
    };

    /**
     * @method loadContentTypeByIdentifier
     * @param identifier {string}
     * @param callback {Function}
     */
    ContentTypeService.prototype.loadContentTypeByIdentifier = function(identifier, callback) {

        var that = this;

        this.discoveryService_.getInfoObject(
            "contentTypes",
            function(error, contentTypes) {
                if (!error) {

                    that.connectionManager_.request(
                        "GET",
                        contentTypes["_href"] + "?identifier=" + identifier,
                        {},
                        { "Accept" : contentTypes["_media-type"] },
                        callback
                    );

                } else {
                    callback(error, false)
                }
            }
        );
    };

    /**
     * Create content type draft
     *
     * @method createContentTypeDraft
     * @param contentTypeId {href}
     * @param contentTypeUpdateStruct {Object}
     * @param callback {function} function, which will be executed on request success
     */
    ContentTypeService.prototype.createContentTypeDraft = function(contentTypeId, contentTypeUpdateStruct, callback) {
        this.connectionManager_.request(
            "POST",
            contentTypeId,
            JSON.stringify(contentTypeUpdateStruct.body),
            contentTypeUpdateStruct.headers,
            callback
        );
    };

    /**
     * Load content type draft
     *
     * @method loadContentTypeDraft
     * @param contentTypeId {href}
     * @param callback {function} function, which will be executed on request success
     */
    ContentTypeService.prototype.loadContentTypeDraft = function(contentTypeId, callback) {
        this.connectionManager_.request(
            "GET",
            contentTypeId + "/draft",
            "",
            { "Accept" : "application/vnd.ez.api.ContentType+json" },
            callback
        );
    };

    /**
     * Update content type draft metadata. This method does not handle field definitions
     *
     * @method updateContentTypeDraftMetadata
     * @param contentTypeDraftId {href}
     * @param contentTypeUpdateStruct {Object}
     * @param callback {function} function, which will be executed on request success
     */
    ContentTypeService.prototype.updateContentTypeDraftMetadata = function(contentTypeDraftId, contentTypeUpdateStruct, callback) {
        this.connectionManager_.request(
            "PATCH",
            contentTypeDraftId,
            JSON.stringify(contentTypeUpdateStruct.body),
            contentTypeUpdateStruct.headers,
            callback
        );
    };

    /**
     * Add field definition to exisiting Content Type draft
     *
     * @method addFieldDefinition
     * @param contentTypeDraftId {href}
     * @param fieldDefinitionCreateStruct {Object}
     * @param callback {function} function, which will be executed on request success
     */
    ContentTypeService.prototype.addFieldDefinition = function(contentTypeId, fieldDefinitionCreateStruct, callback) {

        var that = this;

        //TODO: loadContentTypeDraft(contentTypeId) here and use FieldDefinitions href and media-type

        this.connectionManager_.request(
            "POST",
            contentTypeDraftFieldDefinitions["_href"],
            JSON.stringify(fieldDefinitionCreateStruct.body),
            fieldDefinitionCreateStruct.headers,
            callback
        );


    };

    return ContentTypeService;

}());

