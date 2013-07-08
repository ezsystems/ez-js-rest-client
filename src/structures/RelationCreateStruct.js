var RelationCreateStruct = (function() {
    "use strict";

    var RelationCreateStruct = function(destination){

        this.body = {};
        this.body.RelationCreate = {};
        this.body.RelationCreate.Destination = {
            _href: destination
        };

        this.headers = {};
        this.headers.Accept = "application/vnd.ez.api.Relation+json";
        this.headers["Content-Type"] = "application/vnd.ez.api.RelationCreate+json";

        return this;
    };

    return RelationCreateStruct;

}());