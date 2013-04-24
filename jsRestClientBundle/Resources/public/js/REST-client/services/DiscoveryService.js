var DiscoveryService = (function() {
    "use strict";

    /**
     * Creates an instance of discovery service
     *
     * @constructor
     * @param connectionManager {ConnectionManager}
     */
    var DiscoveryService = function(connectionManager){

        this.connectionManager = connectionManager;

        this.cacheObject = {};

        this.addToCache = function(object) {
            for (var property in object) {
                if (object.hasOwnProperty(property)) {
                    this.cacheObject[property] = object[property];
                }
            }
        }

    }

    DiscoveryService.prototype.discoverRoot = function(rootPath) {

        if (!this.cacheObject.Root) {

            var that = this;

            this.connectionManager.request(
                "GET",
                rootPath,
                {},
                { "Accept" : "application/vnd.ez.api.Root+json" },
                function(error, rootJSON) {
                    if (!error) {

                        that.addToCache(JSON.parse(rootJSON));

                    }
                }
            );


        }
    };


    DiscoveryService.prototype.getUrl = function(name, callback) {

    };

    DiscoveryService.prototype.getMediaType = function(name, callback) {

    };

    return DiscoveryService;

}());