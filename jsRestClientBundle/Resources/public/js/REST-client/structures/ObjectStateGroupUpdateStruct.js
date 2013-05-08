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
    var ObjectStateGroupUpdateStruct = function(identifier, languageCode, names, descriptions){

        this.body = {};
        this.body.ObjectStateGroupUpdate = {};

        this.body.ObjectStateGroupUpdate.identifier = identifier;
        this.body.ObjectStateGroupUpdate.defaultLanguageCode = languageCode;
        this.body.ObjectStateGroupUpdate.names = {};
        this.body.ObjectStateGroupUpdate.names.value = names;
        this.body.ObjectStateGroupUpdate.descriptions = {};
        this.body.ObjectStateGroupUpdate.descriptions.value = descriptions;

        this.headers = {};
        this.headers["Accept"] = "application/vnd.ez.api.ObjectStateGroup+json";
        this.headers["Content-Type"] = "application/vnd.ez.api.ObjectStateGroupUpdate+json";

        return this;

    }

    return ObjectStateGroupUpdateStruct;

}());