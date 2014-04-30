/* global define */
define(["structures/CAPIError"], function (CAPIError) {
    "use strict";

    /**
     * Creates an instance of discovery service.  Discovery service is used
     * internally to discover resources URI and media type provided in the root
     * resource.
     *
     * @class DiscoveryService
     * @constructor
     * @param rootPath {String} path to Root resource
     * @param connectionManager {ConnectionManager}
     */
    var DiscoveryService = function (rootPath, connectionManager) {
        this._connectionManager = connectionManager;
        this._rootPath = rootPath;
        this._cacheObject = {};
    };

    /**
     * Get the information for given name. The information is provided as the
     * second argument of the callback unless there's a network issue while
     * loading the REST root resource or if there's no resource associated with
     * the given name.
     *
     * @method getInfoObject
     *
     * @param name {String} name of the target object (e.g. "Trash")
     * @param callback {Function}
     * @param callback.error {Boolean|CAPIError} false or CAPIError object if an
     * error occurred
     * @param callback.response {Object|Response|Boolean} the target object if
     * it was found, the Response object if an error occured while loading the
     * REST root or false if the name does not match any object.
     */
    DiscoveryService.prototype.getInfoObject = function (name, callback) {
        var that = this;

        // Discovering root, if not yet discovered
        // on discovery running the request for same 'name' again
        if (!this._cacheObject.Root) {
            this._discoverRoot(this._rootPath, function (error, response) {
                if (error) {
                    callback(error, response);
                    return;
                }
                that.getInfoObject(name, callback);
            });
            return;
        }

        if (this._cacheObject.Root.hasOwnProperty(name)) {
            callback(false, this._cacheObject.Root[name]);
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

    /**
     * Load the REST root resource
     *
     * @method _discoverRoot
     * @protected
     *
     * @param rootPath {String} path to Root resource
     * @param callback {Function} callback executed after performing the request
     * @param callback.error {Boolean|CAPIError} false or CAPIError object if an
     * error occurred
     * @param callback.response {Boolean|Response} true if the root was
     * successfully loaded, the Response otherwise
     */
    DiscoveryService.prototype._discoverRoot = function (rootPath, callback) {
        var that = this;

        this._connectionManager.request(
            "GET",
            rootPath,
            "",
            {"Accept": "application/vnd.ez.api.Root+json"},
            function (error, response) {
                if (error) {
                    callback(error, response);
                    return;
                }

                that._copyToCache(response.document);
                callback(false, true);
            }
        );
    };

    /**
     * Copy all the properties of the target object into the cache
     *
     * @method _copyToCache
     * @protected
     *
     * @param object {Object} the object to cache
     */
    DiscoveryService.prototype._copyToCache = function (object) {
        var property;

        // disabling hasOwnProperty check as it is useless here, we are caching
        // literal object coming from the root resource
        /*jslint forin:false */
        for (property in object) {
            this._cacheObject[property] = object[property];
        }
        /*jslint forin:true */
    };

    return DiscoveryService;
});
