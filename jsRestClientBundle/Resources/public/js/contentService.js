var contentService = (function() {
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


        /**
         * List all sections
         *
         * @method loadSections
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
// ******************************

        /**
         * Load all content type groups
         *
         * @method loadContentTypeGroups
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
// ******************************

        /**
         * Creates a new content draft assigned to the authenticated user.
         *
         * @method createContent
         * @param content {href} href to content resource
         * @param contentInput {JSON} json string describing content to be created
         * @param callback {function} function, which will be executed on request success
         */
        service.prototype.createContent = function(content, contentInput, callback) {
            connectionManager.request(
                "GET",
                content,
                contentInput,
                { Accept : "application/vnd.ez.api.ContentInfo+json" },
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
         *  Loads all versions for the given content
         *
         * @method loadContentCurrentVersion
         * @param contentId {href}
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


    };

    return service;

}());