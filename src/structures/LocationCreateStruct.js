/* global define */
define(function () {
    "use strict";

    /**
     * Returns a structure used to create a new Location. See ContentService.createLocation() call
     *
     * @class LocationCreateStruct
     * @constructor
     * @param parentLocationId {String} reference to the parent location of the new Location.
     */
    var LocationCreateStruct = function (parentLocationId) {
        this.body = {};
        this.body.LocationCreate = {};

        this.body.LocationCreate.ParentLocation = {
            "_href": parentLocationId
        };

        this.body.LocationCreate.sortField = "PATH";
        this.body.LocationCreate.sortOrder = "ASC";

        this.headers = {
            "Accept": "application/vnd.ez.api.Location+json",
            "Content-Type": "application/vnd.ez.api.LocationCreate+json"
        };

        return this;
    };

    return LocationCreateStruct;

});
