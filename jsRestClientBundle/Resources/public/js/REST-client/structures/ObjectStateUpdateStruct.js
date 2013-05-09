var ObjectStateUpdateStruct = (function() {
    "use strict";

    /**
     *  Creates an update structure for ObjectState
     *
     * @constructor
     * @param identifier {string}
     * @param languageCode {string}
     * @param priority {int}
     * @param names {Array} multiLanguageValuesType in JSON format
     * @param descriptions {Array} multiLanguageValuesType in JSON format
     */
    var ObjectStateUpdateStruct = function(identifier, languageCode, priority, names, descriptions){

        this.body = {};
        this.body.ObjectStateUpdate = {};

        this.body.ObjectStateUpdate.identifier = identifier;
        this.body.ObjectStateUpdate.defaultLanguageCode = languageCode;
        this.body.ObjectStateUpdate.priority = priority;        
        this.body.ObjectStateUpdate.names = {};
        this.body.ObjectStateUpdate.names.value = names;
        this.body.ObjectStateUpdate.descriptions = {};
        this.body.ObjectStateUpdate.descriptions.value = descriptions;

        this.headers = {};
        this.headers["Accept"] = "application/vnd.ez.api.ObjectState+json";
        this.headers["Content-Type"] = "application/vnd.ez.api.ObjectStateUpdate+json";

        return this;

    }

    return ObjectStateUpdateStruct;

}());