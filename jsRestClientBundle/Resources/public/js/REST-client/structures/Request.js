var Request = (function() {
    "use strict";

    var Request = function(valuesContainer){

        this.method = valuesContainer.method;
        this.url = valuesContainer.url;
        this.body = valuesContainer.body;
        this.headers = valuesContainer.headers;

        return this;
    }


    return Request;

}());