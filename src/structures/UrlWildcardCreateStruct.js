var UrlWildcardCreateStruct = (function() {
    "use strict";

    var UrlWildcardCreateStruct = function(sourceUrl, destinationUrl, forward){

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

}());