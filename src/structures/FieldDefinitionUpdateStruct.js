var FieldDefinitionUpdateStruct = (function() {
    "use strict";

    /**
     * Returns a structure used to update a Field Definition. See ContentTypeService.updateFieldDefinition() call
     *
     * @class FieldDefinitionUpdateStruct
     * @constructor
     */
    var FieldDefinitionUpdateStruct = function(){

        this.body = {};
        this.body.FieldDefinitionUpdate = {};

        this.headers = {};
        this.headers.Accept = "application/vnd.ez.api.FieldDefinition+json";
        this.headers["Content-Type"] = "application/vnd.ez.api.FieldDefinitionUpdate+json";

        return this;
    };

    return FieldDefinitionUpdateStruct;

}());