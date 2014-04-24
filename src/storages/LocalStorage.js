/* global define */
define(["structures/CAPIError"], function(CAPIError) {
    /**
     * Implementation of the storage abstraction utilizing a window.localStorage
     *
     * If the localStorage is not available an error is thrown during construction
     *
     * Usability of this storage can be checked using the static isCompatible method.
     *
     * In addition of providing compatibility checking stored data will automatically be converted between
     * object and string representation to allow the storage of arbitrary datastructures
     *
     * @class LocalStorage
     * @implements {StorageAbstraction}
     * @constructor
     */
    var LocalStorage = function() {
        if (!LocalStorage.isCompatible()) {
            throw new CAPIError("LocalStorage abstraction can not be used: window.localStorage is not available.");
        }

        /**
         * Session storage which is internally used to store and retrieve data
         *
         * @property _storage
         * @type {Storage}
         * @private
         */
        this._storage = window.localStorage;
    };

    /**
     * Retrieve an item from the storage
     *
     * @method getItem
     * @param {string} key
     * @return {*}
     */
    LocalStorage.prototype.getItem = function(key) {
        return JSON.parse(this._storage.getItem(key));
    };

    /**
     * Store an item in storage
     *
     * @method setItem
     * @param {string} key
     * @param {*} value
     */
    LocalStorage.prototype.setItem = function(key, value) {
        this._storage.setItem(key, JSON.stringify(value));
    };

    /**
     * Remove an item from storage
     *
     * @method removeItem
     * @param {string} key
     */
    LocalStorage.prototype.removeItem = function(key) {
        this._storage.removeItem(key);
    };

    /**
     * Check whether this storage implementation is compatible with the current environment.
     *
     * @method isComaptible
     * @static
     * @return {boolean}
     */
    LocalStorage.isCompatible = function() {
        var t = "__featuredetection__";

        if (!window.localStorage || !window.localStorage.setItem) {
            return false;
        }

        // Unfortunately some browsers have a localStorage object but don't have a working localStorage ;)
        try {
            window.localStorage.setItem(t, t);
            window.localStorage.removeItem(t);
            // localStorage is available everything is fine
            return true;
        } catch(e) {
            // localStorage does not work
            return false;
        }
    };

    return LocalStorage;
});
