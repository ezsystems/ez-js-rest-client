var ContentService = (function() {
    "use strict";

    /**
     * Creates an instance of content service object
     *
     * @constructor
     * @param connectionManager {object} connection manager that will be used to send requests to REST service
     */
    var ContentService = function(connectionManager, discoveryService) {

        this.connectionManager_ = connectionManager;
        this.discoveryService_ = discoveryService;

    };

    /**
     * list Root resources
     *
     * @method root
     * @param root {href}
     * @param callback {function} function, which will be executed on request success
     */
    ContentService.prototype.loadRoot = function(root, callback) {
        this.connectionManager_.request(
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
    ContentService.prototype.newContentUpdateStruct = function(language, user) {

        return new ContentUpdateStruct(language, user);

    };

    /**
     * Returns update structure for Content metadata
     *
     * @method newContentMetadataUpdateStruct
     * @param language {string}
     * @param user {string}
     */
    ContentService.prototype.newContentMetadataUpdateStruct = function(language, user) {

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
    ContentService.prototype.newContentCreateStruct = function(contentTypeId, locationCreateStruct, language, user) {

        return new ContentCreateStruct(contentTypeId, locationCreateStruct, language, user);

    };

    /**
     * Returns create structure for Location
     *
     * @method newLocationCreateStruct
     * @param parentLocationId {href}

     */
    ContentService.prototype.newLocationCreateStruct = function(parentLocationId) {

        return new LocationCreateStruct(parentLocationId);

    };

    /**
     * Returns update structure for Location
     *
     * @method newLocationUpdateStruct
     * @param parentLocationId {href}

     */
    ContentService.prototype.newLocationUpdateStruct = function(parentLocationId) {

        return new LocationUpdateStruct();

    };

    /**
     * Returns create structure for View
     *
     * @method newViewCreateStruct
     * @param identifier {string}

     */
    ContentService.prototype.newViewCreateStruct = function(identifier) {

        return new ViewCreateStruct(identifier);

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
    ContentService.prototype.loadSections = function(callback) {

        var that = this;

        this.discoveryService_.getInfoObject(
            "sections",
            function(error, sections) {
                if (!error) {

                    that.connectionManager_.request(
                        "GET",
                        sections["_href"],
                        {},
                        { "Accept" : sections["_media-type"] },
                        callback
                    );

                } else {
                    callback(error, false)
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
    ContentService.prototype.loadSection = function(sectionId, callback) {
        this.connectionManager_.request(
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
    ContentService.prototype.createSection = function(sections, sectionInput, callback) {
        this.connectionManager_.request(
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
    ContentService.prototype.updateSection = function(sectionId, sectionInput, callback) {
        this.connectionManager_.request(
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
    ContentService.prototype.deleteSection = function(sectionId, callback) {
        this.connectionManager_.request(
            "DELETE",
            sectionId,
            "",
            {},
            callback
        );
    };

// ******************************
// Content Type groups management
// ******************************

    /**
     * Load all content type groups
     *
     * @method loadContentTypeGroups
     * @param typegroups {href} reference to type groups resource
     * @param callback {function} function, which will be executed on request success
     */
    ContentService.prototype.loadContentTypeGroups = function(typegroups, callback) {
        this.connectionManager_.request(
            "GET",
            typegroups,
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
    ContentService.prototype.loadContentTypeGroup = function(contentTypeGroupId, callback) {
        this.connectionManager_.request(
            "GET",
            contentTypeGroupId,
            {},
            { "Accept" : "application/vnd.ez.api.ContentTypeGroup+json" },
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
     * @param contentObjects {href} href to contentObjects resource
     * @param contentCreate {JSON} json string describing content to be created
     * @param callback {function} function, which will be executed on request success
     */
    ContentService.prototype.createContent = function(contentObjects, contentCreate, callback) {
        this.connectionManager_.request(
            "POST",
            contentObjects,
            contentCreate,
            {
                "Accept" : "application/vnd.ez.api.Content+json",
                "Content-Type" : "application/vnd.ez.api.ContentCreate+json"
            },
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
    ContentService.prototype.updateContentMetadata = function(content, contentMetadataUpdate, callback) {
        this.connectionManager_.request(
            "PATCH",
            content,
            contentMetadataUpdate,
            {
                "Accept" : "application/vnd.ez.api.ContentInfo+json",
                "Content-Type" : "application/vnd.ez.api.ContentUpdate+json"
            },
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
    ContentService.prototype.loadContentByRemoteId = function(remoteId, callback) {

        var that = this;

        this.discoveryService_.getInfoObject(
            "content",
            function(error, contentObjects){
                that.connectionManager_.request(
                    "GET",
                    contentObjects["_href"] + '?remoteId=' + remoteId,
                    { "remoteId" : remoteId },
                    { "Accept" : contentObjects["_media-type"] },
                    callback
                );
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
    ContentService.prototype.loadContentInfo = function(contentId, callback) {
        this.connectionManager_.request(
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
     * @method loadContentCurrentVersion
     * @param contentId {href}
     * @param callback {function} function, which will be executed on request success
     */
    ContentService.prototype.loadContentInfoAndCurrentVersion = function(contentId, callback) {
        this.connectionManager_.request(
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
    ContentService.prototype.deleteContent = function(contentId, callback) {
        this.connectionManager_.request(
            "DELETE",
            contentId,
            "",
            {},
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
    ContentService.prototype.copyContent = function(contentId, destinationId, callback) {
        this.connectionManager_.request(
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
     * Loads a specific version of a content object. This method returns fields and relations
     *
     * @method loadContent
     * @param versionedContentId {href}
     * @param parameters {JSON} JSON string containing parameters (fields, languages, responseGroups)
     * @param callback {function} function, which will be executed on request success
     */
    ContentService.prototype.loadContent = function(versionedContentId, parameters, callback) {
        this.connectionManager_.request(
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
     * @param contentVersions {href}
     * @param callback {function} function, which will be executed on request success
     */
    ContentService.prototype.loadVersions = function(contentVersions, callback) {
        this.connectionManager_.request(
            "GET",
            contentVersions,
            {},
            { "Accept" : "application/vnd.ez.api.VersionList+json" },
            callback
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
    ContentService.prototype.updateContent = function(versionedContentId, contentUpdateStruct, callback) {
        this.connectionManager_.request(
            "PATCH",
            versionedContentId,
            contentUpdateStruct,
            {
                "Accept" : "application/vnd.ez.api.Version+json",
                "Content-Type" : "application/vnd.ez.api.VersionUpdate+json"
            },
            callback
        );
    };


    /**
     * Creates a draft from a published or archived version.
     *
     * @method createContentDraft
     * @param versionedContentId {href}
     * @param callback {function} function, which will be executed on request success
     */
    ContentService.prototype.createContentDraft = function(versionedContentId, callback) {
        this.connectionManager_.request(
            "COPY",
            versionedContentId,
            "",
            { "Accept" : "application/vnd.ez.api.Version+json" },
            callback
        );
    };


    /**
     * Deletes specific version of the content.
     *
     * @method deleteVersion
     * @param versionedContentId {href}
     * @param callback {function} function, which will be executed on request success
     */
    ContentService.prototype.deleteVersion = function(versionedContentId, callback) {
        this.connectionManager_.request(
            "DELETE",
            versionedContentId,
            "",
            {},
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
    ContentService.prototype.publishVersion = function(versionedContentId, callback) {
        this.connectionManager_.request(
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
    ContentService.prototype.createLocation = function(objectLocations, locationCreateStruct, callback) {
        this.connectionManager_.request(
            "POST",
            objectLocations,
            JSON.stringify(locationCreateStruct),
            {
                "Accept" : "application/vnd.ez.api.Location+json",
                "Content-Type" : "application/vnd.ez.api.LocationCreate+json"
            },
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
    ContentService.prototype.loadLocations = function(objectLocations, callback) {
        this.connectionManager_.request(
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
    ContentService.prototype.loadLocation = function(locationId, callback) {
        this.connectionManager_.request(
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
    ContentService.prototype.loadLocationByRemoteId = function(locations, remoteId, callback) {
        this.connectionManager_.request(
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
    ContentService.prototype.updateLocation = function(locationId, locationUpdateStruct, callback) {
        this.connectionManager_.request(
            "PATCH",
            locationId,
            JSON.stringify(locationUpdateStruct),
            {
                "Accept" : "application/vnd.ez.api.Location+json",
                "Content-Type" : "application/vnd.ez.api.LocationUpdate+json"
            },
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
    ContentService.prototype.loadLocationChildren = function(locationId, offset, limit, callback) {

        // default values for all the parameters
        offset = (typeof offset === "undefined") ? 0 : offset;
        limit = (typeof limit === "undefined") ? -1 : limit;

        var that = this;

        this.loadLocation(
            locationId,
            function(error, locationResponse){

                var location = JSON.parse(locationResponse.body).Location;

                that.connectionManager_.request(
                    "GET",
                    location.Children["_href"] + '?offset=' + offset + '&limit=' + limit,
                    {},
                    { "Accept" : location.Children["_media-type"] },
                    callback
                );

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
    ContentService.prototype.copySubtree = function(subtree, targetLocation, callback) {
        this.connectionManager_.request(
            "COPY",
            subtree,
            "",
            { "Destination" : targetLocation },
            callback
        );
    };

    /**
     *  Moves the subtree to a new subtree of "targetLocation"
     *
     * @method moveSubtree
     * @param subtree {href}
     * @param targetLocation {href}
     * @param callback {function} function, which will be executed on request success
     */
    ContentService.prototype.moveSubtree = function(subtree, targetLocation, callback) {
        this.connectionManager_.request(
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
    ContentService.prototype.swapLocation = function(subtree, targetLocation, callback) {
        this.connectionManager_.request(
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
    ContentService.prototype.deleteLocation = function(locationId, callback) {
        this.connectionManager_.request(
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
     * Creates a new view
     *
     * @method createView
     * @param viewCreateStruct {object}
     * @param callback {function} function, which will be executed on request success
     */
    ContentService.prototype.createView = function(viewCreateStruct, callback) {

        var that = this;

        this.discoveryService_.getInfoObject(
            "views",
            function(error, views) {
                if (!error) {

                    that.connectionManager_.request(
                        "POST",
                        views["_href"],
                        JSON.stringify(viewCreateStruct.body),
                        {
                            "Accept" : "application/vnd.ez.api.View+json",
                            "Content-Type" : viewCreateStruct.contentType
                        },
                        callback
                    );

                } else {
                    callback(error, false)
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
    ContentService.prototype.loadViews = function(callback) {

        var that = this;

        this.discoveryService_.getInfoObject(
            "views",
            function(error, views) {
                if (!error) {

                    that.connectionManager_.request(
                        "GET",
                        views["_href"],
                        "",
                        {
                            "Accept" : views["_media-type"]
                        },
                        callback
                    );

                } else {
                    callback(error, false)
                }
            }
        );
    };

// ******************************
// Relations management
// ******************************

    /**
     *  Loads loads the relations of the given version
     *
     * @method loadRelations
     * @param versionedContentId {href}
     * @param offset {int}
     * @param limit {int}
     * @param callback {function} function, which will be executed on request success
     */
    ContentService.prototype.loadRelations = function(versionedContentId, offset, limit, callback) {

        var that = this;

        this.loadContent(
            versionedContentId,
            {},
            function(error, contentResponse){

                var content = JSON.parse(contentResponse.body).Version;

                that.connectionManager_.request(
                    "GET",
                    content.Relations["_href"] + '?offset=' + offset + '&limit=' + limit,
                    {},
                    { "Accept" : content.Relations["_media-type"] },
                    callback
                );

            }
        );
    };

    return ContentService;

}());


