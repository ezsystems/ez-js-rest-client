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
         * List all sections
         *
         * @method loadSections
         * @param callback {function} function, which will be executed on request success
         */
        service.prototype.loadSections = function(callback) {
            connectionManager.request(
                "GET",
                '/content/sections',
                {},
                { Accept : "application/vnd.ez.api.SectionList+json" },
                callback
            );
        };

        /**
         * Load single section
         *
         * @method loadSection
         * @param sectionId {int}
         * @param callback {function} function, which will be executed on request success
         */
        service.prototype.loadSection = function(sectionId, callback) {
            connectionManager.request(
                "GET",
                '/content/sections/' + sectionId,
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
        service.prototype.createSection = function(sectionInput, callback) {
            connectionManager.request(
                "POST",
                '/content/sections',
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
         * @param sectionId {int}
         * @param sectionInput {JSON} json string describing section to be created
         * @param callback {function} function, which will be executed on request success
         */
        service.prototype.updateSection = function(sectionId, sectionInput, callback) {
            connectionManager.request(
                "PATCH",
                '/content/sections/' + sectionId,
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
         * @param sectionId {int}
         * @param callback {function} function, which will be executed on request success
         */
        service.prototype.deleteSection = function(sectionId, callback) {
            connectionManager.request(
                "DELETE",
                '/content/sections/' + sectionId,
                "",
                {},
                callback
            );
        };


    };

    return service;

}());