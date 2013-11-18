/* global define */
define(function () {
    "use strict";

    /**
     * Returns a structure used to create a new Object State. See
     * {{#crossLink "ContentService/createObjectState"}}ContentService.createObjectState{{/crossLink}}
     *
     * @class ObjectStateCreateStruct
     * @constructor
     * @param identifier {String} unique ObjectState identifier (e.g. "some-new-state")
     * @param languageCode {String} The language code (eng-GB, fre-FR, ...)
     * @param priority {int}
     * @param names {Array} Multi language value (see example)
     * @param descriptions {Array} Multi language value (see example)
     * @example
     *      var objectStateCreateStruct = contentService.newObjectStateCreateStruct(
     *          "some-id",
     *          "eng-US",
     *          0,
     *          [
     *              {
     *                  "_languageCode":"eng-US",
     *                  "#text":"Some Name"
     *              }
     *          ],
     *          [
     *              {
     *                  "_languageCode":"eng-US",
     *                  "#text":"Some Description"
     *              }
     *          ]
     *      );
     */
    var ObjectStateCreateStruct = function (identifier, languageCode, priority, names, descriptions) {
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

});