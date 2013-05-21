var ObjectStateGroupUpdateStruct = (function() {
    "use strict";

    /**
     *  Creates an update structure for ObjectStateGroup
     *
     * @constructor
     * @param identifier {string}
     * @param languageCode {string}
     * @param names {Array} multiLanguageValuesType in JSON format
     * @param descriptions {Array} multiLanguageValuesType in JSON format
     */
    var ObjectStateGroupUpdateStruct = function(){

        this.body = {};
        this.body.ObjectStateGroupUpdate = {};

        this.headers = {};
        this.headers["Accept"] = "application/vnd.ez.api.ObjectStateGroup+json";
        this.headers["Content-Type"] = "application/vnd.ez.api.ObjectStateGroupUpdate+json";

        return this;

    }

    return ObjectStateGroupUpdateStruct;

}());