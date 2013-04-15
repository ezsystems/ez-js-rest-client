var ContentService = (function() {
    "use strict";

    /**
     * Creates an instance of content service object
     *
     * @constructor
     * @param connectionManager {object} connection manager that will be used to send requests to REST service
     */
    var service = function(connectionManager) {

        // TODO: store url+method+headers relation to actual request in some preloaded matrix or smth like this?

        /**
         * list Root resources
         *
         * @method root
         * @param root {href}
         * @param callback {function} function, which will be executed on request success
         */
        service.prototype.root = function(root, callback) {
            connectionManager.request(
                "GET",
                root,
                {},
                { Accept : "application/vnd.ez.api.Root+json" },
                callback
            );
        };

// ******************************
// Sections management
// ******************************

        /**
         * List all sections
         *
         * @method loadSections
         * @param sections {href}
         * @param callback {function} function, which will be executed on request success
         */
        service.prototype.loadSections = function(sections, callback) {
            connectionManager.request(
                "GET",
                sections,
                {},
                { Accept : "application/vnd.ez.api.SectionList+json" },
                callback
            );
        };

        /**
         * Load single section
         *
         * @method loadSection
         * @param sectionId {href}
         * @param callback {function} function, which will be executed on request success
         */
        service.prototype.loadSection = function(sectionId, callback) {
            connectionManager.request(
                "GET",
                sectionId,
                {},
                { Accept : "application/vnd.ez.api.Section+json" },
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
        service.prototype.createSection = function(sections, sectionInput, callback) {
            connectionManager.request(
                "POST",
                sections,
                sectionInput,
                {
                    Accept : "application/vnd.ez.api.Section+json",
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
        service.prototype.updateSection = function(sectionId, sectionInput, callback) {
            connectionManager.request(
                "PATCH",
                sectionId,
                sectionInput,
                {
                    Accept : "application/vnd.ez.api.Section+json",
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
        service.prototype.deleteSection = function(sectionId, callback) {
            connectionManager.request(
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
        service.prototype.loadContentTypeGroups = function(typegroups, callback) {
            connectionManager.request(
                "GET",
                typegroups,
                {},
                { Accept : "application/vnd.ez.api.ContentTypeGroupList+json" },
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
        service.prototype.loadContentTypeGroup = function(contentTypeGroupId, callback) {
            connectionManager.request(
                "GET",
                contentTypeGroupId,
                {},
                { Accept : "application/vnd.ez.api.ContentTypeGroup+json" },
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
        service.prototype.createContent = function(contentObjects, contentCreate, callback) {
            connectionManager.request(
                "POST",
                contentObjects,
                contentCreate,
                {
                    Accept : "application/vnd.ez.api.Content+json",
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
        service.prototype.updateContentMetadata = function(content, contentMetadataUpdate, callback) {
            connectionManager.request(
                "PATCH",
                content,
                contentMetadataUpdate,
                {
                    Accept : "application/vnd.ez.api.ContentInfo+json",
                    "Content-Type" : "application/vnd.ez.api.ContentUpdate+json"
                },
                callback
            );
        };


        /**
         * Load single content info
         *
         * @method loadContent
         * @param contentId {href}
         * @param callback {function} function, which will be executed on request success
         */
        service.prototype.loadContentInfo = function(contentId, callback) {
            connectionManager.request(
                "GET",
                contentId,
                {},
                { Accept : "application/vnd.ez.api.ContentInfo+json" },
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
        service.prototype.loadContentInfoAndCurrentVersion = function(contentId, callback) {
            connectionManager.request(
                "GET",
                contentId,
                {},
                { Accept : "application/vnd.ez.api.Content+json" },
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
        service.prototype.deleteContent = function(contentId, callback) {
            connectionManager.request(
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
        service.prototype.copyContent = function(contentId, destinationId, callback) {
            connectionManager.request(
                "COPY",
                contentId,
                "",
                { Destination : destinationId },
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
        service.prototype.loadContent = function(versionedContentId, parameters, callback) {
            connectionManager.request(
                "GET",
                versionedContentId,
                parameters,
                { Accept : "application/vnd.ez.api.Version+json" },
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
        service.prototype.loadVersions = function(contentVersions, callback) {
            connectionManager.request(
                "GET",
                contentVersions,
                {},
                { Accept : "application/vnd.ez.api.VersionList+json" },
                callback
            );
        };


        /**
         * Returns update structure for Content
         *
         * @method newContentUpdateStruct
         * @param language {string}
         * @param user {string}
         * @param callback {function} function, which will be executed on request success
         */
        service.prototype.newContentUpdateStruct = function(language, user, callback) {

            var updateStruct = new ContentUpdateStruct(language, user);

            callback(updateStruct);
        };

        /**
         * Returns update structure for Content metadata
         *
         * @method newContentMetadataUpdateStruct
         * @param language {string}
         * @param user {string}
         * @param callback {function} function, which will be executed on request success
         */
        service.prototype.newContentMetadataUpdateStruct = function(language, user, callback) {

            var updateStruct = new ContentMetadataUpdateStruct(language, user);

            callback(updateStruct);
        };



        /**
         * Updates the fields of a draft
         *
         * @method updateContent
         * @param versionedContentId {href}
         * @param contentUpdateStruct {JSON} JSON string containing update structure (fields, languages, responseGroups)
         * @param callback {function} function, which will be executed on request success
         */
            service.prototype.updateContent = function(versionedContentId, contentUpdateStruct, callback) {
            connectionManager.request(
                "PATCH",
                contentUpdateStruct,
                versionUpdateStruct,
                {
                    Accept : "application/vnd.ez.api.Version+json",
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
        service.prototype.createContentDraft = function(versionedContentId, callback) {
            connectionManager.request(
                "COPY",
                versionedContentId,
                "",
                { Accept : "application/vnd.ez.api.Version+json" },
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
        service.prototype.deleteVersion = function(versionedContentId, callback) {
            connectionManager.request(
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
        service.prototype.publishVersion = function(versionedContentId, callback) {
            connectionManager.request(
                "PUBLISH",
                versionedContentId,
                "",
                {},
                callback
            );
        };



    };

    return service;

}());