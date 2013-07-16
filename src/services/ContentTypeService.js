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

        this._connectionManager = connectionManager;
        this._discoveryService = discoveryService;

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
    ContentTypeService.prototype.newContentTypeGroupInputStruct = function newContentTypeGroupInputStruct(identifier) {

        return new ContentTypeGroupInputStruct(identifier);

    };

    /**
     * @method newContentTypeCreateStruct
     * @param identifier {string}
     * @param languageCode {string}
     * @param names {Array}
     * @param user {string}
     * @return {ContentTypeCreateStruct}
     */
    ContentTypeService.prototype.newContentTypeCreateStruct = function newContentTypeCreateStruct(identifier, languageCode, names) {

        return new ContentTypeCreateStruct(identifier, languageCode, names);

    };

    /**
     * @method newContentTypeUpdateStruct
     * @return {ContentTypeCreateStruct}
     */
    ContentTypeService.prototype.newContentTypeUpdateStruct = function newContentTypeUpdateStruct() {

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
    ContentTypeService.prototype.newFieldDefinitionCreateStruct = function newFieldDefinitionCreateStruct(identifier, fieldType, fieldGroup, names) {

        return new FieldDefinitionCreateStruct(identifier, fieldType, fieldGroup, names);

    };

    /**
     * @method newFieldDefinitionUpdateStruct
     * @param identifier
     * @param fieldType
     * @param fieldGroup
     * @param names
     * @return {FieldDefinitionCreateStruct}
     */
    ContentTypeService.prototype.newFieldDefinitionUpdateStruct = function newFieldDefinitionUpdateStruct() {

        return new FieldDefinitionUpdateStruct();

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
    ContentTypeService.prototype.createContentTypeGroup = function createContentTypeGroup(contentTypeGroups, contentTypeGroupCreateStruct, callback) {
        this._connectionManager.request(
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
    ContentTypeService.prototype.loadContentTypeGroupsList = function loadContentTypeGroupsList(contentTypeGroups, callback) {
        this._connectionManager.request(
            "GET",
            contentTypeGroups,
            "",
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
    ContentTypeService.prototype.loadContentTypeGroup = function loadContentTypeGroup(contentTypeGroupId, callback) {
        this._connectionManager.request(
            "GET",
            contentTypeGroupId,
            "",
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
    /*jshint -W101 */
    ContentTypeService.prototype.updateContentTypeGroup = function updateContentTypeGroup(contentTypeGroupId, contentTypeGroupUpdateStruct, callback) {
        this._connectionManager.request(
            "PATCH",
            contentTypeGroupId,
            JSON.stringify(contentTypeGroupUpdateStruct.body),
            contentTypeGroupUpdateStruct.headers,
            callback
        );
    };
    /*jshint +W101 */

    /**
     * Delete content type group
     *
     * @method deleteContentTypeGroup
     * @param contentTypeGroupId {href}
     * @param callback {function} function, which will be executed on request success
     */
    ContentTypeService.prototype.deleteContentTypeGroup = function deleteContentTypeGroup(contentTypeGroupId, callback) {
        this._connectionManager.delete(
            contentTypeGroupId,
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
    ContentTypeService.prototype.loadContentTypes = function loadContentTypes(contentTypeGroupId, callback) {

        var that = this;

        this.loadContentTypeGroup(
            contentTypeGroupId,
            function(error, contentTypeGroupResponse){
                if (!error) {

                    var contentTypeGroup = JSON.parse(contentTypeGroupResponse.body).ContentTypeGroup;

                    that._connectionManager.request(
                        "GET",
                         contentTypeGroup.ContentTypes._href,
                        "",
                        { "Accept" : contentTypeGroup.ContentTypes["_media-type"] },
                        callback
                    );

                } else {
                    callback(error, false);
                }
            }
        );
    };

    /**
     * @method loadContentTypeGroupByIdentifier
     * @param contentTypeGroups {href}
     * @param identifier {string}
     * @param callback {Function}
     */
    /*jshint -W101 */
    ContentTypeService.prototype.loadContentTypeGroupByIdentifier = function loadContentTypeGroupByIdentifier(contentTypeGroups, identifier, callback) {
        this._connectionManager.request(
            "GET",
            contentTypeGroups + "?identifier=" + identifier,
            "",
            { "Accept" : "application/vnd.ez.api.ContentTypeGroup+json" },
            callback
        );
    };
    /*jshint +W101 */

// ******************************
// Content Types management
// ******************************


    /**
     * Create a content type
     *
     * @method createContentType
     * @param contentTypeGroupId {href}
     * @param contentTypeCreateStruct {Object}
     * @param publish {boolean}
     * @param callback {function} function, which will be executed on request success
     */
    ContentTypeService.prototype.createContentType = function createContentType(contentTypeGroupId, contentTypeCreateStruct, publish, callback) {

        var that = this;

        this.loadContentTypeGroup(
            contentTypeGroupId,
            function(error, contentTypeGroupResponse){
                if (!error) {

                    var contentTypeGroup = JSON.parse(contentTypeGroupResponse.body).ContentTypeGroup,
                        parameters = (publish === true) ? "?publish=true" : "";

                    that._connectionManager.request(
                        "POST",
                        contentTypeGroup.ContentTypes._href + parameters,
                        JSON.stringify(contentTypeCreateStruct.body),
                        contentTypeCreateStruct.headers,
                        callback
                    );

                } else {
                    callback(error, false);
                }
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
    ContentTypeService.prototype.copyContentType = function copyContentType(contentTypeId, callback) {
        this._connectionManager.request(
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
    ContentTypeService.prototype.loadContentType = function loadContentType(contentTypeId, callback) {
        this._connectionManager.request(
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
    ContentTypeService.prototype.loadContentTypeByIdentifier = function loadContentTypeByIdentifier(identifier, callback) {

        var that = this;

        this._discoveryService.getInfoObject(
            "contentTypes",
            function(error, contentTypes) {
                if (!error) {

                    that._connectionManager.request(
                        "GET",
                        contentTypes._href + "?identifier=" + identifier,
                        "",
                        { "Accept" : contentTypes["_media-type"] },
                        callback
                    );

                } else {
                    callback(error, false);
                }
            }
        );
    };

    /**
     * Delete content type
     *
     * @method deleteContentType
     * @param contentTypeId {href}
     * @param callback {function} function, which will be executed on request success
     */
    ContentTypeService.prototype.deleteContentType = function deleteContentType(contentTypeId, callback) {
        this._connectionManager.delete(
            contentTypeId,
            callback
        );
    };

    /**
     * Load content type groups
     *
     * @method loadContentTypeGroups
     * @param contentTypeId {href}
     * @param callback {function} function, which will be executed on request success
     */
    ContentTypeService.prototype.loadContentTypeGroups = function loadContentTypeGroups(contentTypeId, callback) {
        this._connectionManager.request(
            "GET",
            contentTypeId + '/groups',
            "",
            { "Accept" : "application/vnd.ez.api.ContentTypeGroupRefList+json" },
            callback
        );
    };


    /**
     * Assign a content type to a group
     *
     * @method assignContentTypeGroup
     * @param contentTypeId {href}
     * @param groupId{href}
     * @param callback {function} function, which will be executed on request success
     */
    ContentTypeService.prototype.assignContentTypeGroup = function assignContentTypeGroup(contentTypeId, groupId, callback) {
        this._connectionManager.request(
            "POST",
            contentTypeId + "/groups" + "?group=" + groupId,
            "",
            {},
            callback
        );
    };

    /**
     * Unassign a content type from group
     *
     * @method unassignContentTypeGroup
     * @param contentTypeAssignedGroupId {href} (/content/type/<ID>/groups/<ID>)
     * @param callback {function} function, which will be executed on request success
     */
    ContentTypeService.prototype.unassignContentTypeGroup = function unassignContentTypeGroup(contentTypeAssignedGroupId, callback) {
        this._connectionManager.delete(
            contentTypeAssignedGroupId,
            callback
        );
    };

// ******************************
// Drafts management
// ******************************

    /**
     * Create content type draft
     *
     * @method createContentTypeDraft
     * @param contentTypeId {href}
     * @param contentTypeUpdateStruct {Object}
     * @param callback {function} function, which will be executed on request success
     */
    ContentTypeService.prototype.createContentTypeDraft = function createContentTypeDraft(contentTypeId, contentTypeUpdateStruct, callback) {
        this._connectionManager.request(
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
    ContentTypeService.prototype.loadContentTypeDraft = function loadContentTypeDraft(contentTypeId, callback) {
        this._connectionManager.request(
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
    /*jshint -W101 */
    ContentTypeService.prototype.updateContentTypeDraftMetadata = function updateContentTypeDraftMetadata(contentTypeDraftId, contentTypeUpdateStruct, callback) {
        this._connectionManager.request(
            "PATCH",
            contentTypeDraftId,
            JSON.stringify(contentTypeUpdateStruct.body),
            contentTypeUpdateStruct.headers,
            callback
        );
    };
    /*jshint +W101 */

    /**
     * Publish content type draft
     *
     * @method publishContentTypeDraft
     * @param contentTypeDraftId {href}
     * @param callback {function} function, which will be executed on request success
     */
    ContentTypeService.prototype.publishContentTypeDraft = function publishContentTypeDraft(contentTypeDraftId, callback) {
        this._connectionManager.request(
            "PUBLISH",
            contentTypeDraftId,
            "",
            {},
            callback
        );
    };

    /**
     * Delete content type draft
     *
     * @method deleteContentTypeDraft
     * @param contentTypeDraftId {href}
     * @param callback {function} function, which will be executed on request success
     */
    ContentTypeService.prototype.deleteContentTypeDraft = function deleteContentTypeDraft(contentTypeDraftId, callback) {
        this._connectionManager.delete(
            contentTypeDraftId,
            callback
        );
    };

// ******************************
// Field Definitions management
// ******************************

    /**
     * Add field definition to exisiting Content Type draft
     *
     * @method addFieldDefinition
     * @param contentTypeId {href}
     * @param fieldDefinitionCreateStruct {Object}
     * @param callback {function} function, which will be executed on request success
     */
    ContentTypeService.prototype.addFieldDefinition = function addFieldDefinition(contentTypeId, fieldDefinitionCreateStruct, callback) {

        var that = this;

        this.loadContentTypeDraft(
            contentTypeId,
            function(error, contentTypeDraftResponse){
                if (!error) {

                    var contentTypeDraftFieldDefinitions = JSON.parse(contentTypeDraftResponse.body).ContentType.FieldDefinitions;

                    that._connectionManager.request(
                        "POST",
                        contentTypeDraftFieldDefinitions._href,
                        JSON.stringify(fieldDefinitionCreateStruct.body),
                        fieldDefinitionCreateStruct.headers,
                        callback
                    );

                } else {
                    callback(error, false);
                }
            }
        );
    };

    /**
     * Load existing field definition
     *
     * @method loadFieldDefinition
     * @param fieldDefinitionId {href}
     * @param callback {function} function, which will be executed on request success
     */
    ContentTypeService.prototype.loadFieldDefinition = function loadFieldDefinition(fieldDefinitionId, callback) {
        this._connectionManager.request(
            "GET",
            fieldDefinitionId,
            "",
            {
                "Accept": "application/vnd.ez.api.FieldDefinition+json"
            },
            callback
        );
    };

    /**
     * Update existing field definition
     *
     * @method updateFieldDefinition
     * @param fieldDefinitionId {href}
     * @param fieldDefinitionUpdateStruct {Object}
     * @param callback {function} function, which will be executed on request success
     */
    ContentTypeService.prototype.updateFieldDefinition = function updateFieldDefinition(fieldDefinitionId, fieldDefinitionUpdateStruct, callback) {
        this._connectionManager.request(
            "PATCH",
            fieldDefinitionId,
            JSON.stringify(fieldDefinitionUpdateStruct.body),
            fieldDefinitionUpdateStruct.headers,
            callback
        );
    };

    /**
     * Delete existing field definition
     *
     * @method deleteFieldDefinition
     * @param fieldDefinitionId {href}
     * @param callback {function} function, which will be executed on request success
     */
    ContentTypeService.prototype.deleteFieldDefinition = function deleteFieldDefinition(fieldDefinitionId, callback) {
        this._connectionManager.delete(
            fieldDefinitionId,
            callback
        );
    };

    return ContentTypeService;

}());

