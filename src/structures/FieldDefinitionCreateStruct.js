/* global define */
define(function () {
    "use strict";

    /**
     * Returns a structure used to create a new Field Definition. See ContentTypeService.addFieldDefinition() call
     *
     * @class FieldDefinitionCreateStruct
     * @constructor
     * @param identifier {String} unique field definiton identifer (e.g. "my-field")
     * @param fieldType {String} identifier of existing field type (e.g. "ezstring", "ezdate")
     * @param fieldGroup {String} identifier of existing field group (e.g. "content", "meta")
     * @param names {Array} Multi language value (see example in ContentTypeService.newFieldDefintionCreateStruct() doc)
     */
    var FieldDefinitionCreateStruct = function (identifier, fieldType, fieldGroup, names) {

        this.body = {};
        this.body.FieldDefinitionCreate = {};

        this.body.FieldDefinitionCreate.identifier = identifier;
        this.body.FieldDefinitionCreate.fieldType = fieldType;
        this.body.FieldDefinitionCreate.fieldGroup = fieldGroup;
        this.body.FieldDefinitionCreate.position = 1;

        this.body.FieldDefinitionCreate.isTranslatable = "true";
        this.body.FieldDefinitionCreate.isRequired = "false";
        this.body.FieldDefinitionCreate.isInfoCollector = "false";
        this.body.FieldDefinitionCreate.isSearchable = "false";

        this.body.FieldDefinitionCreate.defaultValue = "false";
        //TODO: find out which can be commented out

        this.body.FieldDefinitionCreate.names = {};
        this.body.FieldDefinitionCreate.names.value = names;

        this.body.FieldDefinitionCreate.descriptions = {};
        this.body.FieldDefinitionCreate.descriptions.value = [];

        this.headers = {};
        this.headers.Accept = "application/vnd.ez.api.FieldDefinition+json";
        this.headers["Content-Type"] = "application/vnd.ez.api.FieldDefinitionCreate+json";

        return this;
    };

    return FieldDefinitionCreateStruct;

});