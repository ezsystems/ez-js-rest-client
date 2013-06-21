var ObjectStateCreateStruct = (function() {
    "use strict";

    /**
     *  Creates a create structure for ObjectState
     *
     * @constructor
     * @param identifier {string}
     * @param languageCode {string}
     * @param priority {int}
     * @param names {Array} multiLanguageValuesType in JSON format
     * @param descriptions {Array} multiLanguageValuesType in JSON format
     */
    var ObjectStateCreateStruct = function(identifier, languageCode, priority, names, descriptions){

        this.body = {};
        this.body.ObjectStateCreate = {};

        this.body.ObjectStateCreate.identifier = identifier;
        this.body.ObjectStateCreate.defaultLanguageCode = languageCode;
        this.body.ObjectStateCreate.priority = priority;
        this.body.ObjectStateCreate.names = {};
        this.body.ObjectStateCreate.names.value = names;
        this.body.ObjectStateCreate.descriptions = {};
        this.body.ObjectStateCreate.descriptions.value = descriptions;

        this.headers = {};
        this.headers.Accept = "application/vnd.ez.api.ObjectState+json";
        this.headers["Content-Type"] = "application/vnd.ez.api.ObjectStateCreate+json";

        return this;

    };

    return ObjectStateCreateStruct;

}());