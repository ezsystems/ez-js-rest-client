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

        /**
         * Copy all the properties of a argument object into cache object
         *
         * @method addToCache
         * @param object {Object}
         */
        this.copyToCache = function(object) {
            for (var property in object) {
                if (object.hasOwnProperty(property)) {
                    this.cacheObject[property] = object[property];
                }
            }
        }

        /**
         * Copy all the properties of a argument object into cache object
         *
         * @method getFromCache
         * @param name {String}
         * @return descriptionObject {Object} description object usually containing url and media-type
         */
        this.getObjectFromCache = function(name) {

            var object = null;

            // Checking most obvious places for now
            // "Root" object (retrieved during root discovery request) and
            // root of a cache object in case we have cached value from some other request
            if (this.cacheObject.Root.hasOwnProperty(name)) {
                return this.cacheObject.Root[name];
            } else if (this.cacheObject.hasOwnProperty(name)) {
                return this.cacheObject[name];
            }

            return object;
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

                        that.copyToCache(JSON.parse(rootJSON.body));

                    }
                }
            );


        }
    };


    DiscoveryService.prototype.getUrl = function(name, callback) {
        var cachedObject = this.getObjectFromCache(name);
        if (cachedObject) {
            callback(
                false,
                cachedObject["_href"]
            );
        } else {
            callback(
                new Error({
                    errorText : "Discovery service failed to provide url for given name '" + name + "'"
                }),
                new Response({
                    status : "error",
                    body : ""
                })
            );
        }
    };

    DiscoveryService.prototype.getMediaType = function(name, callback) {
        var cachedObject = this.getObjectFromCache(name);
        if (cachedObject) {
            callback(
                false,
                cachedObject["_media-type"]
            );
        } else {
            callback(
                new Error({
                    errorText : "Discovery service failed to provide media-type for given name '" + name + "'"
                }),
                new Response({
                    status : "error",
                    body : ""
                })
            );
        }
    };

    DiscoveryService.prototype.getInfoObject = function(name, callback) {
        var cachedObject = this.getObjectFromCache(name);
        if (cachedObject) {
            callback(
                false,
                cachedObject
            );
        } else {
            callback(
                new Error({
                    errorText : "Discovery service failed to provide info object for given name '" + name + "'"
                }),
                new Response({
                    status : "error",
                    body : ""
                })
            );
        }
    };

    return DiscoveryService;

}());