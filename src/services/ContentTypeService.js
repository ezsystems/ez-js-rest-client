/* global define */
define(["structures/ContentTypeGroupInputStruct", "structures/ContentTypeCreateStruct", "structures/ContentTypeUpdateStruct",
        "structures/FieldDefinitionCreateStruct", "structures/FieldDefinitionUpdateStruct", "utils/uriparse"],
    function (ContentTypeGroupInputStruct, ContentTypeCreateStruct, ContentTypeUpdateStruct,
              FieldDefinitionCreateStruct, FieldDefinitionUpdateStruct, parseUriTemplate) {
    "use strict";

    /**
     * Creates an instance of content type service object. Should be retrieved from CAPI instance (see example).
     *
     * ## Note on the *callbacks* usage
     *
     * The **callback** argument of the service methods always take 2 arguments:
     *
     *    *     **error** either `false` or {{#crossLink "CAPIError"}}CAPIError{{/crossLink}} object when an error occurred
     *
     *    *     **response** the {{#crossLink "Response"}}Response{{/crossLink}} object
     *
     * Example:
     *
     *     var contentTypeGroupCreateStruct = contentTypeService.newContentTypeGroupInputStruct(
     *         "new-group-id"
     *     );
     *
     *     contentTypeService..createContentTypeGroup(
     *         "/api/ezp/v2/content/typegroups",
     *         contentTypeGroupCreateStruct,
     *         function (error, response) {
     *            if (error) {
     *                console.log('An error occurred', error);
     *            } else {
     *                console.log('Success!', response);
     *            }
     *     });
     *
     * @class ContentTypeService
     * @constructor
     * @param connectionManager {ConnectionManager} connection manager that will be used to send requests to REST service
     * @param discoveryService {DiscoveryService} discovery service is used for urls auto-discovery automation
     * @example
     *     var contentTypeService = jsCAPI.getContentTypeService();
     */
    var ContentTypeService = function (connectionManager, discoveryService) {
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
     * @param identifier {String} unique content type group identifer (e.g. "my-group")
     * @return {ContentTypeGroupInputStruct}
     */
    ContentTypeService.prototype.newContentTypeGroupInputStruct = function (identifier) {
        return new ContentTypeGroupInputStruct(identifier);
    };

    /**
     * @method newContentTypeCreateStruct
     * @param identifier {String} unique content type identifer (e.g. "my-type")
     * @param languageCode {String} The language code (eng-GB, fre-FR, ...)
     * @param names {Array} Multi language value (see example)
     * @return {ContentTypeCreateStruct}
     * @example
     *      var contentTypeCreateStruct = contentTypeService.newContentTypeCreateStruct(
     *          "some-id", "eng-US", [{
     *              "_languageCode":"eng-US",
     *              "#text":"Some Name"
     *          }]
     *      );
     */
    ContentTypeService.prototype.newContentTypeCreateStruct = function (identifier, languageCode, names) {
        return new ContentTypeCreateStruct(identifier, languageCode, names);
    };

    /**
     * @method newContentTypeUpdateStruct
     * @return {ContentTypeUpdateStruct}
     */
    ContentTypeService.prototype.newContentTypeUpdateStruct = function () {
        return new ContentTypeUpdateStruct();
    };

    /**
     * @method newFieldDefinitionCreateStruct
     * @param identifier {String} unique field definiton identifer (e.g. "my-field")
     * @param fieldType {String} identifier of existing field type (e.g. "ezstring", "ezdate")
     * @param fieldGroup {String} identifier of existing field group (e.g. "content", "meta")
     * @param names {Array} Multi language value (see example)
     * @return {FieldDefinitionCreateStruct}
     * @example
     *     var fieldDefinition = contentTypeService.newFieldDefinitionCreateStruct(
     *         "my-new-field", "ezstring", "content", [{
     *             "_languageCode":"eng-US",
     *             "#text":"Subtitle"
     *         }]
     *     );
     */
    ContentTypeService.prototype.newFieldDefinitionCreateStruct = function (identifier, fieldType, fieldGroup, names) {
        return new FieldDefinitionCreateStruct(identifier, fieldType, fieldGroup, names);
    };

    /**
     * @method newFieldDefinitionUpdateStruct
     * @return {FieldDefinitionUpdateStruct}
     */
    ContentTypeService.prototype.newFieldDefinitionUpdateStruct = function () {
        return new FieldDefinitionUpdateStruct();
    };

// ******************************
// Content Types Groups management
// ******************************

    /**
     * Create a content type group
     *
     * @method createContentTypeGroup
     * @param contentTypeGroups {String} link to root ContentTypeGroups resource (should be auto-discovered)
     * @param contentTypeGroupCreateStruct {ContentTypeGroupInputStruct} object describing the new group to be created
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentTypeService"}}Note on the callbacks usage{{/crossLink}} for more info)
     * @example
     *
     *
     *     var contentTypeGroupCreateStruct = contentTypeService.newContentTypeGroupInputStruct(
     *         "new-group-id"
     *     );
     *
     *     contentTypeService.createContentTypeGroup(
     *         "/api/ezp/v2/content/typegroups",
     *         contentTypeGroupCreateStruct,
     *         callback
     *     );
     */
    ContentTypeService.prototype.createContentTypeGroup = function (contentTypeGroups, contentTypeGroupCreateStruct, callback) {
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
     * @param contentTypeGroups {String} link to root ContentTypeGroups resource (should be auto-discovered)
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentTypeService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    ContentTypeService.prototype.loadContentTypeGroups = function (contentTypeGroups, callback) {
        this._connectionManager.request(
            "GET",
            contentTypeGroups,
            "",
            {"Accept": "application/vnd.ez.api.ContentTypeGroupList+json"},
            callback
        );
    };

    /**
     * Load single content type group
     *
     * @method loadContentTypeGroup
     * @param contentTypeGroupId {String} target content type group identifier (e.g. "/api/ezp/v2/content/types/100")
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentTypeService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    ContentTypeService.prototype.loadContentTypeGroup = function (contentTypeGroupId, callback) {
        this._connectionManager.request(
            "GET",
            contentTypeGroupId,
            "",
            {"Accept": "application/vnd.ez.api.ContentTypeGroup+json"},
            callback
        );
    };

    /**
     * Update a content type group
     *
     * @method updateContentTypeGroup
     * @param contentTypeGroupId {String} target content type group identifier (e.g. "/api/ezp/v2/content/types/100")
     * @param contentTypeGroupUpdateStruct {ContentTypeGroupInputStruct} object describing changes to the content type group
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentTypeService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    ContentTypeService.prototype.updateContentTypeGroup = function (contentTypeGroupId, contentTypeGroupUpdateStruct, callback) {
        this._connectionManager.request(
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
     * @param contentTypeGroupId {String}
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentTypeService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    ContentTypeService.prototype.deleteContentTypeGroup = function (contentTypeGroupId, callback) {
        this._connectionManager.request(
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
     * @param contentTypeGroupId {String} target content type group identifier (e.g. "/api/ezp/v2/content/typegroups/1")
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentTypeService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    ContentTypeService.prototype.loadContentTypes = function (contentTypeGroupId, callback) {
        var that = this;

        this.loadContentTypeGroup(
            contentTypeGroupId,
            function (error, contentTypeGroupResponse) {
                if (error) {
                    callback(error, false);
                    return;
                }

                var contentTypeGroup = contentTypeGroupResponse.document.ContentTypeGroup;

                that._connectionManager.request(
                    "GET",
                     contentTypeGroup.ContentTypes._href,
                    "",
                    {"Accept": contentTypeGroup.ContentTypes["_media-type"]},
                    callback
                );
            }
        );
    };

    /**
     * @method loadContentTypeGroupByIdentifier
     * @param contentTypeGroups {String} link to root ContentTypeGroups resource (should be auto-discovered)
     * @param identifier {String} target content type group identifier (e.g. "content")
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentTypeService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    ContentTypeService.prototype.loadContentTypeGroupByIdentifier = function (contentTypeGroups, identifier, callback) {
        this._connectionManager.request(
            "GET",
            contentTypeGroups + "?identifier=" + identifier,
            "",
            {"Accept": "application/vnd.ez.api.ContentTypeGroup+json"},
            callback
        );
    };

// ******************************
// Content Types management
// ******************************

    /**
     * Create a content type
     *
     * @method createContentType
     * @param contentTypeGroupId {String} target content type group identifier (e.g. "/api/ezp/v2/content/typegroups/1")
     * @param contentTypeCreateStruct {ContentTypeCreateStruct} object describing the new content type to be created
     * @param publish {Boolean} weather the content type should be immediately published or not
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentTypeService"}}Note on the callbacks usage{{/crossLink}} for more info)
     * @example
     *
     *     var contentTypeCreateStruct, fieldDefinition;
     *
     *     contentTypeCreateStruct = contentTypeService.newContentTypeCreateStruct(
     *          "some-id", "eng-US", [{
     *              "_languageCode":"eng-US",
     *              "#text":"Some Name"
     *          }]
     *     );
     *
     *     fieldDefinition = contentTypeService.newFieldDefinitionCreateStruct(
     *         "my-new-field", "ezstring", "content", [{
     *             "_languageCode":"eng-US",
     *             "#text":"Subtitle"
     *         }]
     *     );
     *
     *     contentTypeCreateStruct.body.ContentTypeCreate.FieldDefinitions.FieldDefinition.push(fieldDefinition.body.FieldDefinitionCreate);
     *
     *     contentTypeService.createContentType(
     *         "/api/ezp/v2/content/typegroups/1",
     *         contentTypeCreateStruct,
     *         true,
     *         callback
     *     );
     */
    ContentTypeService.prototype.createContentType = function (contentTypeGroupId, contentTypeCreateStruct, publish, callback) {
        var that = this;

        this.loadContentTypeGroup(
            contentTypeGroupId,
            function (error, contentTypeGroupResponse) {
                if (error) {
                    callback(error, false);
                    return;
                }

                var contentTypeGroup = contentTypeGroupResponse.document.ContentTypeGroup,
                    parameters = (publish === true) ? "?publish=true": "";

                that._connectionManager.request(
                    "POST",
                    contentTypeGroup.ContentTypes._href + parameters,
                    JSON.stringify(contentTypeCreateStruct.body),
                    contentTypeCreateStruct.headers,
                    callback
                );
            }
        );
    };

    /**
     * Make a copy of the target content type
     *
     * @method copyContentType
     * @param contentTypeId {String} target content type identifier (e.g. "/api/ezp/v2/content/types/18")
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentTypeService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    ContentTypeService.prototype.copyContentType = function (contentTypeId, callback) {
        this._connectionManager.request(
            "COPY",
            contentTypeId,
            "",
            {},
            callback
        );
    };

    /**
     * Load the target content type
     *
     * @method loadContentType
     * @param contentTypeId {String} target content type identifier (e.g. "/api/ezp/v2/content/types/18")
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentTypeService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    ContentTypeService.prototype.loadContentType = function (contentTypeId, callback) {
        this._connectionManager.request(
            "GET",
            contentTypeId,
            "",
            {"Accept": "application/vnd.ez.api.ContentType+json"},
            callback
        );
    };

    /**
     * Load content type by the string identifier
     *
     * @method loadContentTypeByIdentifier
     * @param identifier {String} target content type string identifier (e.g. "blog")
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentTypeService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    ContentTypeService.prototype.loadContentTypeByIdentifier = function (identifier, callback) {
        var that = this;

        this._discoveryService.getInfoObject(
            "contentTypeByIdentifier",
            function (error, contentTypeByIdentifier) {
                if (error) {
                    callback(error, false);
                    return;
                }
                that._connectionManager.request(
                    "GET",
                    parseUriTemplate(contentTypeByIdentifier._href, {identifier: identifier}),
                    "",
                    {"Accept": "application/vnd.ez.api.ContentTypeInfoList+json"},
                    callback
                );
            }
        );
    };

    /**
     * Delete the target content type
     *
     * @method deleteContentType
     * @param contentTypeId {String} target content type identifier (e.g. "/api/ezp/v2/content/types/18")
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentTypeService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    ContentTypeService.prototype.deleteContentType = function (contentTypeId, callback) {
        this._connectionManager.request(
            "DELETE",
            contentTypeId,
            "",
            {},
            callback
        );
    };

    /**
     * Load content type groups of the target content type
     *
     * @method loadGroupsOfContentType
     * @param contentTypeId {String} target content type identifier (e.g. "/api/ezp/v2/content/types/18")
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentTypeService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    ContentTypeService.prototype.loadGroupsOfContentType = function (contentTypeId, callback) {
        this._connectionManager.request(
            "GET",
            contentTypeId + '/groups',
            "",
            {"Accept": "application/vnd.ez.api.ContentTypeGroupRefList+json"},
            callback
        );
    };

    /**
     * Assign the target content type to the target content type group
     *
     * @method assignContentTypeGroup
     * @param contentTypeId {String} target content type identifier (e.g. "/api/ezp/v2/content/types/18")
     * @param groupId{String} target content type group identifier (e.g. "/api/ezp/v2/content/typegroups/2")
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentTypeService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    ContentTypeService.prototype.assignContentTypeGroup = function (contentTypeId, groupId, callback) {
        this._connectionManager.request(
            "POST",
            contentTypeId + "/groups" + "?group=" + groupId,
            "",
            {},
            callback
        );
    };

    /**
     * Remove content type assignment to the target content type group
     *
     * @method unassignContentTypeGroup
     * @param contentTypeAssignedGroupId {String} target content type group assignment  (e.g. "/api/ezp/v2/content/types/18/groups/1")
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentTypeService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    ContentTypeService.prototype.unassignContentTypeGroup = function (contentTypeAssignedGroupId, callback) {
        this._connectionManager.request(
            "DELETE",
            contentTypeAssignedGroupId,
            "",
            {},
            callback
        );
    };

// ******************************
// Drafts management
// ******************************

    /**
     * Create a new content type draft based on the target content type
     *
     * @method createContentTypeDraft
     * @param contentTypeId {String} target content type identifier (e.g. "/api/ezp/v2/content/types/18")
     * @param contentTypeUpdateStruct {ContentTypeUpdateStruct} object describing changes to the content type
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentTypeService"}}Note on the callbacks usage{{/crossLink}} for more info)
     * @example
     *     var contentTypeUpdateStruct = contentTypeService.newContentTypeUpdateStruct();
     *
     *     contentTypeUpdateStruct.names = {};
     *     contentTypeUpdateStruct.names.value = [{
     *         "_languageCode":"eng-US",
     *         "#text":"My changed content type"
     *     }]
     *
     *     contentTypeService.createContentTypeDraft(
     *         "/api/ezp/v2/content/types/18",
     *         contentTypeUpdateStruct,
     *         callback
     *     );
     */
    ContentTypeService.prototype.createContentTypeDraft = function (contentTypeId, contentTypeUpdateStruct, callback) {
        this._connectionManager.request(
            "POST",
            contentTypeId,
            JSON.stringify(contentTypeUpdateStruct.body),
            contentTypeUpdateStruct.headers,
            callback
        );
    };

    /**
     * Load draft of the target content type
     *
     * @method loadContentTypeDraft
     * @param contentTypeId {String} target content type identifier (e.g. "/api/ezp/v2/content/types/18")
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentTypeService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    ContentTypeService.prototype.loadContentTypeDraft = function (contentTypeId, callback) {
        this._connectionManager.request(
            "GET",
            contentTypeId + "/draft",
            "",
            {"Accept": "application/vnd.ez.api.ContentType+json"},
            callback
        );
    };

    /**
     * Update the target content type draft metadata. This method does not handle field definitions
     *
     * @method updateContentTypeDraftMetadata
     * @param contentTypeDraftId {String} target content type draft identifier (e.g. "/api/ezp/v2/content/types/18/draft")
     * @param contentTypeUpdateStruct {ContentTypeUpdateStruct} object describing changes to the draft
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentTypeService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    ContentTypeService.prototype.updateContentTypeDraftMetadata = function (contentTypeDraftId, contentTypeUpdateStruct, callback) {
        this._connectionManager.request(
            "PATCH",
            contentTypeDraftId,
            JSON.stringify(contentTypeUpdateStruct.body),
            contentTypeUpdateStruct.headers,
            callback
        );
    };

    /**
     * Publish the target content type draft
     *
     * @method publishContentTypeDraft
     * @param contentTypeDraftId {String} target content type draft identifier (e.g. "/api/ezp/v2/content/types/18/draft")
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentTypeService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    ContentTypeService.prototype.publishContentTypeDraft = function (contentTypeDraftId, callback) {
        this._connectionManager.request(
            "PUBLISH",
            contentTypeDraftId,
            "",
            {},
            callback
        );
    };

    /**
     * Delete the target content type draft
     *
     * @method deleteContentTypeDraft
     * @param contentTypeDraftId {String} target content type draft identifier (e.g. "/api/ezp/v2/content/types/18/draft")
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentTypeService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    ContentTypeService.prototype.deleteContentTypeDraft = function (contentTypeDraftId, callback) {
        this._connectionManager.request(
            "DELETE",
            contentTypeDraftId,
            "",
            {},
            callback
        );
    };

// ******************************
// Field Definitions management
// ******************************

    /**
     * Add a new field definition to the target Content Type draft
     *
     * @method addFieldDefinition
     * @param contentTypeId {String} target content type identifier (e.g. "/api/ezp/v2/content/types/18")
     * @param fieldDefinitionCreateStruct {FieldDefinitionCreateStruct} object describing the new field definition to be created
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentTypeService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    ContentTypeService.prototype.addFieldDefinition = function (contentTypeId, fieldDefinitionCreateStruct, callback) {
        var that = this;

        this.loadContentTypeDraft(
            contentTypeId,
            function (error, contentTypeDraftResponse) {
                if (error) {
                    callback(error, false);
                    return;
                }

                var contentTypeDraftFieldDefinitions = contentTypeDraftResponse.document.ContentType.FieldDefinitions;

                that._connectionManager.request(
                    "POST",
                    contentTypeDraftFieldDefinitions._href,
                    JSON.stringify(fieldDefinitionCreateStruct.body),
                    fieldDefinitionCreateStruct.headers,
                    callback
                );
            }
        );
    };

    /**
     * Load the target field definition
     *
     * @method loadFieldDefinition
     * @param fieldDefinitionId {String} target field definition identifier (e.g. "/api/ezp/v2/content/types/42/fieldDefinitions/311")
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentTypeService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    ContentTypeService.prototype.loadFieldDefinition = function (fieldDefinitionId, callback) {
        this._connectionManager.request(
            "GET",
            fieldDefinitionId,
            "",
            {"Accept": "application/vnd.ez.api.FieldDefinition+json"},
            callback
        );
    };

    /**
     * Update the target (existing) field definition
     *
     * @method updateFieldDefinition
     * @param fieldDefinitionId {String} target field definition identifier (e.g. "/api/ezp/v2/content/types/42/fieldDefinitions/311")
     * @param fieldDefinitionUpdateStruct {FieldDefinitionUpdateStruct} object describing changes to the target field definition
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentTypeService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    ContentTypeService.prototype.updateFieldDefinition = function (fieldDefinitionId, fieldDefinitionUpdateStruct, callback) {
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
     * @param fieldDefinitionId {String} target field definition identifier (e.g. "/api/ezp/v2/content/types/42/fieldDefinitions/311")
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentTypeService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    ContentTypeService.prototype.deleteFieldDefinition = function (fieldDefinitionId, callback) {
        this._connectionManager.request(
            "DELETE",
            fieldDefinitionId,
            "",
            {},
            callback
        );
    };

    return ContentTypeService;

});
