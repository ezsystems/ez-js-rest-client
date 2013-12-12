/* global define */
define(["structures/CAPIError"], function(CAPIError) {
    /**
     * Implementation of the storage abstraction utilizing a window.sessionStorage
     *
     * If the sessionStorage is not available an error is thrown during construction
     *
     * Usability of this storage can be checked using the static isCompatible method.
     *
     * In addition of providing compatibility checking stored data will automatically be converted between
     * object and string representation to allow the storage of arbitrary datastructures
     *
     * @class SessionStorage
     * @constructor
     */
    var SessionStorage = function() {
        if (!SessionStorage.isCompatible()) {
            throw new CAPIError("SessionStorage abstraction can not be used: window.sessionStorage is not available.");
        }

        /**
         * Session storage which is internally used to store and retrieve data
         *
         * @property _storage
         * @type {Storage}
         * @private
         */
        this._storage = window.sessionStorage;
    };

    /**
     * Retrieve an item from the storage
     *
     * @method getItem
     * @param {string} key
     * @return {*}
     */
    SessionStorage.prototype.getItem = function(key) {
        return JSON.parse(this._storage.getItem(key));
    };

    /**
     * Store an item in storage
     *
     * @method setItem
     * @param {string} key
     * @param {*} value
     */
    SessionStorage.prototype.setItem = function(key, value) {
        this._storage.setItem(key, JSON.stringify(value));
    };

    /**
     * Remove an item from storage
     *
     * @method removeItem
     * @param {string} key
     */
    SessionStorage.prototype.removeItem = function(key) {
        this._storage.removeItem(key);
    };

    /**
     * Check whether this storage implementation is compatible with the current environment.
     *
     * @method isComaptible
     * @static
     * @return {boolean}
     */
    SessionStorage.isCompatible = function() {
        var t = "__featuredetection__";

        if (!window.sessionStorage || !window.sessionStorage.setItem) {
            return false;
        }

        // Unfortunately some browsers have a sessionStorage object but don't have a working sessionStorage ;)
        try {
            window.sessionStorage.setItem(t, t);
            window.sessionStorage.removeItem(t);
            // sessionStorage is available everything is fine
            return true;
        } catch(e) {
            // sessionStorage does not work
            return false;
        }
    };

    return SessionStorage;
});