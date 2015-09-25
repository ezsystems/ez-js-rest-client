/* global define */
define(function () {
    "use strict";

    /**
     * Returns a structure used to update a Location. See
     * {{#crossLink "ContentService/updateLocation"}}ContentService.updateLocation{{/crossLink}}
     *
     * @class LocationUpdateStruct
     * @constructor
     */
    var LocationUpdateStruct = function () {
        this.body = {};
        this.body.LocationUpdate = {};

        this.headers = {
            "Accept": "application/vnd.ez.api.Location+json",
            "Content-Type": "application/vnd.ez.api.LocationUpdate+json"
        };

        return this;
    };

    return LocationUpdateStruct;

});