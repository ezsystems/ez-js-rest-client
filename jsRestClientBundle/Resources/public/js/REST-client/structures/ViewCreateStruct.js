var ViewCreateStruct = (function() {
    "use strict";

    var ViewCreateStruct = function(identifier){

        this.body = {};
        this.body.ViewInput = {};

        this.body.ViewInput.identifier = identifier;
        this.body.ViewInput.public = false;
        this.body.ViewInput.Query = {};

        this.body.ViewInput.Query.Criteria = {};
        //TODO: find a safe default value for "limit"
//        this.body.ViewInput.Query.limit = 0;
        this.body.ViewInput.Query.offset = 0;
        this.body.ViewInput.Query.FacetBuilders = {};
        this.body.ViewInput.Query.SortClauses = {};
        this.body.ViewInput.Query.spellcheck = false;

        this.contentType = "application/vnd.ez.api.ViewInput+json";

        return this;

    }

    return ViewCreateStruct;

}());