var CAPIError = (function() {
    "use strict";

    var CAPIError = function(valuesContainer){

        for (var property in valuesContainer) {
            if (valuesContainer.hasOwnProperty(property)) {
                this[property] = valuesContainer[property];
            }
        }

        return this;
    };


    return CAPIError;

}());