var contentService = (function() {
    "use strict";

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



    };

    return service;

}());