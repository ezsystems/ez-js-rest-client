var ObjectStateGroupCreateStruct = (function() {
    "use strict";

    /**
     *  Creates a create structure for ObjectStateGroup
     *
     * @constructor
     * @param identifier {string}
     * @param languageCode {string}
     * @param names {Array} multiLanguageValuesType in JSON format
     */
    var ObjectStateGroupCreateStruct = function(identifier, languageCode, names){

        this.body = {};
        this.body.ObjectStateGroupCreate = {};

        this.body.ObjectStateGroupCreate.identifier = identifier;
        this.body.ObjectStateGroupCreate.defaultLanguageCode = languageCode;

        this.body.ObjectStateGroupCreate.names = {};
        this.body.ObjectStateGroupCreate.names.value = names;

        this.body.ObjectStateGroupCreate.descriptions = {};
        this.body.ObjectStateGroupCreate.descriptions.value = [];


        this.headers = {};
        this.headers["Accept"] = "application/vnd.ez.api.ObjectStateGroup+json";
        this.headers["Content-Type"] = "application/vnd.ez.api.ObjectStateGroupCreate+json";

        return this;

    }

    return ObjectStateGroupCreateStruct;

}());