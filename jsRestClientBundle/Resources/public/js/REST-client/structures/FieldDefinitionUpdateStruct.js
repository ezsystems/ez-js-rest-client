var FieldDefinitionUpdateStruct = (function() {
    "use strict";

    var FieldDefinitionUpdateStruct = function(identifier, fieldType, fieldGroup, names){

        this.body = {};
        this.body.FieldDefinitionUpdate = {};

        this.headers = {};
        this.headers.Accept = "application/vnd.ez.api.FieldDefinition+json";
        this.headers["Content-Type"] = "application/vnd.ez.api.FieldDefinitionUpdate+json";

        return this;
    };

    return FieldDefinitionUpdateStruct;

}());