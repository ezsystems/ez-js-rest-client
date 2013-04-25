var Response = (function() {
    "use strict";

    var Response = function(valuesContainer){

        for (var property in valuesContainer) {
            if (valuesContainer.hasOwnProperty(property)) {
                this[property] = valuesContainer[property];
            }
        }

        return this;
    }


    return Response;

}());