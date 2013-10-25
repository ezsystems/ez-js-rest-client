/* global define */
define(function () {
    "use strict";

    /**
     * Returns a structure used to create a new UrlAlias object. See ContentService.createUrlAlias() call
     *
     * @class UrlAliasCreateStruct
     * @constructor
     * @param languageCode {String} The language code (eng-GB, fre-FR, ...)
     * @param resource {String} eZ Publish resource you want to create alias for
     * @param path {String} the new alias itself
     * @example
     *     var urlAliasCreateStruct = contentService.newUrlAliasCreateStruct(
     *         "eng-US",
     *         "content/search",
     *         "findme-alias"
     *     );
     */
    var UrlAliasCreateStruct = function (languageCode, resource, path) {

        this.body = {};
        this.body.UrlAliasCreate = {};

        this.body.UrlAliasCreate._type = "RESOURCE";

        this.body.UrlAliasCreate.resource = resource;
        this.body.UrlAliasCreate.path = path;

        this.body.UrlAliasCreate.alwaysAvailable = "false";
        this.body.UrlAliasCreate.forward = "false";
        this.body.UrlAliasCreate.languageCode = languageCode;

        this.headers = {};
        this.headers.Accept = "application/vnd.ez.api.UrlAlias+json";
        this.headers["Content-Type"] = "application/vnd.ez.api.UrlAliasCreate+json";

        return this;
    };

    return UrlAliasCreateStruct;

});