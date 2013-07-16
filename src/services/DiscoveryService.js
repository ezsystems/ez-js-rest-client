var DiscoveryService = (function() {
    "use strict";

    /**
     * Creates an instance of discovery service
     *
     * @constructor
     * @param connectionManager {ConnectionManager}
     */
    var DiscoveryService = function(rootPath, connectionManager){

        this.connectionManager = connectionManager;
        this.rootPath = rootPath;

        this.cacheObject = {};

        /**
         * discover Root object
         *
         * @method discoverRoot
         * @param rootPath {href}
         * @param callback {Function}
         */
        this.discoverRoot = function(rootPath, callback) {

            if (!this.cacheObject.Root) {
                var that = this;
                this.connectionManager.request(
                    "GET",
                    rootPath,
                    "",
                    { "Accept" : "application/vnd.ez.api.Root+json" },
                    function(error, rootJSON) {
                        if (!error) {

                            that.copyToCache(JSON.parse(rootJSON.body));
                            callback(false, true);

                        } else {
                            callback(
                                new CAPIError( {
                                    errorText : "Discover service failed to retrieve root object."
                                }),
                                new Response({
                                    status : "error",
                                    body : ""
                                })
                            );
                        }
                    }
                );
            } else {
                callback(false, true);
            }
        };

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
        };

        /**
         * Try to get object from cacheObject by given 'name'
         *
         * @method getObjectFromCache
         * @param name {String}
         * @param callback {Function}
         */
        this.getObjectFromCache = function(name, callback) {
            var object = null,
                that = this;
            // Discovering root, if not yet discovered
            // on discovery running the request for same 'name' again
            if (!this.cacheObject.Root) {
                this.discoverRoot(this.rootPath, function() {
                    that.getObjectFromCache(name, callback);
                });
                return;
            }

            // Checking most obvious places for now
            // "Root" object (retrieved during root discovery request) and
            // root of a cache object in case we have cached value from some other request
            if (this.cacheObject.Root.hasOwnProperty(name)) {
                object = this.cacheObject.Root[name];
            } else if (this.cacheObject.hasOwnProperty(name)) {
                object = this.cacheObject[name];
            }

            if (object) {
                callback(
                    false,
                    object
                );
            } else {
                callback(
                    new CAPIError({
                        errorText : "Discover service failed to find cached object with name '" + name + "'"
                    }),
                    new Response({
                        status : "error",
                        body : ""
                    })
                );
            }
        };
    };

    /**
     * Get url for given 'name'
     *
     * @method getUrl
     * @param name {String}
     * @param callback {Function}
     */
    DiscoveryService.prototype.getUrl = function(name, callback) {
        this.getObjectFromCache(
            name,
            function(error, cachedObject){
                if (!error) {
                    if (cachedObject) {
                        callback(
                            false,
                            cachedObject._href
                        );
                    } else {
                        callback(
                            new CAPIError({
                                errorText : "Broken cached object returned when searching for '" + name + "'"
                            }),
                            new Response({
                                status : "error",
                                body : ""
                            })
                        );
                    }
                } else {
                    callback(
                        error,
                        new Response({
                            status : "error",
                            body : ""
                        })
                    );
                }
            }
        );
    };

    /**
     * Get media type for given 'name'
     *
     * @method getMediaType
     * @param name {String}
     * @param callback {Function}
     */
    DiscoveryService.prototype.getMediaType = function(name, callback) {
        this.getObjectFromCache(
            name,
            function(error, cachedObject){
                if (!error) {
                    if (cachedObject) {
                        callback(
                            false,
                            cachedObject["_media-type"]
                        );
                    } else {
                        callback(
                            new CAPIError({
                                errorText : "Broken cached object returned when searching for '" + name + "'"
                            }),
                            new Response({
                                status : "error",
                                body : ""
                            })
                        );
                    }
                } else {
                    callback(
                        error,
                        new Response({
                            status : "error",
                            body : ""
                        })
                    );
                }
            }
        );
    };

    /**
     * Get the whole information object for given 'name'
     *
     * @method getInfoObject
     * @param name {String}
     * @param callback {Function}
     */
    DiscoveryService.prototype.getInfoObject = function(name, callback) {
        this.getObjectFromCache(
            name,
            function(error, cachedObject){
                if (!error) {
                    if (cachedObject) {
                        callback(
                            false,
                            cachedObject
                        );
                    } else {
                        callback(
                            new CAPIError({
                                errorText : "Broken cached object returned when searching for '" + name + "'"
                            }),
                            new Response({
                                status : "error",
                                body : ""
                            })
                        );
                    }
                } else {
                    callback(
                        error,
                        new Response({
                            status : "error",
                            body : ""
                        })
                    );
                }
            }
        );
    };

    return DiscoveryService;

}());