var Request = (function() {
    "use strict";

    var Request = function(valuesContainer){

        for (var property in valuesContainer) {
            if (valuesContainer.hasOwnProperty(property)) {
                this[property] = valuesContainer[property];
            }
        }

        return this;
    };


    return Request;

}());