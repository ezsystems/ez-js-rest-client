/* global define */
define(function () {
    "use strict";

    /**
     * Returns a structure used to create a new Url Wildcard object. See
     * {{#crossLink "ContentService/createUrlWildcard"}}ContentService.createUrlWildcard{{/crossLink}}
     *
     * @class UrlWildcardCreateStruct
     * @constructor
     * @param sourceUrl {String} new url wildcard
     * @param destinationUrl {String} existing resource where wildcard should point
     * @param forward {boolean} weather or not the wildcard should redirect to the resource
     */
    var UrlWildcardCreateStruct = function (sourceUrl, destinationUrl, forward) {
        this.body = {};
        this.body.UrlWildcardCreate = {};

        this.body.UrlWildcardCreate.sourceUrl = sourceUrl;
        this.body.UrlWildcardCreate.destinationUrl = destinationUrl;
        this.body.UrlWildcardCreate.forward = forward;

        this.headers = {};
        this.headers.Accept = "application/vnd.ez.api.UrlWildcard+json";
        this.headers["Content-Type"] = "application/vnd.ez.api.UrlWildcardCreate+json";

        return this;
    };

    return UrlWildcardCreateStruct;

});