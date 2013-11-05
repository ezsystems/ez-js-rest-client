/* global define */
define(["structures/CAPIError"], function (CAPIError) {
    "use strict";

    /**
     * Creates an instance of discovery service.
     * Discovery service is used internally to auto-discover and cache misc useful REST objects.
     *
     * @class DiscoveryService
     * @constructor
     * @param rootPath {String} path to Root resource
     * @param connectionManager {ConnectionManager}
     */
    var DiscoveryService = function (rootPath, connectionManager) {
        this.connectionManager = connectionManager;
        this.rootPath = rootPath;
        this.cacheObject = {};
    };

    /**
     * Try to get url of the target object by given 'name'
     *
     * @method getUrl
     * @param name {String} name of the target object (e.g. "Trash")
     * @param callback {Function} callback executed after performing the request (see "_discoverRoot" call for more info)
     * @param callback.error {mixed} false or CAPIError object if an error occurred
     * @param callback.response {mixed} the url of the target object if it was found, false otherwise.
     */
    DiscoveryService.prototype.getUrl = function (name, callback) {
        this._getObjectFromCache(
            name,
            function (error, cachedObject) {
                if (error) {
                    callback(error, false);
                    return;
                }

                callback(false, cachedObject._href);
            }
        );
    };

    /**
     * Try to get media-type of the target object by given 'name'
     *
     * @method getMediaType
     * @param name {String} name of the target object (e.g. "Trash")
     * @param callback {Function} callback executed after performing the request (see "_discoverRoot" call for more info)
     * @param callback.error {mixed} false or CAPIError object if an error occurred
     * @param callback.response {mixed} the media-type of the target object if it was found, false otherwise.
     */
    DiscoveryService.prototype.getMediaType = function (name, callback) {
        this._getObjectFromCache(
            name,
            function (error, cachedObject) {
                if (error) {
                    callback(error, false);
                    return;
                }

                callback(false, cachedObject["_media-type"]);
            }
        );
    };

    /**
     * Try to get the whole target object by given 'name'
     *
     * @method getInfoObject
     * @param name {String} name of the target object (e.g. "Trash")
     * @param callback {Function} callback executed after performing the request (see "_discoverRoot" call for more info)
     * @param callback.error {mixed} false or CAPIError object if an error occurred
     * @param callback.response {mixed} the target object if it was found, false otherwise.
     */
    DiscoveryService.prototype.getInfoObject = function (name, callback) {
        this._getObjectFromCache(
            name,
            function (error, cachedObject) {
                if (error) {
                    callback(error, false);
                    return;
                }

                callback(false, cachedObject);
            }
        );
    };

    /**
     * discover Root object
     *
     * @method _discoverRoot
     * @param rootPath {String} path to Root resource
     * @param callback {Function} callback executed after performing the request
     * @param callback.error {mixed} false or CAPIError object if an error occurred
     * @param callback.response {boolean} true if the root was discovered successfully, false otherwise.
     * @protected
     */
    DiscoveryService.prototype._discoverRoot = function (rootPath, callback) {
        if (!this.cacheObject.Root) {
            var that = this;
            this.connectionManager.request(
                "GET",
                rootPath,
                "",
                {"Accept": "application/vnd.ez.api.Root+json"},
                function (error, rootJSON) {
                    if (!error) {

                        that._copyToCache(rootJSON.document);
                        callback(false, true);

                    } else {
                        callback(error, false);
                    }
                }
            );
        } else {
            callback(false, true);
        }
    };

    /**
     * Copy all the properties of the target object into the cache object
     *
     * @method _copyToCache
     * @param object {Object} target object
     * @protected
     */
    DiscoveryService.prototype._copyToCache = function (object) {
        for (var property in object) {
            if (object.hasOwnProperty(property) && object[property]) {
                this.cacheObject[property] = object[property];
            }
        }
    };

    /**
     * Get target object from cacheObject by given 'name' and run the discovery process if it is not available.
     *
     * @method _getObjectFromCache
     * @param name {String} name of the target object to be retrived (e.g. "Trash")
     * @param callback {Function} callback executed after performing the request
     * @param callback.error {mixed} false or CAPIError object if an error occurred
     * @param callback.response {mixed} the target object if it was found, false otherwise.
     * @protected
     */
    DiscoveryService.prototype._getObjectFromCache = function (name, callback) {
        var object = null,
            that = this;
        // Discovering root, if not yet discovered
        // on discovery running the request for same 'name' again
        if (!this.cacheObject.Root) {
            this._discoverRoot(this.rootPath, function (error, success) {
                if (error) {
                    callback(error, false);
                    return;
                }
                that._getObjectFromCache(name, callback);
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
            callback(false, object);
        } else {
            callback(
                new CAPIError(
                    "Discover service failed to find cached object with name '" + name + "'.",
                    {name: name}
                ),
                false
            );
        }
    };

    return DiscoveryService;

});