var SectionInputStruct = (function() {
    "use strict";

    var SectionInputStruct = function(identifier, name){

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

}());