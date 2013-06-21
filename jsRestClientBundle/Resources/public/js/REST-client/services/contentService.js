var ContentService = (function() {
    "use strict";

    /**
     * Creates an instance of content service object
     *
     * @constructor
     * @param connectionManager {object} connection manager that will be used to send requests to REST service
     */
    var ContentService = function(connectionManager, discoveryService) {

        this._connectionManager = connectionManager;
        this._discoveryService = discoveryService;

    };

    /**
     * list Root resources
     *
     * @method root
     * @param root {href}
     * @param callback {function} function, which will be executed on request success
     */
    ContentService.prototype.loadRoot = function loadRoot(root, callback) {
        this._connectionManager.request(
            "GET",
            root,
            {},
            { "Accept" : "application/vnd.ez.api.Root+json" },
            callback
        );
    };

// ******************************
// Structures
// ******************************

    /**
     * Returns update structure for Content
     *
     * @method newContentUpdateStruct
     * @param language {string}
     * @param user {string}
     */
    ContentService.prototype.newContentUpdateStruct = function newContentUpdateStruct(language, user) {

        return new ContentUpdateStruct(language, user);

    };

    /**
     * Returns update structure for Content metadata
     *
     * @method newContentMetadataUpdateStruct
     * @param language {string}
     * @param user {string}
     */
    ContentService.prototype.newContentMetadataUpdateStruct = function newContentMetadataUpdateStruct(language, user) {

        return new ContentMetadataUpdateStruct(language, user);

    };

    /**
     * Returns create structure for Content
     *
     * @method newContentCreateStruct
     * @param contentTypeId {href}
     * @param locationCreateStruct {object}
     * @param language {string}
     * @param user {string}
     */
    ContentService.prototype.newContentCreateStruct = function newContentCreateStruct(contentTypeId, locationCreateStruct, language, user) {

        return new ContentCreateStruct(contentTypeId, locationCreateStruct, language, user);

    };

    /**
     * Returns create structure for Location
     *
     * @method newLocationCreateStruct
     * @param parentLocationId {href}

     */
    ContentService.prototype.newLocationCreateStruct = function newLocationCreateStruct(parentLocationId) {

        return new LocationCreateStruct(parentLocationId);

    };

    /**
     * Returns update structure for Location
     *
     * @method newLocationUpdateStruct
     * @param parentLocationId {href}

     */
    ContentService.prototype.newLocationUpdateStruct = function newLocationUpdateStruct(parentLocationId) {

        return new LocationUpdateStruct();

    };

    /**
     * Returns create structure for View
     *
     * @method newViewCreateStruct
     * @param identifier {string}

     */
    ContentService.prototype.newViewCreateStruct = function newViewCreateStruct(identifier) {

        return new ViewCreateStruct(identifier);

    };

    /**
     * Returns create structure for Relation
     *
     * @method newRelationCreateStruct
     * @param destination {href}

     */
    ContentService.prototype.newRelationCreateStruct = function newRelationCreateStruct(destination) {

        return new RelationCreateStruct(destination);

    };

    /**
     * Returns create structure for ObjectStateGroup
     *
     * @method newObjectStateGroupCreateStruct
     * @param identifier {string}
     * @param languageCode {string}
     * @param names {Array} multiLanguageValuesType in JSON format
     */
    ContentService.prototype.newObjectStateGroupCreateStruct = function newObjectStateGroupCreateStruct(identifier, languageCode, names) {

        return new ObjectStateGroupCreateStruct(identifier, languageCode, names);

    };

    /**
     * Returns update structure for ObjectStateGroup
     *
     * @method newObjectStateGroupUpdateStruct
     */
    ContentService.prototype.newObjectStateGroupUpdateStruct = function newObjectStateGroupUpdateStruct() {

        return new ObjectStateGroupUpdateStruct();

    };


    /**
     * Returns create structure for ObjectState
     *
     * @method newObjectStateCreateStruct
     * @param identifier {string}
     * @param languageCode {string}
     * @param priority {int}
     * @param names {Array} multiLanguageValuesType in JSON format
     * @param descriptions {Array} multiLanguageValuesType in JSON format
     */
    ContentService.prototype.newObjectStateCreateStruct = function (identifier, languageCode, priority, names, descriptions) {

        return new ObjectStateCreateStruct(identifier, languageCode, priority, names, descriptions);

    };

    /**
     * Returns update structure for ObjectState
     *
     * @method newObjectStateUpdateStruct
     */
    ContentService.prototype.newObjectStateUpdateStruct = function newObjectStateUpdateStruct() {

        return new ObjectStateUpdateStruct();

    };



    /**
     * Returns create structure for UrlAlias
     *
     * @method newUrlAliasCreateStruct
     * @param languageCode {string}
     * @param resource {href}
     * @param path {string}
     */
    ContentService.prototype.newUrlAliasCreateStruct = function newUrlAliasCreateStruct(languageCode, resource, path) {

        return new UrlAliasCreateStruct(languageCode, resource, path);

    };

    /**
     * Returns create structure for UrlWildcard
     *
     * @method newUrlWildcardCreateStruct
     * @param sourceUrl {href}
     * @param destinationUrl {href}
     * @param forward {boolean}
     */
    ContentService.prototype.newUrlWildcardCreateStruct = function newUrlWildcardCreateStruct(sourceUrl, destinationUrl, forward) {

        return new UrlWildcardCreateStruct(sourceUrl, destinationUrl, forward);

    };

// ******************************
// Sections management
// ******************************

    /**
     * List all sections
     *
     * @method loadSections
     * @param callback {function} function, which will be executed on request success
     */
    ContentService.prototype.loadSections = function loadSections(callback) {

        var that = this;

        this._discoveryService.getInfoObject(
            "sections",
            function(error, sections) {
                if (!error) {

                    that._connectionManager.request(
                        "GET",
                        sections._href,
                        {},
                        { "Accept" : sections["_media-type"] },
                        callback
                    );

                } else {
                    callback(error, false);
                }
            }
        );

    };

    /**
     * Load single section
     *
     * @method loadSection
     * @param sectionId {href}
     * @param callback {function} function, which will be executed on request success
     */
    ContentService.prototype.loadSection = function loadSection(sectionId, callback) {
        this._connectionManager.request(
            "GET",
            sectionId,
            {},
            { "Accept" : "application/vnd.ez.api.Section+json" },
            callback
        );
    };

    /**
     * Create new section
     *
     * @method createSection
     * @param sections {href}
     * @param sectionInput {JSON} json string describing section to be created
     * @param callback {function} function, which will be executed on request success
     */
    ContentService.prototype.createSection = function createSection(sections, sectionInput, callback) {
        this._connectionManager.request(
            "POST",
            sections,
            sectionInput,
            {
                "Accept" : "application/vnd.ez.api.Section+json",
                "Content-Type" : "application/vnd.ez.api.SectionInput+json"
            },
            callback
        );
    };

    /**
     * Update section
     *
     * @method updateSection
     * @param sectionId {href}
     * @param sectionInput {JSON} json string describing section to be created
     * @param callback {function} function, which will be executed on request success
     */
    ContentService.prototype.updateSection = function updateSection(sectionId, sectionInput, callback) {
        this._connectionManager.request(
            "PATCH",
            sectionId,
            sectionInput,
            {
                "Accept" : "application/vnd.ez.api.Section+json",
                "Content-Type" : "application/vnd.ez.api.SectionInput+json"
            },
            callback
        );
    };

    /**
     * Delete section
     *
     * @method deleteSection
     * @param sectionId {href}
     * @param callback {function} function, which will be executed on request success
     */
    ContentService.prototype.deleteSection = function deleteSection(sectionId, callback) {
        this._connectionManager.delete(
            sectionId,
            callback
        );
    };

// ******************************
// Content Type groups management
// ******************************


// ******************************
// Content management
// ******************************

    /**
     * Creates a new content draft assigned to the authenticated user.
     *
     * @method createContent
     * @param contentObjects {href} href to contentObjects resource
     * @param contentCreate {JSON} json string describing content to be created
     * @param callback {function} function, which will be executed on request success
     */
    ContentService.prototype.createContent = function createContent(contentObjects, contentCreateStruct, callback) {
        this._connectionManager.request(
            "POST",
            contentObjects,
            JSON.stringify(contentCreateStruct.body),
            contentCreateStruct.headers,
            callback
        );
    };

    /**
     * Update content metadata.
     *
     * @method updateContentMetadata
     * @param content {href} href to content resource
     * @param contentMetadataUpdate {JSON} json string describing update of the content metadata
     * @param callback {function} function, which will be executed on request success
     */
    ContentService.prototype.updateContentMetadata = function updateContentMetadata(content, contentMetadataUpdate, callback) {
        this._connectionManager.request(
            "PATCH",
            content,
            JSON.stringify(contentMetadataUpdate.body),
            contentMetadataUpdate.headers,
            callback
        );
    };

    /**
     * Load single content by remoteId
     *
     * @method loadContentByRemoteId
     * @param remoteId {string}
     * @param callback {function} function, which will be executed on request success
     */
    ContentService.prototype.loadContentByRemoteId = function loadContentByRemoteId(remoteId, callback) {

        var that = this;

        this._discoveryService.getInfoObject(
            "content",
            function(error, contentObjects){
                if (!error) {
                    that._connectionManager.request(
                        "GET",
                        contentObjects._href + '?remoteId=' + remoteId,
                        { "remoteId" : remoteId },
                        { "Accept" : contentObjects["_media-type"] },
                        callback
                    );
                } else {
                    callback(error, false);
                }
            }
        );


    };

    /**
     * Load single content info
     *
     * @method loadContent
     * @param contentId {href}
     * @param callback {function} function, which will be executed on request success
     */
    ContentService.prototype.loadContentInfo = function loadContentInfo(contentId, callback) {
        this._connectionManager.request(
            "GET",
            contentId,
            {},
            { "Accept" : "application/vnd.ez.api.ContentInfo+json" },
            callback
        );
    };

    /**
     * Load single content info with embedded current version
     *
     * @method loadContentInfoAndCurrentVersion
     * @param contentId {href}
     * @param callback {function} function, which will be executed on request success
     */
    ContentService.prototype.loadContentInfoAndCurrentVersion = function loadContentInfoAndCurrentVersion(contentId, callback) {
        this._connectionManager.request(
            "GET",
            contentId,
            {},
            { "Accept" : "application/vnd.ez.api.Content+json" },
            callback
        );
    };

    /**
     * Delete content
     *
     * @method deleteContent
     * @param contentId {href}
     * @param callback {function} function, which will be executed on request success
     */
    ContentService.prototype.deleteContent = function deleteContent(contentId, callback) {
        this._connectionManager.delete(
            contentId,
            callback
        );
    };

    /**
     * Copy content
     *
     * @method copyContent
     * @param contentId {href}
     * @param destinationId {href} A location resource to which the content object should be copied
     * @param callback {function} function, which will be executed on request success
     */
    ContentService.prototype.copyContent = function copyContent(contentId, destinationId, callback) {
        this._connectionManager.request(
            "COPY",
            contentId,
            "",
            { "Destination" : destinationId },
            callback
        );
    };

// ******************************
// Versions management
// ******************************

    /**
     * Load current content version
     *
     * @method loadCurrentVersion
     * @param contentId {href}
     * @param callback {function} function, which will be executed on request success
     */
    ContentService.prototype.loadCurrentVersion = function loadCurrentVersion(contentId, callback) {
        var that = this;

        this.loadContentInfo(
            contentId,
            function(error, contentResponse){
                if (!error) {

                    var currentVersion = JSON.parse(contentResponse.body).Content.CurrentVersion;

                    that._connectionManager.request(
                        "GET",
                        currentVersion._href,
                        {},
                        { "Accept" : currentVersion["_media-type"] },
                        callback
                    );

                } else {
                    callback(error, false);
                }
            }
        );
    };


    /**
     * Loads a specific version of a content object. This method returns fields and relations
     *
     * @method loadContent
     * @param versionedContentId {href}
     * @param parameters {JSON} JSON string containing parameters (fields, languages, responseGroups)
     * @param callback {function} function, which will be executed on request success
     */
    ContentService.prototype.loadContent = function loadContent(versionedContentId, parameters, callback) {
        this._connectionManager.request(
            "GET",
            versionedContentId,
            parameters,
            { "Accept" : "application/vnd.ez.api.Version+json" },
            callback
        );
    };


    /**
     *  Loads all versions for the given content
     *
     * @method loadContentCurrentVersion
     * @param contentId {href}
     * @param callback {function} function, which will be executed on request success
     */
    ContentService.prototype.loadVersions = function loadVersions(contentId, callback) {

        var that = this;

        this.loadContentInfo(
            contentId,
            function(error, contentResponse){
                if (!error) {

                    var contentVersions = JSON.parse(contentResponse.body).Content.Versions;

                    that._connectionManager.request(
                        "GET",
                        contentVersions._href,
                        {},
                        { "Accept" : contentVersions["_media-type"] },
                        callback
                    );

                } else {
                    callback(error, false);
                }
            }
        );
    };


    /**
     * Updates the fields of a draft
     *
     * @method updateContent
     * @param versionedContentId {href}
     * @param contentUpdateStruct {JSON} JSON string containing update structure (fields, languages, responseGroups)
     * @param callback {function} function, which will be executed on request success
     */
    ContentService.prototype.updateContent = function updateContent(versionedContentId, contentUpdateStruct, callback) {
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
     * @param contentId {href}
     * @param versionId {int}
     * @param callback {function} function, which will be executed on request success
     */
    ContentService.prototype.createContentDraft = function createContentDraft(contentId, versionId, callback) {

        var that = this,
            contentVersions,
            currentVersion;

        this.loadContentInfo(
            contentId,
            function(error, contentResponse){
                if (!error) {

                    if (versionId !== null) {
                        // Version id is declared

                        console.log(versionId);

                        contentVersions = JSON.parse(contentResponse.body).Content.Versions;

                        that._connectionManager.request(
                            "COPY",
                            contentVersions._href + "/" + versionId,
                            "",
                            { "Accept" : "application/vnd.ez.api.Version+json" },
                            callback
                        );

                    } else {
                        // Version id is NOT declared

                        currentVersion = JSON.parse(contentResponse.body).Content.CurrentVersion;

                        that._connectionManager.request(
                            "COPY",
                            currentVersion._href,
                            "",
                            { "Accept" : "application/vnd.ez.api.Version+json" },
                            callback
                        );

                    }
                } else {
                    callback(error, false);
                }
            }
        );
    };


    /**
     * Deletes specific version of the content.
     *
     * @method deleteVersion
     * @param versionedContentId {href}
     * @param callback {function} function, which will be executed on request success
     */
    ContentService.prototype.deleteVersion = function deleteVersion(versionedContentId, callback) {
        this._connectionManager.delete(
            versionedContentId,
            callback
        );
    };


    /**
     * Publishes specific version of the content.
     *
     * @method publishVersion
     * @param versionedContentId {href}
     * @param callback {function} function, which will be executed on request success
     */
    ContentService.prototype.publishVersion = function publishVersion(versionedContentId, callback) {
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
     * Creates a new location for the given content object
     *
     * @method createLocation
     * @param objectLocations {href}
     * @param locationCreateStruct {object}
     * @param callback {function} function, which will be executed on request success
     */
    ContentService.prototype.createLocation = function createLocation(objectLocations, locationCreateStruct, callback) {
        this._connectionManager.request(
            "POST",
            objectLocations,
            JSON.stringify(locationCreateStruct.body),
            locationCreateStruct.headers,
            callback
        );
    };

    /**
     *  Loads all locations for the given content object
     *
     * @method loadLocations
     * @param objectLocations {href}
     * @param callback {function} function, which will be executed on request success
     */
    ContentService.prototype.loadLocations = function loadLocations(objectLocations, callback) {
        this._connectionManager.request(
            "GET",
            objectLocations,
            {},
            { "Accept" : "application/vnd.ez.api.LocationList+json" },
            callback
        );
    };

    /**
     *  Loads a location object according to given locationId
     *
     * @method loadLocation
     * @param locationId {href}
     * @param callback {function} function, which will be executed on request success
     */
    ContentService.prototype.loadLocation = function loadLocation(locationId, callback) {
        this._connectionManager.request(
            "GET",
            locationId,
            {},
            { "Accept" : "application/vnd.ez.api.Location+json" },
            callback
        );
    };

    /**
     *  Loads a location object according to given remoteId
     *
     * @method loadLocationByRemoteId
     * @param locations {href}
     * @param remoteId {href}
     * @param callback {function} function, which will be executed on request success
     */
    ContentService.prototype.loadLocationByRemoteId = function loadLocationByRemoteId(locations, remoteId, callback) {
        this._connectionManager.request(
            "GET",
            locations + '?remoteId=' + remoteId,
            "",
            { Accept : "application/vnd.ez.api.Location+json" },
            callback
        );
    };

    /**
     * Updates location for the given content object
     *
     * @method updateLocation
     * @param locationId {href}
     * @param locationUpdateStruct {object}
     * @param callback {function} function, which will be executed on request success
     */
    ContentService.prototype.updateLocation = function updateLocation(locationId, locationUpdateStruct, callback) {
        this._connectionManager.request(
            "PATCH",
            locationId,
            JSON.stringify(locationUpdateStruct.body),
            locationUpdateStruct.headers,
            callback
        );
    };

    /**
     *  Loads a locations children
     *
     * @method loadLocationChildren
     * @param locationId {href}
     * @param offset {int}
     * @param limit {int}
     * @param callback {function} function, which will be executed on request success
     */
    ContentService.prototype.loadLocationChildren = function loadLocationChildren(locationId, offset, limit, callback) {

        // default values for all the parameters
        offset = (typeof offset === "undefined") ? 0 : offset;
        limit = (typeof limit === "undefined") ? -1 : limit;

        var that = this;

        this.loadLocation(
            locationId,
            function(error, locationResponse){
                if (!error) {

                    var location = JSON.parse(locationResponse.body).Location;

                    that._connectionManager.request(
                        "GET",
                        location.Children._href + '?offset=' + offset + '&limit=' + limit,
                        {},
                        { "Accept" : location.Children["_media-type"] },
                        callback
                    );
                } else {
                    callback(error, false);
                }
            }
        );
    };

    /**
     *  Copies the subtree starting from "subtree" as a new subtree of "targetLocation"
     *
     * @method copySubtree
     * @param subtree {href}
     * @param targetLocation {href}
     * @param callback {function} function, which will be executed on request success
     */
    ContentService.prototype.copySubtree = function copySubtree(subtree, targetLocation, callback) {
        this._connectionManager.request(
            "COPY",
            subtree,
            "",
            { "Destination" : targetLocation },
            callback
        );
    };

    /**
     *  Moves the subtree to a new subtree of "targetLocation"
     *  The targetLocation can also be /content/trash where the location is put into the trash.
     *
     * @method moveSubtree
     * @param subtree {href}
     * @param targetLocation {href}
     * @param callback {function} function, which will be executed on request success
     */
    ContentService.prototype.moveSubtree = function moveSubtree(subtree, targetLocation, callback) {
        this._connectionManager.request(
            "MOVE",
            subtree,
            "",
            { "Destination" : targetLocation },
            callback
        );
    };

    /**
     *  Swaps the content of the "subtree" location to a "targetLocation"
     *
     * @method swapLocation
     * @param subtree {href}
     * @param targetLocation {href}
     * @param callback {function} function, which will be executed on request success
     */
    ContentService.prototype.swapLocation = function swapLocation(subtree, targetLocation, callback) {
        this._connectionManager.request(
            "SWAP",
            subtree,
            "",
            { "Destination" : targetLocation },
            callback
        );
    };

    /**
     *  Deletes the location and all it's subtree
     *  Every content object is deleted which does not have any other location.
     *  Otherwise the deleted location is removed from the content object.
     *  The children are recursively deleted.
     *
     * @method deleteLocation
     * @param locationId {href}
     * @param callback {function} function, which will be executed on request success
     */
    ContentService.prototype.deleteLocation = function deleteLocation(locationId, callback) {
        this._connectionManager.delete(
            locationId,
            callback
        );
    };

// ******************************
// Views management
// ******************************

    /**
     * Creates a new view
     *
     * @method createView
     * @param viewCreateStruct {object}
     * @param callback {function} function, which will be executed on request success
     */
    ContentService.prototype.createView = function createView(viewCreateStruct, callback) {

        var that = this;

        this._discoveryService.getInfoObject(
            "views",
            function(error, views) {
                if (!error) {

                    that._connectionManager.request(
                        "POST",
                        views._href,
                        JSON.stringify(viewCreateStruct.body),
                        viewCreateStruct.headers,
                        callback
                    );

                } else {
                    callback(error, false);
                }
            }
        );
    };


    /**
     * Returns a list of view uris. The list includes public view and private view of the authenticated user.
     *
     * @method loadViews
     * @param callback {function} function, which will be executed on request success
     */
    ContentService.prototype.loadViews = function loadViews(callback) {

        var that = this;

        this._discoveryService.getInfoObject(
            "views",
            function(error, views) {
                if (!error) {

                    that._connectionManager.request(
                        "GET",
                        views._href,
                        "",
                        {
                            "Accept" : views["_media-type"]
                        },
                        callback
                    );

                } else {
                    callback(error, false);
                }
            }
        );
    };

// ******************************
// Relations management
// ******************************

    /**
     *  Loads the relations of the given version
     *
     * @method loadRelations
     * @param versionedContentId {href}
     * @param offset {int}
     * @param limit {int}
     * @param callback {function} function, which will be executed on request success
     */
    ContentService.prototype.loadRelations = function loadRelations(versionedContentId, offset, limit, callback) {

        var that = this;

        this.loadContent(
            versionedContentId,
            {},
            function(error, versionResponse){
                if (!error) {

                    var version = JSON.parse(versionResponse.body).Version;

                    that._connectionManager.request(
                        "GET",
                        version.Relations._href + '?offset=' + offset + '&limit=' + limit,
                        {},
                        { "Accept" : version.Relations["_media-type"] },
                        callback
                    );
                } else {
                    callback(error, false);
                }
            }
        );
    };

    /**
     *  Loads the relations of the current version
     *
     * @method loadRelations
     * @param contentId {href}
     * @param offset {int}
     * @param limit {int}
     * @param callback {function} function, which will be executed on request success
     */
    ContentService.prototype.loadCurrentRelations = function loadCurrentRelations(contentId, offset, limit, callback) {

        var that = this;

        this.loadCurrentVersion(
            contentId,
            {},
            function(error, currentVersionResponse){
                if (!error) {

                    var currentVersion = JSON.parse(currentVersionResponse.body).Version;

                    that._connectionManager.request(
                        "GET",
                        currentVersion.Relations._href + '?offset=' + offset + '&limit=' + limit,
                        {},
                        { "Accept" : version.Relations["_media-type"] },
                        callback
                    );

                } else {
                    callback(error, false);
                }
            }
        );
    };


    /**
     *  Loads a relation
     *
     * @method loadRelation
     * @param relationId {href}
     * @param callback {function} function, which will be executed on request success
     */
    ContentService.prototype.loadRelation = function loadRelation(relationId, callback) {
        this._connectionManager.request(
            "GET",
            relationId,
            {},
            { "Accept" : "application/vnd.ez.api.Relation+json" },
            callback
        );
    };

    /**
     *  Create a relation
     *
     * @method addRelation
     * @param versionedContentId {href}
     * @param relationCreateStruct {Object}
     * @param callback {function} function, which will be executed on request success
     */
    ContentService.prototype.addRelation = function addRelation(versionedContentId, relationCreateStruct, callback) {

        var that = this;

        this.loadContent(
            versionedContentId,
            {},
            function(error, versionResponse){
                if (!error) {

                    var version = JSON.parse(versionResponse.body).Version;

                    that._connectionManager.request(
                        "POST",
                        version.Relations._href,
                        JSON.stringify(relationCreateStruct.body),
                        relationCreateStruct.headers,
                        callback
                    );
                } else {
                    callback(error, false);
                }
            }
        );
    };

    /**
     *  Delete a relation
     *
     * @method deleteRelation
     * @param relationId {href}
     * @param callback {function} function, which will be executed on request success
     */
    ContentService.prototype.deleteRelation = function deleteRelation(relationId, callback) {
        this._connectionManager.delete(
            relationId,
            callback
        );
    };

// ******************************
// Thrash management
// ******************************

    /**
     *  Loads all the thrash can items
     *
     * @method loadThrashItems
     * @param offset {int}
     * @param limit {int}
     * @param callback {function} function, which will be executed on request success
     */
    ContentService.prototype.loadThrashItems = function loadThrashItems(offset, limit, callback) {

        var that = this;

        this._discoveryService.getInfoObject(
            "trash",
            function(error, trash) {
                if (!error) {

                    that._connectionManager.request(
                        "GET",
                        trash._href + '?offset=' + offset + '&limit=' + limit,
                        {},
                        { "Accept" : trash["_media-type"] },
                        callback
                    );

                } else {
                    callback(error, false);
                }
            }
        );
    };

    /**
     *  Loads one thrash can item
     *
     * @method loadThrashItem
     * @param trashItemId {href}
     * @param callback {function} function, which will be executed on request success
     */
    ContentService.prototype.loadThrashItem = function loadThrashItem(trashItemId, callback) {
        this._connectionManager.request(
            "GET",
            trashItemId,
            {},
            { "Accept" : "application/vnd.ez.api.TrashItem+json" },
            callback
        );
    };

    /**
     *  Restores a trashItem
     *
     * @method recover
     * @param trashItemId {href}
     * @param destination {href} if given the trash item is restored under this location otherwise under its original parent location
     * @param callback {function} function, which will be executed on request success
     */
    ContentService.prototype.recover = function recover(trashItemId, destination, callback) {

        var headers = { "Accept" : "application/vnd.ez.api.TrashItem+json" };

        if ((typeof destination !== "undefined") && (destination !== null)) {
            headers.Destination = destination;
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
     *  Delete a trashItem
     *
     * @method recover
     * @param trashItemId {href}
     * @param callback {function} function, which will be executed on request success
     */
    ContentService.prototype.deleteTrashItem = function deleteTrashItem(trashItemId, callback) {
        this._connectionManager.delete(
            trashItemId,
            callback
        );
    };

    /**
     *  Empty the trash can
     *
     * @method emptyThrash
     * @param callback {function} function, which will be executed on request success
     */
    ContentService.prototype.emptyThrash = function emptyThrash(callback) {

        var that = this;

        this._discoveryService.getInfoObject(
            "trash",
            function(error, trash) {
                if (!error) {

                    that._connectionManager.request(
                        "DELETE",
                        trash._href,
                        "",
                        {},
                        callback
                    );

                } else {
                    callback(error, false);
                }
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
     * @param objectStateGroups {href}
     * @param callback {function} function, which will be executed on request success
     */
    ContentService.prototype.loadObjectStateGroups = function loadObjectStateGroups(objectStateGroups, callback) {
        this._connectionManager.request(
            "GET",
            objectStateGroups,
            {},
            { "Accept" : "application/vnd.ez.api.ObjectStateGroupList+json" },
            callback
        );
    };

    /**
     *  Loads an ObjectState group
     *
     * @method loadObjectStateGroup
     * @param objectStateGroupId {href}
     * @param callback {function} function, which will be executed on request success
     */
    ContentService.prototype.loadObjectStateGroup = function loadObjectStateGroup(objectStateGroupId, callback) {
        this._connectionManager.request(
            "GET",
            objectStateGroupId,
            {},
            { "Accept" : "application/vnd.ez.api.ObjectStateGroup+json" },
            callback
        );
    };


    /**
     *  Create an ObjectState group
     *
     * @method createObjectStateGroup
     * @param objectStateGroups {href}
     * @param objectStateGroupCreateStruct {Object}
     * @param callback {function} function, which will be executed on request success
     */
    ContentService.prototype.createObjectStateGroup = function createObjectStateGroup(objectStateGroups, objectStateGroupCreateStruct, callback) {
        this._connectionManager.request(
            "POST",
            objectStateGroups,
            JSON.stringify(objectStateGroupCreateStruct.body),
            objectStateGroupCreateStruct.headers,
            callback
        );
    };

    /**
     *  Update an ObjectState group
     *
     * @method updateObjectStateGroup
     * @param objectStateGroupId {href}
     * @param objectStateGroupUpdateStruct {Object}
     * @param callback {function} function, which will be executed on request success
     */
    ContentService.prototype.updateObjectStateGroup = function updateObjectStateGroup(objectStateGroupId, objectStateGroupUpdateStruct, callback) {
        this._connectionManager.request(
            "PATCH",
            objectStateGroupId,
            JSON.stringify(objectStateGroupUpdateStruct.body),
            objectStateGroupUpdateStruct.headers,
            callback
        );
    };

    /**
     *  Delete an ObjectState group
     *
     * @method deleteObjectStateGroup
     * @param objectStateGroupId {href}
     * @param callback {function} function, which will be executed on request success
     */
    ContentService.prototype.deleteObjectStateGroup = function deleteObjectStateGroup(objectStateGroupId, callback) {
        this._connectionManager.delete(
            objectStateGroupId,
            callback
        );
    };

    /**
     *  Creates an ObjectState
     *
     * @method createObjectState
     * @param objectStateGroupId {href}
     * @param objectStateCreateStruct {Object}
     * @param callback {function} function, which will be executed on request success
     */
    ContentService.prototype.createObjectState = function createObjectState(objectStateGroupId, objectStateCreateStruct, callback) {

        this._connectionManager.request(
            "POST",
            objectStateGroupId + "/objectstates",
            JSON.stringify(objectStateCreateStruct.body),
            objectStateCreateStruct.headers,
            callback
        );

    };

    /**
     *  Load an ObjectState
     *
     * @method loadObjectState
     * @param objectStateId {href}
     * @param callback {function} function, which will be executed on request success
     */
    ContentService.prototype.loadObjectState = function loadObjectState(objectStateId, callback) {
        this._connectionManager.request(
            "GET",
            objectStateId,
            {},
            { "Accept" : "application/vnd.ez.api.ObjectState+json" },
            callback
        );
    };

    /**
     *  Update an ObjectState
     *
     * @method updateObjectState
     * @param objectStateId {href}
     * @param objectStateUpdateStruct {Object}
     * @param callback {function} function, which will be executed on request success
     */
    ContentService.prototype.updateObjectState = function updateObjectState(objectStateId, objectStateUpdateStruct, callback) {
        this._connectionManager.request(
            "PATCH",
            objectStateId,
            JSON.stringify(objectStateUpdateStruct.body),
            objectStateUpdateStruct.headers,
            callback
        );
    };

    /**
     *  Delete an ObjectState
     *
     * @method deleteObjectState
     * @param objectStateId {href}
     * @param callback {function} function, which will be executed on request success
     */
    ContentService.prototype.deleteObjectState = function deleteObjectState(objectStateId, callback) {
        this._connectionManager.delete(
            objectStateId,
            callback
        );
    };

    /**
     *  Get ObjectStates of a content
     *
     * @method getContentState
     * @param contentStatesId {href}
     * @param callback {function} function, which will be executed on request success
     */
    ContentService.prototype.getContentState = function getContentState(contentStatesId, callback) {
        this._connectionManager.request(
            "GET",
            contentStatesId,
            {},
            { "Accept" : "application/vnd.ez.api.ContentObjectStates+json" },
            callback
        );
    };

    /**
     *  Set ObjectStates of a content
     *
     * @method setContentState
     * @param contentStatesId {href}
     * @param objectStates {Array}
     * @param callback {function} function, which will be executed on request success
     */
    ContentService.prototype.setContentState = function setContentState(contentStatesId, objectStates, callback) {
        this._connectionManager.request(
            "PATCH",
            contentStatesId,
            JSON.stringify(objectStates),
            {
                "Accept" : "application/vnd.ez.api.ContentObjectStates+json",
                "Content-Type" : "application/vnd.ez.api.ContentObjectStates+json"
            },
            callback
        );
    };

// ******************************
// URL Aliases management
// ******************************

    /**
     *  Creates an UrlAlias
     *
     * @method createUrlAlias
     * @param urlAliases {href}
     * @param urlAliasCreateStruct {Object}
     * @param callback {function} function, which will be executed on request success
     */
    ContentService.prototype.createUrlAlias = function createUrlAlias(urlAliases, urlAliasCreateStruct, callback) {
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
     * @param urlAliases {href}
     * @param callback {function} function, which will be executed on request success
     */
    ContentService.prototype.listGlobalAliases = function listGlobalAliases(urlAliases, callback) {
        this._connectionManager.request(
            "GET",
            urlAliases,
            {},
            { "Accept" : "application/vnd.ez.api.UrlAliasRefList+json" },
            callback
        );
    };

    /**
     *  Loads all the UrlAliases for a location
     *
     * @method listLocationAliases
     * @param locationUrlAliases {href}
     * @param custom {boolean}
     * @param callback {function} function, which will be executed on request success
     */
    ContentService.prototype.listLocationAliases = function listLocationAliases(locationUrlAliases, custom, callback) {

        custom = (typeof custom === "undefined") ? true : custom;
        var parameters = (custom === true) ? "" : "?custom=false";

        this._connectionManager.request(
            "GET",
            locationUrlAliases + '/urlaliases' + parameters,
            {},
            { "Accept" : "application/vnd.ez.api.UrlAliasRefList+json" },
            callback
        );
    };

    /**
     *  Load an URL Alias
     *
     * @method loadUrlAlias
     * @param urlAliasId {href}
     * @param callback {function} function, which will be executed on request success
     */
    ContentService.prototype.loadUrlAlias = function loadUrlAlias(urlAliasId, callback) {
        this._connectionManager.request(
            "GET",
            urlAliasId,
            {},
            { "Accept" : "application/vnd.ez.api.UrlAlias+json" },
            callback
        );
    };

    /**
     *  Delete an URL Alias
     *
     * @method deleteUrlAlias
     * @param urlAliasId {href}
     * @param callback {function} function, which will be executed on request success
     */
    ContentService.prototype.deleteUrlAlias = function deleteUrlAlias(urlAliasId, callback) {
        this._connectionManager.delete(
            urlAliasId,
            callback
        );
    };

// ******************************
// URL Wildcards management
// ******************************

    /**
     *  Creates an UrlWildcard
     *
     * @method createUrlWildcard
     * @param urlWildcards {href}
     * @param urlWildcardCreateStruct {Object}
     * @param callback {function} function, which will be executed on request success
     */
    ContentService.prototype.createUrlWildcard = function createUrlWildcard(urlWildcards, urlWildcardCreateStruct, callback) {
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
     * @param urlWildcards {href}
     * @param callback {function} function, which will be executed on request success
     */
    ContentService.prototype.loadUrlWildcards = function loadUrlWildcards(urlWildcards, callback) {
        this._connectionManager.request(
            "GET",
            urlWildcards,
            "",
            { "Accept" : "application/vnd.ez.api.UrlWildcardList+json" },
            callback
        );
    };

    /**
     *  Loads an UrlWildcard
     *
     * @method loadUrlWildcard
     * @param urlWildcardId {href}
     * @param callback {function} function, which will be executed on request success
     */
    ContentService.prototype.loadUrlWildcard = function loadUrlWildcard(urlWildcardId, callback) {
        this._connectionManager.request(
            "GET",
            urlWildcardId,
            "",
            { "Accept" : "application/vnd.ez.api.UrlWildcard+json" },
            callback
        );
    };

    /**
     *  Deletes an UrlWildcard
     *
     * @method deleteUrlWildcard
     * @param urlWildcardId {href}
     * @param callback {function} function, which will be executed on request success
     */
    ContentService.prototype.deleteUrlWildcard = function deleteUrlWildcard(urlWildcardId, callback) {
        this._connectionManager.delete(
            urlWildcardId,
            callback
        );
    };


    return ContentService;

}());


