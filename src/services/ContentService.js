/* global define */
define(["structures/ContentCreateStruct", "structures/ContentUpdateStruct", "structures/SectionInputStruct",
        "structures/LocationCreateStruct", "structures/LocationUpdateStruct", "structures/ContentMetadataUpdateStruct",
        "structures/ObjectStateGroupCreateStruct", "structures/ObjectStateGroupUpdateStruct", "structures/ObjectStateCreateStruct",
        "structures/ObjectStateUpdateStruct", "structures/ViewCreateStruct", "structures/UrlAliasCreateStruct",
        "structures/UrlWildcardCreateStruct", "structures/RelationCreateStruct", "utils/uriparse"],
    function (ContentCreateStruct, ContentUpdateStruct, SectionInputStruct,
              LocationCreateStruct, LocationUpdateStruct, ContentMetadataUpdateStruct,
              ObjectStateGroupCreateStruct, ObjectStateGroupUpdateStruct, ObjectStateCreateStruct,
              ObjectStateUpdateStruct, ViewCreateStruct, UrlAliasCreateStruct,
              UrlWildcardCreateStruct, RelationCreateStruct, parseUriTemplate) {
    "use strict";

    /**
     * Creates an instance of Content Service object. Use ContentService to retrieve information and execute operations related to Content.
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
     *     contentService.loadRoot(function (error, response) {
     *            if (error) {
     *                console.log('An error occurred', error);
     *            } else {
     *                console.log('Success!', response);
     *            }
     *     });
     *
     * @class ContentService
     * @constructor
     * @param connectionManager {ConnectionManager} connection manager that will be used to send requests to REST service
     * @param discoveryService {DiscoveryService} is handling REST paths auto-discovery
     * @param rootPath {String} path to Root resource
     * @example
     *     var contentService = jsCAPI.getContentService();
     */
    var ContentService = function (connectionManager, discoveryService, rootPath) {
        this._connectionManager = connectionManager;
        this._discoveryService = discoveryService;
        this._rootPath = rootPath;
    };

    /**
     * List the root resources of the eZ Publish installation. Root resources contain many paths and references to other parts of the REST interface.
     * This call is used by DiscoveryService automatically, whenever needed.
     *
     * @method loadRoot
     * @param callback {Function} callback executed after performing the request (see
     * {{#crossLink "ContentService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    ContentService.prototype.loadRoot = function (callback) {
        this._connectionManager.request(
            "GET",
            this._rootPath,
            "",
            {"Accept": "application/vnd.ez.api.Root+json"},
            callback
        );
    };

// ******************************
// Structures
// ******************************

    /**
     * Returns update structure for Content object
     *
     * @method newContentUpdateStruct
     * @param language {String} The language code (eng-GB, fre-FR, ...)
     * @return {ContentUpdateStruct}
     *
     */
    ContentService.prototype.newContentUpdateStruct = function (language) {
        return new ContentUpdateStruct(language);
    };

    /**
     * Returns update structure for Content object metadata
     *
     * @method newContentMetadataUpdateStruct
     * @param language {String} The language code (eng-GB, fre-FR, ...)
     * @return ContentMetadataUpdateStruct
     */
    ContentService.prototype.newContentMetadataUpdateStruct = function (language) {
        return new ContentMetadataUpdateStruct(language);
    };

    /**
     * Returns create structure for Content object
     *
     * @method newContentCreateStruct
     * @param contentTypeId {String} Content Type for new Content object (e.g.: /api/v2/ezp/content/type/1)
     * @param locationCreateStruct {LocationCreateStruct} create structure for a Location object, where the new Content object will be situated
     * @param language {String} The language code (eng-GB, fre-FR, ...)
     * @return {ContentCreateStruct}
     */
    ContentService.prototype.newContentCreateStruct = function (contentTypeId, locationCreateStruct, language) {
        return new ContentCreateStruct(contentTypeId, locationCreateStruct, language);
    };

    /**
     * Returns input structure for Section object. Input structure is needed while creating and updating the object.
     *
     * @method newSectionInputStruct
     * @param identifier {String} unique section identifier (e.g. "media")
     * @param name {String} section name (e.g. "Media")
     * @return {SectionInputStruct}
     */
    ContentService.prototype.newSectionInputStruct = function (identifier, name) {
        return new SectionInputStruct(identifier, name);
    };

    /**
     * Returns create structure for Location object
     *
     * @method newLocationCreateStruct
     * @param parentLocationId {String} Reference to the parent location of the new Location. (e.g. "/api/ezp/v2/content/locations/1/2/118")
     * @return {LocationCreateStruct}
     */
    ContentService.prototype.newLocationCreateStruct = function (parentLocationId) {
        return new LocationCreateStruct(parentLocationId);
    };

    /**
     * Returns update structure for Location object
     *
     * @method newLocationUpdateStruct
     * @return {LocationUpdateStruct}
     */
    ContentService.prototype.newLocationUpdateStruct = function () {
        return new LocationUpdateStruct();
    };

    /**
     * Returns create structure for View object
     *
     * @method newViewCreateStruct
     * @param identifier {String} unique view identifier (e.g. "my-new-view")
     * @return {ViewCreateStruct}
     */
    ContentService.prototype.newViewCreateStruct = function (identifier) {
        return new ViewCreateStruct(identifier);
    };

    /**
     * Returns create structure for Relation
     *
     * @method newRelationCreateStruct
     * @param destination {String} reference to the resource we want to make related
     * @return {RelationCreateStruct}
     */
    ContentService.prototype.newRelationCreateStruct = function (destination) {
        return new RelationCreateStruct(destination);
    };

    /**
     * Returns create structure for ObjectStateGroup
     *
     * @method newObjectStateGroupCreateStruct
     * @param identifier {String} unique ObjectStateGroup identifier (e.g. "some-new-group")
     * @param languageCode {String} The language code (eng-GB, fre-FR, ...)
     * @param names {Array} Multi language value (see example)
     * @return {ObjectStateGroupCreateStruct}
     * @example
     *      var objectStateGroupCreateStruct = contentService.newObjectStateGroupCreateStruct(
     *          "some-id", "eng-US", [{
     *              "_languageCode":"eng-US",
     *              "#text":"Some Name"
     *          }]
     *      );
     */
    ContentService.prototype.newObjectStateGroupCreateStruct = function (identifier, languageCode, names) {
        return new ObjectStateGroupCreateStruct(identifier, languageCode, names);
    };

    /**
     * Returns update structure for ObjectStateGroup
     *
     * @method newObjectStateGroupUpdateStruct
     * @return ObjectStateGroupUpdateStruct
     */
    ContentService.prototype.newObjectStateGroupUpdateStruct = function () {
        return new ObjectStateGroupUpdateStruct();
    };

    /**
     * Returns create structure for ObjectState
     *
     * @method newObjectStateCreateStruct
     * @param identifier {String} unique ObjectState identifier (e.g. "some-new-state")
     * @param languageCode {String} The language code (eng-GB, fre-FR, ...)
     * @param priority {int}
     * @param names {Array} Multi language value (see example)
     * @param descriptions {Array} Multi language value (see example)
     * @return {ObjectStateCreateStruct}
     * @example
     *      var objectStateCreateStruct = contentService.newObjectStateCreateStruct(
     *          "some-id", "eng-US", 0, [{
     *              "_languageCode":"eng-US",
     *              "#text":"Some Name"
     *          }], [{
     *              "_languageCode":"eng-US",
     *              "#text":"Some Description"
     *          }]
     *      );
     */
    ContentService.prototype.newObjectStateCreateStruct = function (identifier, languageCode, priority, names, descriptions) {
        return new ObjectStateCreateStruct(identifier, languageCode, priority, names, descriptions);
    };

    /**
     * Returns update structure for ObjectState
     *
     * @method newObjectStateUpdateStruct
     * @return {ObjectStateUpdateStruct}
     */
    ContentService.prototype.newObjectStateUpdateStruct = function () {
        return new ObjectStateUpdateStruct();
    };

    /**
     * Returns create structure for UrlAlias
     *
     * @method newUrlAliasCreateStruct
     * @param languageCode {String} The language code (eng-GB, fre-FR, ...)
     * @param resource {String} eZ Publish resource you want to create alias for
     * @param path {String} the new alias itself
     * @return {UrlAliasCreateStruct}
     * @example
     *     var urlAliasCreateStruct = contentService.newUrlAliasCreateStruct(
     *         "eng-US",
     *         "content/search",
     *         "findme-alias"
     *     );
     */
    ContentService.prototype.newUrlAliasCreateStruct = function (languageCode, resource, path) {
        return new UrlAliasCreateStruct(languageCode, resource, path);
    };

    /**
     * Returns create structure for UrlWildcard
     *
     * @method newUrlWildcardCreateStruct
     * @param sourceUrl {String} new url wildcard
     * @param destinationUrl {String} existing resource where wildcard should point
     * @param forward {boolean} weather or not the wildcard should redirect to the resource
     * @example
     *     var urlWildcardCreateStruct = contentService.newUrlWildcardCreateStruct(
     *         "some-new-wildcard",
     *         "/api/ezp/v2/content/locations/1/2/113",
     *         "false"
     *     );
     */
    ContentService.prototype.newUrlWildcardCreateStruct = function (sourceUrl, destinationUrl, forward) {
        return new UrlWildcardCreateStruct(sourceUrl, destinationUrl, forward);
    };

// ******************************
// Sections management
// ******************************

    /**
     * Create a new section
     *
     * @method createSection
     * @param sectionInputStruct {SectionInputStruct} object describing section to be created
     * @param callback {Function} callback executed after performing the request (see
     * {{#crossLink "ContentService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    ContentService.prototype.createSection = function (sectionInputStruct, callback) {
        var that = this;

        this._discoveryService.getInfoObject(
            "sections",
            function (error, sections) {
                if (error) {
                    callback(error, sections);
                    return;
                }

                that._connectionManager.request(
                    "POST",
                    sections._href,
                    JSON.stringify(sectionInputStruct.body),
                    sectionInputStruct.headers,
                    callback
                );
            }
        );
    };

    /**
     * Update target section
     *
     * @method updateSection
     * @param sectionId {String} target section identifier (e.g. "/api/ezp/v2/content/sections/2")
     * @param sectionInputStruct {SectionInputStruct} object describing updates to the section
     * @param callback {Function} callback executed after performing the request (see
     * {{#crossLink "ContentService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    ContentService.prototype.updateSection = function (sectionId, sectionInputStruct, callback) {
        this._connectionManager.request(
            "PATCH",
            sectionId,
            JSON.stringify(sectionInputStruct.body),
            sectionInputStruct.headers,
            callback
        );
    };

    /**
     * List all available sections of eZ Publish instance
     *
     * @method loadSections
     * @param callback {Function} callback executed after performing the request (see
     * {{#crossLink "ContentService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    ContentService.prototype.loadSections = function (callback) {
        var that = this;

        this._discoveryService.getInfoObject(
            "sections",
            function (error, sections) {
                if (error) {
                    callback(error, sections);
                    return;
                }

                that._connectionManager.request(
                    "GET",
                    sections._href,
                    "",
                    {"Accept": sections["_media-type"]},
                    callback
                );
            }
        );
    };

    /**
     * Load single section
     *
     * @method loadSection
     * @param sectionId {String} target section identifier (e.g. "/api/ezp/v2/content/sections/2")
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    ContentService.prototype.loadSection = function (sectionId, callback) {
        this._connectionManager.request(
            "GET",
            sectionId,
            "",
            {"Accept": "application/vnd.ez.api.Section+json"},
            callback
        );
    };

    /**
     * Delete target section
     *
     * @method deleteSection
     * @param sectionId {String} target section identifier (e.g. "/api/ezp/v2/content/sections/2")
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    ContentService.prototype.deleteSection = function (sectionId, callback) {
        this._connectionManager.request(
            "DELETE",
            sectionId,
            "",
            {},
            callback
        );
    };

// ******************************
// Content management
// ******************************

    /**
     * Creates a new content draft assigned to the authenticated user.
     *
     * @method createContent
     * @param contentCreateStruct {ContentCreateStruct} object describing content to be created
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    ContentService.prototype.createContent = function (contentCreateStruct, callback) {
        var that = this;

        this._discoveryService.getInfoObject(
            "content",
            function (error, contentObjects) {
                if (error) {
                    callback(error, contentObjects);
                    return;
                }

                that._connectionManager.request(
                    "POST",
                    contentObjects._href,
                    JSON.stringify(contentCreateStruct.body),
                    contentCreateStruct.headers,
                    callback
                );
            }
        );
    };

    /**
     * Update target content metadata.
     *
     * @method updateContentMetadata
     * @param contentId {String} target content identifier (e.g. "/api/ezp/v2/content/objects/108")
     * @param contentMetadataUpdateStruct {ContentMetadataUpdateStruct} object describing update of the content metadata
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentService"}}Note on the callbacks usage{{/crossLink}} for more info)
     * @example
     *      var updateStruct = contentService.newContentMetadataUpdateStruct("eng-US");
     *
     *      updateStruct.body.ContentUpdate.Section = "/api/ezp/v2/content/sections/2";
     *      updateStruct.body.ContentUpdate.remoteId = "new-remote-id";
     *
     *      contentService.updateContentMetadata(
     *          "/api/ezp/v2/content/objects/180",
     *          updateStruct,
     *          callback
     *      );
     */
    ContentService.prototype.updateContentMetadata = function (contentId, contentMetadataUpdateStruct, callback) {
        this._connectionManager.request(
            "PATCH",
            contentId,
            JSON.stringify(contentMetadataUpdateStruct.body),
            contentMetadataUpdateStruct.headers,
            callback
        );
    };

    /**
     * Load single content by remoteId
     *
     * @method loadContentByRemoteId
     * @param remoteId {String} remote id of target content object (e.g. "30847bec12a8a398777493a4bdb10398")
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    ContentService.prototype.loadContentByRemoteId = function (remoteId, callback) {
        var that = this;

        this._discoveryService.getInfoObject(
            "contentByRemoteId",
            function (error, contentByRemoteId) {
                if (error) {
                    callback(error, contentByRemoteId);
                    return;
                }
                that._connectionManager.request(
                    "GET",
                    parseUriTemplate(contentByRemoteId._href, {remoteId: remoteId}),
                    "",
                    {"Accept": "application/vnd.ez.api.ContentInfo+json"},
                    callback
                );
            }
        );
    };

    /**
     * Load single content info
     *
     * @method loadContentInfo
     * @param contentId {String} target content identifier (e.g. "/api/ezp/v2/content/objects/108")
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    ContentService.prototype.loadContentInfo = function (contentId, callback) {
        this._connectionManager.request(
            "GET",
            contentId,
            "",
            {"Accept": "application/vnd.ez.api.ContentInfo+json"},
            callback
        );
    };

    /**
     * Load single content info with embedded current version
     *
     * @method loadContentInfoAndCurrentVersion
     * @param contentId {String} target content identifier (e.g. "/api/ezp/v2/content/objects/108")
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    ContentService.prototype.loadContentInfoAndCurrentVersion = function (contentId, callback) {
        this._connectionManager.request(
            "GET",
            contentId,
            "",
            {"Accept": "application/vnd.ez.api.Content+json"},
            callback
        );
    };

    /**
     * Delete target content
     *
     * @method deleteContent
     * @param contentId {String} target content identifier (e.g. "/api/ezp/v2/content/objects/108")
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentService"}}Note on the callbacks usage{{/crossLink}} for more info)
     * @example
     *      contentService.deleteContent(
     *          "/api/ezp/v2/content/objects/116",
     *          callback
     *      );
     */
    ContentService.prototype.deleteContent = function (contentId, callback) {
        this._connectionManager.request(
            "DELETE",
            contentId,
            "",
            {},
            callback
        );
    };

    /**
     * Copy content to determined location
     *
     * @method copyContent
     * @param contentId {String} target content identifier (e.g. "/api/ezp/v2/content/objects/108")
     * @param destinationId {String} A location resource to which the content object should be copied (e.g. "/api/ezp/v2/content/locations/1/2/119")
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    ContentService.prototype.copyContent = function (contentId, destinationId, callback) {
        this._connectionManager.request(
            "COPY",
            contentId,
            "",
            {"Destination": destinationId},
            callback
        );
    };

// ******************************
// Versions management
// ******************************

    /**
     * Load current version for target content
     *
     * @method loadCurrentVersion
     * @param contentId {String} target content identifier (e.g. "/api/ezp/v2/content/objects/108")
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    ContentService.prototype.loadCurrentVersion = function (contentId, callback) {
        var that = this;

        this.loadContentInfo(
            contentId,
            function (error, contentResponse) {
                if (error) {
                    callback(error, contentResponse);
                    return;
                }

                var currentVersion = contentResponse.document.Content.CurrentVersion;

                that._connectionManager.request(
                    "GET",
                    currentVersion._href,
                    "",
                    {"Accept": currentVersion["_media-type"]},
                    callback
                );
            }
        );
    };

    /**
     * Loads a specific version of target content. This method returns fields and relations
     *
     * @method loadContent
     * @param versionedContentId {String} target version identifier (e.g. "/api/ezp/v2/content/objects/108/versions/2")
     * @param [fields=''] {String} comma separated list of fields which should be returned in the response (see Content).
     * @param [responseGroups=''] {String}  alternative: comma separated lists of predefined field groups (see REST API Spec v1).
     * @param [languages=''] {String} (comma separated list) restricts the output of translatable fields to the given languages.
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentService"}}Note on the callbacks usage{{/crossLink}} for more info)
     * @example
     *     contentService.loadContent(
     *          '/api/ezp/v2/content/objects/180/versions/1',
     *          '',
     *          '',
     *          'eng-US',
     *          callback
     *     );
     */
    ContentService.prototype.loadContent = function (versionedContentId, fields, responseGroups, languages, callback) {
        var defaultFields = '',
            defaultResponseGroups = '',
            defaultLanguages = '';

        // default values for omitted parameters (if any)
        if (arguments.length < 5) {
            if (typeof fields == "function") {
                //no optional parameteres are passed
                callback = fields;
                fields = defaultFields;
                responseGroups = defaultResponseGroups;
                languages = defaultLanguages;
            } else if (typeof responseGroups == "function") {
                // only first 1 optional parameter is passed
                callback = responseGroups;
                responseGroups = defaultResponseGroups;
                languages = defaultLanguages;
            } else {
                // only first 2 optional parameters are passed
                callback = languages;
                languages = defaultLanguages;
            }
        }

        fields = fields ? '?fields=' + fields : '';
        responseGroups = responseGroups ? '&responseGroups="' + responseGroups + '"' : '';
        languages = languages ? '&languages=' + languages : '';

        this._connectionManager.request(
            "GET",
            versionedContentId + fields + responseGroups + languages,
            "",
            {"Accept": "application/vnd.ez.api.Version+json"},
            callback
        );
    };

    /**
     *  Loads all versions for the target content
     *
     * @method loadVersions
     * @param contentId {String} target content identifier (e.g. "/api/ezp/v2/content/objects/108")
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    ContentService.prototype.loadVersions = function (contentId, callback) {
        var that = this;

        this.loadContentInfo(
            contentId,
            function (error, contentResponse) {
                if (error) {
                    callback(error, contentResponse);
                    return;
                }

                var contentVersions = contentResponse.document.Content.Versions;

                that._connectionManager.request(
                    "GET",
                    contentVersions._href,
                    "",
                    {"Accept": contentVersions["_media-type"]},
                    callback
                );
            }
        );
    };

    /**
     * Updates the fields of a target draft
     *
     * @method updateContent
     * @param versionedContentId {String} target version identifier (e.g. "/api/ezp/v2/content/objects/108/versions/2")
     * @param contentUpdateStruct {ContentUpdateStruct} object describing update to the draft
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    ContentService.prototype.updateContent = function (versionedContentId, contentUpdateStruct, callback) {
        this._connectionManager.request(
            "PATCH",
            versionedContentId,
            JSON.stringify(contentUpdateStruct.body),
            contentUpdateStruct.headers,
            callback
        );
    };

    /**
     * Creates a draft from a published or archived version.
     *
     * @method createContentDraft
     * @param contentId {String} target content identifier (e.g. "/api/ezp/v2/content/objects/108")
     * @param [versionId] {int} numerical id of the base version for the new draft. If not provided the current version of the content will be used.
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentService"}}Note on the callbacks usage{{/crossLink}} for more info)
     * @example
     *      // Create draft from current version
     *      contentService.createContentDraft(
     *          "/api/ezp/v2/content/objects/107",
     *          null,
     *          callback
     *      );
     *
     *      // Create draft from version #2
     *      contentService.createContentDraft(
     *          "/api/ezp/v2/content/objects/107",
     *          2,
     *          callback
     *      );
     */
    ContentService.prototype.createContentDraft = function (contentId, versionId, callback) {
        var that = this;

        if ( !callback ) {
            callback = versionId;
            versionId = false;
        }
        this.loadContentInfo(
            contentId,
            function (error, contentResponse) {
                var url = '';

                if (error) {
                    callback(error, contentResponse);
                    return;
                }

                if ( versionId ) {
                    url = contentResponse.document.Content.Versions._href + "/" + versionId;
                } else {
                    url = contentResponse.document.Content.CurrentVersion._href;
                }

                that._connectionManager.request(
                    "COPY", url, "",
                    {"Accept": "application/vnd.ez.api.Version+json"},
                    callback
                );
            }
        );
    };

    /**
     * Deletes target version of the content.
     *
     * @method deleteVersion
     * @param versionedContentId {String} target version identifier (e.g. "/api/ezp/v2/content/objects/108/versions/2")
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    ContentService.prototype.deleteVersion = function (versionedContentId, callback) {
        this._connectionManager.request(
            "DELETE",
            versionedContentId,
            "",
            {},
            callback
        );
    };

    /**
     * Publishes target version of the content.
     *
     * @method publishVersion
     * @param versionedContentId {String} target version identifier (e.g. "/api/ezp/v2/content/objects/108/versions/2")
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    ContentService.prototype.publishVersion = function (versionedContentId, callback) {
        this._connectionManager.request(
            "PUBLISH",
            versionedContentId,
            "",
            {},
            callback
        );
    };

// ******************************
// Locations management
// ******************************

    /**
     * Creates a new location for target content object
     *
     * @method createLocation
     * @param contentId {String} target content identifier (e.g. "/api/ezp/v2/content/objects/108")
     * @param locationCreateStruct {LocationCreateStruct} object describing new location to be created
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    ContentService.prototype.createLocation = function (contentId, locationCreateStruct, callback) {
        var that = this;

        this.loadContentInfo(
            contentId,
            function (error, contentResponse) {
                if (error) {
                    callback(error, contentResponse);
                    return;
                }

                var locations = contentResponse.document.Content.Locations;

                that._connectionManager.request(
                    "POST",
                    locations._href,
                    JSON.stringify(locationCreateStruct.body),
                    locationCreateStruct.headers,
                    callback
                );
            }
        );
    };

    /**
     *  Loads all locations for target content object
     *
     * @method loadLocations
     * @param contentId {String} target content identifier (e.g. "/api/ezp/v2/content/objects/108")
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    ContentService.prototype.loadLocations = function (contentId, callback) {
        var that = this;

        this.loadContentInfo(
            contentId,
            function (error, contentResponse) {
                if (error) {
                    callback(error, contentResponse);
                    return;
                }

                var locations = contentResponse.document.Content.Locations;

                that._connectionManager.request(
                    "GET",
                    locations._href,
                    "",
                    {"Accept": "application/vnd.ez.api.LocationList+json"},
                    callback
                );
            }
        );
    };

    /**
     *  Loads target location
     *
     * @method loadLocation
     * @param locationId {String} target location identifier (e.g. "/api/ezp/v2/content/locations/1/2/102")
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    ContentService.prototype.loadLocation = function (locationId, callback) {
        this._connectionManager.request(
            "GET",
            locationId,
            "",
            {"Accept": "application/vnd.ez.api.Location+json"},
            callback
        );
    };

    /**
     *  Loads target location by remote Id
     *
     * @method loadLocationByRemoteId
     * @param remoteId {String} remote id of target location (e.g. "0bae96bd419e141ff3200ccbf2822e4f")
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    ContentService.prototype.loadLocationByRemoteId = function (remoteId, callback) {
        var that = this;
        this._discoveryService.getInfoObject(
            "locationByRemoteId",
            function (error, locationByRemoteId) {
                if (error) {
                    callback(error, locationByRemoteId);
                    return;
                }
                that._connectionManager.request(
                    "GET",
                    parseUriTemplate(locationByRemoteId._href, {remoteId: remoteId}),
                    "",
                    {"Accept": "application/vnd.ez.api.Location+json"},
                    callback
                );
            }
        );
    };

    /**
     * Updates target location
     *
     * @method updateLocation
     * @param locationId {String} target location identifier (e.g. "/api/ezp/v2/content/locations/1/2/102")
     * @param locationUpdateStruct {LocationUpdateStruct} object describing changes to target location
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    ContentService.prototype.updateLocation = function (locationId, locationUpdateStruct, callback) {
        this._connectionManager.request(
            "PATCH",
            locationId,
            JSON.stringify(locationUpdateStruct.body),
            locationUpdateStruct.headers,
            callback
        );
    };

    /**
     *  Loads children for the target location
     *
     * @method loadLocationChildren
     * @param locationId {String} target location identifier (e.g. "/api/ezp/v2/content/locations/1/2/102")
     * @param [limit=-1] {int} the number of results returned
     * @param [offset=0] {int} the offset of the result set
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentService"}}Note on the callbacks usage{{/crossLink}} for more info)
     * @example
     *      contentService.loadLocationChildren(
     *          "/api/ezp/v2/content/locations/1/2/102",
     *          5,
     *          5,
     *          callback
     *      );
     */
    ContentService.prototype.loadLocationChildren = function (locationId, limit, offset, callback) {

        var that = this,
            defaultLimit = -1,
            defaultOffset = 0;

        // default values for omitted parameters (if any)
        if (arguments.length < 4) {
            if (typeof limit == "function") {
                // no optional params are passed
                callback = limit;
                limit = defaultLimit;
                offset = defaultOffset;
            } else {
                // only limit is passed
                callback = offset;
                offset = defaultOffset;
            }
        }

        this.loadLocation(
            locationId,
            function (error, locationResponse) {
                if (error) {
                    callback(error, locationResponse);
                    return;
                }

                var location = locationResponse.document.Location;

                that._connectionManager.request(
                    "GET",
                    location.Children._href + '?offset=' + offset + '&limit=' + limit,
                    "",
                    {"Accept": location.Children["_media-type"]},
                    callback
                );
            }
        );
    };

    /**
     *  Copies the subtree starting from "subtree" as a new subtree of "targetLocation"
     *
     * @method copySubtree
     * @param subtree {String} source subtree location
     * @param targetLocation {String} location where source subtree should be copied
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    ContentService.prototype.copySubtree = function (subtree, targetLocation, callback) {
        this._connectionManager.request(
            "COPY",
            subtree,
            "",
            {"Destination": targetLocation},
            callback
        );
    };

    /**
     *  Moves the subtree to a new subtree of "targetLocation"
     *  The targetLocation can also be /content/trash, in that case the location is put into the trash.
     *
     * @method moveSubtree
     * @param subtree {String} source subtree location
     * @param targetLocation {String} location where source subtree should be moved
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    ContentService.prototype.moveSubtree = function (subtree, targetLocation, callback) {
        this._connectionManager.request(
            "MOVE",
            subtree,
            "",
            {"Destination": targetLocation},
            callback
        );
    };

    /**
     *  Swaps the location of the "subtree" with "targetLocation"
     *
     * @method swapLocation
     * @param subtree {String} source subtree location
     * @param targetLocation {String} location with which subtree location should be swapped
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    ContentService.prototype.swapLocation = function (subtree, targetLocation, callback) {
        this._connectionManager.request(
            "SWAP",
            subtree,
            "",
            {"Destination": targetLocation},
            callback
        );
    };

    /**
     *  Deletes the location and all it's subtrees
     *  Every content object is deleted which does not have any other location.
     *  Otherwise the deleted location is removed from the content object.
     *  The children are recursively deleted.
     *
     * @method deleteLocation
     * @param locationId {String} target location identifier (e.g. "/api/ezp/v2/content/locations/1/2/102")
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    ContentService.prototype.deleteLocation = function (locationId, callback) {
        this._connectionManager.request(
            "DELETE",
            locationId,
            "",
            {},
            callback
        );
    };

// ******************************
// Views management
// ******************************

    /**
     * Creates a new view. Views are used to perform content queries by certain criteria.
     *
     * @method createView
     * @param viewCreateStruct {ViewCreateStruct} object describing new view to be created
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentService"}}Note on the callbacks usage{{/crossLink}} for more info)
     * @example
     *     var viewCreateStruct = contentService.newViewCreateStruct('some-test-id');
     *     viewCreateStruct.body.ViewInput.Query.Criteria = {
     *         FullTextCriterion : "title"
     *     };
     *     contentService.createView(
     *         viewCreateStruct,
     *         callback
     *     );
     */
    ContentService.prototype.createView = function (viewCreateStruct, callback) {
        var that = this;

        this._discoveryService.getInfoObject(
            "views",
            function (error, views) {
                if (error) {
                    callback(error, views);
                    return;
                }

                that._connectionManager.request(
                    "POST",
                    views._href,
                    JSON.stringify(viewCreateStruct.body),
                    viewCreateStruct.headers,
                    callback
                );
            }
        );
    };

// ******************************
// Relations management
// ******************************

    /**
     *  Loads the relations of the target version.
     *
     * @method loadRelations
     * @param versionedContentId {String} target version identifier (e.g. "/api/ezp/v2/content/objects/108/versions/2")
     * @param [limit=-1] {int} the number of results returned
     * @param [offset=0] {int} the offset of the result set
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentService"}}Note on the callbacks usage{{/crossLink}} for more info)
     * @example
     *      //See loadLocationChildren for example of "offset" and "limit" arguments usage
     */
    ContentService.prototype.loadRelations = function (versionedContentId, limit, offset, callback) {

        var that = this,
            defaultLimit = -1,
            defaultOffset = 0;

        // default values for omitted parameters (if any)
        if (arguments.length < 4) {
            if (typeof limit == "function") {
                // no optional params are passed
                callback = limit;
                limit = defaultLimit;
                offset = defaultOffset;
            } else {
                // only limit is passed
                callback = offset;
                offset = defaultOffset;
            }
        }

        this.loadContent(
            versionedContentId,
            {},
            function (error, versionResponse) {
                if (error) {
                    callback(error, versionResponse);
                    return;
                }

                var version = versionResponse.document.Version;

                that._connectionManager.request(
                    "GET",
                    version.Relations._href + '?offset=' + offset + '&limit=' + limit,
                    "",
                    {"Accept": version.Relations["_media-type"]},
                    callback
                );
            }
        );
    };

    /**
     *  Loads the relations of the target content's current version
     *
     * @method loadCurrentRelations
     * @param contentId {String} target content identifier (e.g. "/api/ezp/v2/content/objects/102")
     * @param [limit=-1] {int} the number of results returned
     * @param [offset=0] {int} the offset of the result set
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentService"}}Note on the callbacks usage{{/crossLink}} for more info)
     * @example
     *      //See loadLocationChildren for example of "offset" and "limit" arguments usage
     */
    ContentService.prototype.loadCurrentRelations = function (contentId, limit, offset, callback) {

        var that = this,
            defaultLimit = -1,
            defaultOffset = 0;

        // default values for omitted parameters (if any)
        if (arguments.length < 4) {
            if (typeof limit == "function") {
                // no optional params are passed
                callback = limit;
                limit = defaultLimit;
                offset = defaultOffset;
            } else {
                // only limit is passed
                callback = offset;
                offset = defaultOffset;
            }
        }

        this.loadCurrentVersion(
            contentId,
            function (error, currentVersionResponse) {
                if (error) {
                    callback(error, currentVersionResponse);
                    return;
                }

                var currentVersion = currentVersionResponse.document.Version;

                that._connectionManager.request(
                    "GET",
                    currentVersion.Relations._href + '?offset=' + offset + '&limit=' + limit,
                    "",
                    {"Accept": currentVersion.Relations["_media-type"]},
                    callback
                );
            }
        );
    };

    /**
     *  Loads target relation
     *
     * @method loadRelation
     * @param relationId {String} target relation identifier (e.g. "/api/ezp/v2/content/objects/102/versions/5/relations/1")
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    ContentService.prototype.loadRelation = function (relationId, callback) {
        this._connectionManager.request(
            "GET",
            relationId,
            "",
            {"Accept": "application/vnd.ez.api.Relation+json"},
            callback
        );
    };

    /**
     *  Creates a new relation of type COMMON for the given draft.
     *
     * @method addRelation
     * @param versionedContentId {String} target version identifier (e.g. "/api/ezp/v2/content/objects/102/versions/5")
     * @param relationCreateStruct {RelationCreateStruct} object describing new relation to be created
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentService"}}Note on the callbacks usage{{/crossLink}} for more info)
     * @example
     *      var relationCreateStruct = contentService.newRelationCreateStruct("/api/ezp/v2/content/objects/132");
     *      contentService.addRelation(
     *          "/api/ezp/v2/content/objects/102/versions/5",
     *          relationCreateStruct,
     *          callback
     *      );
     */
    ContentService.prototype.addRelation = function (versionedContentId, relationCreateStruct, callback) {
        var that = this;

        this.loadContent(
            versionedContentId,
            {},
            function (error, versionResponse) {
                if (error) {
                    callback(error, versionResponse);
                    return;
                }

                var version = versionResponse.document.Version;

                that._connectionManager.request(
                    "POST",
                    version.Relations._href,
                    JSON.stringify(relationCreateStruct.body),
                    relationCreateStruct.headers,
                    callback
                );
            }
        );
    };

    /**
     *  Delete target relation
     *
     * @method deleteRelation
     * @param relationId {String} target relation identifier (e.g. "/api/ezp/v2/content/objects/102/versions/5/relations/1")
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    ContentService.prototype.deleteRelation = function (relationId, callback) {
        this._connectionManager.request(
            "DELETE",
            relationId,
            "",
            {},
            callback
        );
    };

// ******************************
// Thrash management
// ******************************

    /**
     *  Loads all the thrash can items
     *
     * @method loadTrashItems
     * @param [limit=-1] {int} the number of results returned
     * @param [offset=0] {int} the offset of the result set
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentService"}}Note on the callbacks usage{{/crossLink}} for more info)
     * @example
     *      //See loadLocationChildren for example of "offset" and "limit" arguments usage
     */
    ContentService.prototype.loadTrashItems = function (limit, offset, callback) {

        var that = this,
            defaultLimit = -1,
            defaultOffset = 0;

        // default values for omitted parameters (if any)
        if (arguments.length < 3) {
            if (typeof limit == "function") {
                // no optional params are passed
                callback = limit;
                limit = defaultLimit;
                offset = defaultOffset;
            } else {
                // only limit is passed
                callback = offset;
                offset = defaultOffset;
            }
        }

        this._discoveryService.getInfoObject(
            "trash",
            function (error, trash) {
                if (error) {
                    callback(error, trash);
                    return;
                }

                that._connectionManager.request(
                    "GET",
                    trash._href + '?offset=' + offset + '&limit=' + limit,
                    "",
                    {"Accept": trash["_media-type"]},
                    callback
                );
            }
        );
    };

    /**
     *  Loads target thrash can item
     *
     * @method loadTrashItem
     * @param trashItemId {String} target trash item identifier (e.g. "/api/ezp/v2/content/trash/1")
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    ContentService.prototype.loadTrashItem = function (trashItemId, callback) {
        this._connectionManager.request(
            "GET",
            trashItemId,
            "",
            {"Accept": "application/vnd.ez.api.TrashItem+json"},
            callback
        );
    };

    /**
     *  Restores target trashItem
     *
     * @method recover
     * @param trashItemId {String} target trash item identifier (e.g. "/api/ezp/v2/content/trash/1")
     * @param [destination] {String} if given the trash item is restored under this location otherwise under its original parent location
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    ContentService.prototype.recover = function (trashItemId, destination, callback) {

        var headers = {"Accept": "application/vnd.ez.api.TrashItem+json"};

        if ((typeof destination != "function")) {
            headers.Destination = destination;
        } else {
            callback = destination;
        }

        this._connectionManager.request(
            "MOVE",
            trashItemId,
            "",
            headers,
            callback
        );
    };

    /**
     *  Delete target trashItem
     *
     * @method deleteTrashItem
     * @param trashItemId {String} target trash item identifier (e.g. "/api/ezp/v2/content/trash/1")
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    ContentService.prototype.deleteTrashItem = function (trashItemId, callback) {
        this._connectionManager.request(
            "DELETE",
            trashItemId,
            "",
            {},
            callback
        );
    };

    /**
     *  Empty the trash can
     *
     * @method emptyThrash
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    ContentService.prototype.emptyThrash = function (callback) {
        var that = this;

        this._discoveryService.getInfoObject(
            "trash",
            function (error, trash) {
                if (error) {
                    callback(error, trash);
                    return;
                }

                that._connectionManager.request(
                    "DELETE",
                    trash._href,
                    "",
                    {},
                    callback
                );
            }
        );
    };

// ******************************
// ObjectStates management
// ******************************

    /**
     *  Loads all the ObjectState groups
     *
     * @method loadObjectStateGroups
     * @param objectStateGroups {String} path to root objectStateGroups (will be replaced by auto-discovered soon)
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    ContentService.prototype.loadObjectStateGroups = function (objectStateGroups, callback) {
        this._connectionManager.request(
            "GET",
            objectStateGroups,
            "",
            {"Accept": "application/vnd.ez.api.ObjectStateGroupList+json"},
            callback
        );
    };

    /**
     *  Loads target ObjectState group
     *
     * @method loadObjectStateGroup
     * @param objectStateGroupId {String} target object state group identifier (e.g. "/api/ezp/v2/content/objectstategroups/2")
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    ContentService.prototype.loadObjectStateGroup = function (objectStateGroupId, callback) {
        this._connectionManager.request(
            "GET",
            objectStateGroupId,
            "",
            {"Accept": "application/vnd.ez.api.ObjectStateGroup+json"},
            callback
        );
    };

    /**
     *  Create a new ObjectState group
     *
     * @method createObjectStateGroup
     * @param objectStateGroups {String} path to root objectStateGroups (will be replaced by auto-discovered soon)
     * @param objectStateGroupCreateStruct {ObjectStateGroupCreateStruct} object describing new ObjectState group to be created
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    ContentService.prototype.createObjectStateGroup = function (objectStateGroups, objectStateGroupCreateStruct, callback) {
        this._connectionManager.request(
            "POST",
            objectStateGroups,
            JSON.stringify(objectStateGroupCreateStruct.body),
            objectStateGroupCreateStruct.headers,
            callback
        );
    };

    /**
     *  Update target ObjectState group
     *
     * @method updateObjectStateGroup
     * @param objectStateGroupId {String} target object state group identifier (e.g. "/api/ezp/v2/content/objectstategroups/2")
     * @param objectStateGroupUpdateStruct {ObjectStateGroupUpdateStruct} object describing changes to target ObjectState group
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    ContentService.prototype.updateObjectStateGroup = function (objectStateGroupId, objectStateGroupUpdateStruct, callback) {
        this._connectionManager.request(
            "PATCH",
            objectStateGroupId,
            JSON.stringify(objectStateGroupUpdateStruct.body),
            objectStateGroupUpdateStruct.headers,
            callback
        );
    };

    /**
     *  Delete target ObjectState group
     *
     * @method deleteObjectStateGroup
     * @param objectStateGroupId {String} target object state group identifier (e.g. "/api/ezp/v2/content/objectstategroups/2")
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    ContentService.prototype.deleteObjectStateGroup = function (objectStateGroupId, callback) {
        this._connectionManager.request(
            "DELETE",
            objectStateGroupId,
            "",
            {},
            callback
        );
    };

    /**
     *  Creates a new ObjectState in target group
     *
     * @method createObjectState
     * @param objectStateGroupId {String} target group, where new object state should be created (e.g. "/api/ezp/v2/content/objectstategroups/2")
     * @param objectStateCreateStruct {ObjectStateCreateStruct} object describing new ObjectState to be created
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    ContentService.prototype.createObjectState = function (objectStateGroupId, objectStateCreateStruct, callback) {
        this._connectionManager.request(
            "POST",
            objectStateGroupId + "/objectstates",
            JSON.stringify(objectStateCreateStruct.body),
            objectStateCreateStruct.headers,
            callback
        );
    };

    /**
     *  Load target ObjectState
     *
     * @method loadObjectState
     * @param objectStateId {String} target object state identifier (e.g. "/api/ezp/v2/content/objectstategroups/7/objectstates/5")
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    ContentService.prototype.loadObjectState = function (objectStateId, callback) {
        this._connectionManager.request(
            "GET",
            objectStateId,
            "",
            {"Accept": "application/vnd.ez.api.ObjectState+json"},
            callback
        );
    };

    /**
     *  Update target ObjectState
     *
     * @method updateObjectState
     * @param objectStateId {String} target object state identifier (e.g. "/api/ezp/v2/content/objectstategroups/7/objectstates/5")
     * @param objectStateUpdateStruct {ObjectStateUpdateStruct} object describing changes to target ObjectState
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    ContentService.prototype.updateObjectState = function (objectStateId, objectStateUpdateStruct, callback) {
        this._connectionManager.request(
            "PATCH",
            objectStateId,
            JSON.stringify(objectStateUpdateStruct.body),
            objectStateUpdateStruct.headers,
            callback
        );
    };

    /**
     *  Delete target ObjectState
     *
     * @method deleteObjectState
     * @param objectStateId {String} target object state identifier (e.g. "/api/ezp/v2/content/objectstategroups/7/objectstates/5")
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    ContentService.prototype.deleteObjectState = function (objectStateId, callback) {
        this._connectionManager.request(
            "DELETE",
            objectStateId,
            "",
            {},
            callback
        );
    };

    /**
     *  Get ObjectStates of target content
     *
     * @method getContentState
     * @param contentStatesId {String} link to target content's object states (should be auto-discovered from contentId)
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    ContentService.prototype.getContentState = function (contentStatesId, callback) {
        this._connectionManager.request(
            "GET",
            contentStatesId,
            "",
            {"Accept": "application/vnd.ez.api.ContentObjectStates+json"},
            callback
        );
    };

    /**
     *  Set ObjectStates of a content
     *
     * @method setContentState
     * @param contentStatesId {String} link to target content's object states (should be auto-discovered from contentId)
     * @param objectStates {Array}
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentService"}}Note on the callbacks usage{{/crossLink}} for more info)
     * @example
     *     contentService.loadObjectState(
     *          "/api/ezp/v2/content/objectstategroups/4/objectstates/3",
     *          function (error, objectStateResponse) {
     *              // possible error should be handled...
     *
     *              var objectStates = {};
     *              // Extra odd structure, but it works!
     *              objectStates.ObjectState = {};
     *              objectStates.ObjectState.ObjectState = {};
     *              objectStates.ObjectState.ObjectState = JSON.parse(objectStateResponse.body);
     *
     *              contentService.setContentState(
     *                  "/api/ezp/v2/content/objects/17/objectstates",
     *                  objectStates,
     *                  callback
     *              );
     *          }
     *     );
     */
    ContentService.prototype.setContentState = function (contentStatesId, objectStates, callback) {
        this._connectionManager.request(
            "PATCH",
            contentStatesId,
            JSON.stringify(objectStates),
            {
                "Accept": "application/vnd.ez.api.ContentObjectStates+json",
                "Content-Type": "application/vnd.ez.api.ContentObjectStates+json"
            },
            callback
        );
    };

// ******************************
// URL Aliases management
// ******************************

    /**
     *  Creates a new UrlAlias
     *
     * @method createUrlAlias
     * @param urlAliases {String} link to root UrlAliases resource (should be auto-discovered)
     * @param urlAliasCreateStruct {UrlAliasCreateStruct} object describing new UrlAlias to be created
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    ContentService.prototype.createUrlAlias = function (urlAliases, urlAliasCreateStruct, callback) {
        this._connectionManager.request(
            "POST",
            urlAliases,
            JSON.stringify(urlAliasCreateStruct.body),
            urlAliasCreateStruct.headers,
            callback
        );
    };

    /**
     *  Loads all the global UrlAliases
     *
     * @method loadUrlAliases
     * @param urlAliases {String} link to root UrlAliases resource (should be auto-discovered)
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    ContentService.prototype.listGlobalAliases = function (urlAliases, callback) {
        this._connectionManager.request(
            "GET",
            urlAliases,
            "",
            {"Accept": "application/vnd.ez.api.UrlAliasRefList+json"},
            callback
        );
    };

    /**
     *  Loads all the UrlAliases for a location
     *
     * @method listLocationAliases
     * @param locationUrlAliases {String} link to target location's UrlAliases (should be auto-discovered from locationId)
     * @param [custom=true] {boolean} this flag indicates weather autogenerated (false) or manual url aliases (true) should be returned
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    ContentService.prototype.listLocationAliases = function (locationUrlAliases, custom, callback) {

        var parameters;

        // default values for omitted parameters (if any)
        if (arguments.length < 3) {
            callback = custom;
            custom = true;
        }

        parameters = (custom === true) ? "" : "?custom=false";

        this._connectionManager.request(
            "GET",
            locationUrlAliases + '/urlaliases' + parameters,
            "",
            {"Accept": "application/vnd.ez.api.UrlAliasRefList+json"},
            callback
        );
    };

    /**
     *  Load target URL Alias
     *
     * @method loadUrlAlias
     * @param urlAliasId {String} target url alias identifier (e.g. "/api/ezp/v2/content/urlaliases/0-a903c03b86eb2987889afa5fe17004eb")
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    ContentService.prototype.loadUrlAlias = function (urlAliasId, callback) {
        this._connectionManager.request(
            "GET",
            urlAliasId,
            "",
            {"Accept": "application/vnd.ez.api.UrlAlias+json"},
            callback
        );
    };

    /**
     *  Delete target URL Alias
     *
     * @method deleteUrlAlias
     * @param urlAliasId {String} target url alias identifier (e.g. "/api/ezp/v2/content/urlaliases/0-a903c03b86eb2987889afa5fe17004eb")
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    ContentService.prototype.deleteUrlAlias = function (urlAliasId, callback) {
        this._connectionManager.request(
            "DELETE",
            urlAliasId,
            "",
            {},
            callback
        );
    };

// ******************************
// URL Wildcards management
// ******************************

    /**
     *  Creates a new UrlWildcard
     *
     * @method createUrlWildcard
     * @param urlWildcards {String} link to root UrlWildcards resource (should be auto-discovered)
     * @param urlWildcardCreateStruct {UrlWildcardCreateStruct} object describing new UrlWildcard to be created
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    ContentService.prototype.createUrlWildcard = function (urlWildcards, urlWildcardCreateStruct, callback) {
        this._connectionManager.request(
            "POST",
            urlWildcards,
            JSON.stringify(urlWildcardCreateStruct.body),
            urlWildcardCreateStruct.headers,
            callback
        );
    };

    /**
     *  Loads all UrlWildcards
     *
     * @method loadUrlWildcards
     * @param urlWildcards {String} link to root UrlWildcards resource (should be auto-discovered)
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    ContentService.prototype.loadUrlWildcards = function (urlWildcards, callback) {
        this._connectionManager.request(
            "GET",
            urlWildcards,
            "",
            {"Accept": "application/vnd.ez.api.UrlWildcardList+json"},
            callback
        );
    };

    /**
     *  Loads target UrlWildcard
     *
     * @method loadUrlWildcard
     * @param urlWildcardId {String} target url wildcard identifier (e.g. "/api/ezp/v2/content/urlwildcards/1")
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    ContentService.prototype.loadUrlWildcard = function (urlWildcardId, callback) {
        this._connectionManager.request(
            "GET",
            urlWildcardId,
            "",
            {"Accept": "application/vnd.ez.api.UrlWildcard+json"},
            callback
        );
    };

    /**
     *  Deletes target UrlWildcard
     *
     * @method deleteUrlWildcard
     * @param urlWildcardId {String} target url wildcard identifier (e.g. "/api/ezp/v2/content/urlwildcards/1")
     * @param callback {Function} callback executed after performing the request (see
     *  {{#crossLink "ContentService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    ContentService.prototype.deleteUrlWildcard = function (urlWildcardId, callback) {
        this._connectionManager.request(
            "DELETE",
            urlWildcardId,
            "",
            {},
            callback
        );
    };

    /**
     * Loads an image variation
     *
     * @method loadImageVariation
     * @param variation {String} The variation REST id
     * @param callback {Function} Callback executed after performing the request (see
     *  {{#crossLink "ContentService"}}Note on the callbacks usage{{/crossLink}} for more info)
     */
    ContentService.prototype.loadImageVariation = function (variation, callback) {
        this._connectionManager.request(
            "GET",
            variation,
            "",
            {"Accept": "application\/vnd.ez.api.ContentImageVariation+json"},
            callback
        );
    };

    return ContentService;

});
