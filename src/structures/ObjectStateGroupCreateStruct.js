/* global define */
define(function () {
    "use strict";

    /**
     * Returns a structure used to create a new Object State group. See ContentService.createObjectStateGroup() call
     *
     * @class ObjectStateGroupCreateStruct
     * @constructor
     * @param identifier {String} unique ObjectStateGroup identifier
     * @param languageCode {String} The language code (eng-GB, fre-FR, ...)
     * @param names {Array} multiLanguageValuesType in JSON format
     * @example
     *      var objectStateGroupCreateStruct = contentService.newObjectStateGroupCreateStruct(
     *          "some-id",
     *          "eng-US",
     *          [
     *              {
     *                  "_languageCode":"eng-US",
     *                  "#text":"Some Name"
     *              }
     *          ]
     *      );
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
        this.headers.Accept = "application/vnd.ez.api.ObjectStateGroup+json";
        this.headers["Content-Type"] = "application/vnd.ez.api.ObjectStateGroupCreate+json";

        return this;

    };

    return ObjectStateGroupCreateStruct;

});