/* global define */
define([],
    function () {
    "use strict";

    /**
     * Creates an instance of content type service cache object. Should be retrieved from CAPI instance (see example).
     *
     * This service services as a burst cache service for ContentTypeService by  wrapping around it and caching responses
     * of calls to load content type group and content type frequently used by UI. Cache is considered valid for 60
     * seconds and is invalidated on operations relevant for the given cache.
     *
     * @class ContentTypeServiceCache
     * @constructor
     * @param ContentTypeService {ContentTypeService} connection manager that will be used to send requests to REST service
     * @param responseCacheEnabled {Boolean}
     * @example
     *     var contentTypeService = jsCAPI.getContentTypeService();
     */
    var ContentTypeServiceCache = function (ContentTypeService, responseCacheEnabled) {
        this._ContentTypeService = ContentTypeService;
        this._responseCacheEnabled = responseCacheEnabled !== false;
        this._responseCache = {};
    };

// ******************************
// Cache controls
// ******************************

    ContentTypeService.prototype.setResponseCacheEnabled = function (responseCacheEnabled) {
        this._responseCacheEnabled = responseCacheEnabled !== false
    };

    ContentTypeService.prototype.clearResponseCache = function () {
        this._responseCache = {};
    };

    ContentTypeService.prototype.getResponseCache = function (key) {
        if (!this._responseCacheEnabled) {
            return;
        }

        // see if there are entries of the given key within the last 60 seconds
        var ts = Math.floor(Date.now() / 1000);
        for (var i = ts; i >= ts - 60; i--) {
            if (typeof this._responseCache[i] === 'undefined') {
                continue;
            }

            if (typeof this._responseCache[i][key] !== 'undefined') {
                return this._responseCache[i][key];
            }
        }
    };

    ContentTypeService.prototype.setResponseCache = function (key, response) {
        if (!this._responseCacheEnabled) {
            return;
        }

        // move over last 60 seconds of responseCache, omitting the rest
        var ts = Math.floor(Date.now() / 1000), newresponseCache = {};
        for (var i = ts; i >= ts - 60; i--) {
            if (typeof this._responseCache[i] !== 'undefined') {
                newresponseCache[i] = this._responseCache[i];
            }
        }

        // set response to the new cache and replace _responseCache with the new responseCache object.
        newresponseCache[ts][key] = response;
        this._responseCache = newresponseCache;
    };


// ******************************
// Cached API calls
// ******************************

    ContentTypeService.prototype.loadContentTypeGroups = function (callback) {
        var response = this.getResponseCache("type-group-list");
        if (response) {
            callback(false, response);
        }

        this._ContentTypeService.loadContentTypeGroups(function (error, response) {
            if (!error) {
                this.setResponseCache("type-group-list", response)
            }
            callback(error, response)
        });
    };

    ContentTypeService.prototype.loadContentTypeGroup = function (contentTypeGroupId, callback) {
        var response = this.getResponseCache("type-group-" + contentTypeGroupId);
        if (response) {
            callback(false, response);
        }

        this._ContentTypeService.loadContentTypeGroup(contentTypeGroupId, function (error, response) {
            if (!error) {
                this.setResponseCache("type-group-" + contentTypeGroupId, response)
            }
            callback(error, response)
        });
    };

    ContentTypeService.prototype.loadContentTypes = function (contentTypeGroupId, callback) {
        var response = this.getResponseCache("type-list-bygroup-" + contentTypeGroupId);
        if (response) {
            callback(false, response);
        }

        this._ContentTypeService.loadContentTypes(contentTypeGroupId, function (error, response) {
            if (!error) {
                this.setResponseCache("type-list-bygroup-" + contentTypeGroupId, response)
            }
            callback(error, response)
        });
    };

    ContentTypeService.prototype.loadContentType = function (contentTypeId, callback) {
        var response = this.getResponseCache("type-" + contentTypeId);
        if (response) {
            callback(false, response);
        }

        this._ContentTypeService.loadContentType(contentTypeId, function (error, response) {
            if (!error) {
                this.setResponseCache("type-" + contentTypeId, response)
            }
            callback(error, response)
        });
    };

// ******************************
// Invalidating API calls
// ******************************

    ContentTypeService.prototype.createContentTypeGroup = function (contentTypeGroups, contentTypeGroupCreateStruct, callback) {
        this._responseCache = {};
        this._ContentTypeService.createContentTypeGroup(contentTypeGroups, contentTypeGroupCreateStruct, callback);
    };

    ContentTypeService.prototype.updateContentTypeGroup = function (contentTypeGroupId, contentTypeGroupUpdateStruct, callback) {
        this._responseCache = {};
        this._ContentTypeService.updateContentTypeGroup(contentTypeGroupId, contentTypeGroupUpdateStruct, callback);
    };

    ContentTypeService.prototype.deleteContentTypeGroup = function (contentTypeGroupId, callback) {
        this._responseCache = {};
        this._ContentTypeService.deleteContentTypeGroup(contentTypeGroupId, callback);
    };

    ContentTypeService.prototype.createContentType = function (contentTypeGroupId, contentTypeCreateStruct, publish, callback) {
        this._responseCache = {};
        this._ContentTypeService.createContentType(contentTypeGroupId, contentTypeCreateStruct, publish, callback);
    };

    ContentTypeService.prototype.copyContentType = function (contentTypeId, callback) {
        this._responseCache = {};
        this._ContentTypeService.copyContentType(contentTypeId, callback);
    };

    ContentTypeService.prototype.assignContentTypeGroup = function (contentTypeId, groupId, callback) {
        this._responseCache = {};
        this._ContentTypeService.assignContentTypeGroup(contentTypeId, groupId, callback);
    };

    ContentTypeService.prototype.unassignContentTypeGroup = function (contentTypeAssignedGroupId, callback) {
        this._responseCache = {};
        this._ContentTypeService.unassignContentTypeGroup(contentTypeAssignedGroupId, callback);
    };

    ContentTypeService.prototype.deleteContentType = function (contentTypeId, callback) {
        this._responseCache = {};
        this._ContentTypeService.deleteContentType(contentTypeId, callback);
    };

    ContentTypeService.prototype.publishContentTypeDraft = function (contentTypeDraftId, callback) {
        this._responseCache = {};
        this._ContentTypeService.publishContentTypeDraft(contentTypeDraftId, callback);
    };

// ******************************
// Pure decorators
// ******************************

    ContentTypeService.prototype.newContentTypeGroupInputStruct = function (identifier) {
        return this._ContentTypeService.newContentTypeGroupInputStruct(identifier);
    };

    ContentTypeService.prototype.newContentTypeCreateStruct = function (identifier, languageCode, names) {
        return this._ContentTypeService.newContentTypeCreateStruct(identifier, languageCode, names);
    };

    ContentTypeService.prototype.newContentTypeUpdateStruct = function () {
        return this._ContentTypeService.newContentTypeUpdateStruct();
    };

    ContentTypeService.prototype.newFieldDefinitionCreateStruct = function (identifier, fieldType, fieldGroup, names) {
        return this._ContentTypeService.newFieldDefinitionCreateStruct(identifier, fieldType, fieldGroup, names);
    };

    ContentTypeService.prototype.newFieldDefinitionUpdateStruct = function () {
        return this._ContentTypeService.newFieldDefinitionUpdateStruct();
    };

    ContentTypeService.prototype.loadContentTypeByIdentifier = function (identifier, callback) {
        this._ContentTypeService.loadContentTypeByIdentifier(identifier, callback);
    };

    ContentTypeService.prototype.loadContentTypeGroupByIdentifier = function (contentTypeGroups, identifier, callback) {
        this._ContentTypeService.loadContentTypeGroupByIdentifier(contentTypeGroups, identifier, callback);
    };

    ContentTypeService.prototype.loadGroupsOfContentType = function (contentTypeId, callback) {
        this._ContentTypeService.loadGroupsOfContentType(contentTypeId, callback);
    };

    ContentTypeService.prototype.createContentTypeDraft = function (contentTypeId, contentTypeUpdateStruct, callback) {
        this._ContentTypeService.createContentTypeDraft(contentTypeId, contentTypeUpdateStruct, callback);
    };

    ContentTypeService.prototype.loadContentTypeDraft = function (contentTypeId, callback) {
        this._ContentTypeService.loadContentTypeDraft(contentTypeId, callback);
    };

    ContentTypeService.prototype.updateContentTypeDraftMetadata = function (contentTypeDraftId, contentTypeUpdateStruct, callback) {
        this._ContentTypeService.updateContentTypeDraftMetadata(contentTypeDraftId, contentTypeUpdateStruct, callback);
    };

    ContentTypeService.prototype.deleteContentTypeDraft = function (contentTypeDraftId, callback) {
        this._ContentTypeService.deleteContentTypeDraft(contentTypeDraftId, callback);
    };

    ContentTypeService.prototype.addFieldDefinition = function (contentTypeId, fieldDefinitionCreateStruct, callback) {
        this._ContentTypeService.addFieldDefinition(contentTypeId, fieldDefinitionCreateStruct, callback);
    };

    ContentTypeService.prototype.loadFieldDefinition = function (fieldDefinitionId, callback) {
        this._ContentTypeService.loadFieldDefinition(fieldDefinitionId, callback);
    };

    ContentTypeService.prototype.updateFieldDefinition = function (fieldDefinitionId, fieldDefinitionUpdateStruct, callback) {
        this._ContentTypeService.updateFieldDefinition(fieldDefinitionId, fieldDefinitionUpdateStruct, callback);
    };

    ContentTypeService.prototype.deleteFieldDefinition = function (fieldDefinitionId, callback) {
        this._ContentTypeService.deleteFieldDefinition(fieldDefinitionId, callback);
    };

    return ContentTypeService;

});
