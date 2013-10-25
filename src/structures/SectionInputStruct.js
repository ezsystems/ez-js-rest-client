/* global define */
define(function () {
    "use strict";

    /**
     * Returns a structure used to create and update a Section. See for ex. ContentService.createSection() call
     *
     * @class SectionInputStruct
     * @constructor
     * @param identifier {String} unique section identifier
     * @param name {String} section name

     */
    var SectionInputStruct = function (identifier, name) {

        this.body = {};
        this.body.SectionInput = {};

        this.body.SectionInput.identifier = identifier;
        this.body.SectionInput.name = name;

        this.headers = {};
        this.headers.Accept = "application/vnd.ez.api.Section+json";
        this.headers["Content-Type"] = "application/vnd.ez.api.SectionInput+json";

        return this;
    };

    return SectionInputStruct;

});