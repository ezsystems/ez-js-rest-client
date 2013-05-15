var ContentTypeUpdateStruct = (function() {
    "use strict";

    var ContentTypeUpdateStruct = function(){

        var now = JSON.parse(JSON.stringify(new Date()));

        this.body = {};
        this.body.ContentTypeUpdate = {};

        this.headers = {};
        this.headers["Accept"] = "application/vnd.ez.api.ContentType+json";
        this.headers["Content-Type"] = "application/vnd.ez.api.ContentTypeUpdate+json";

        return this;
    }

    return ContentTypeUpdateStruct;

}());