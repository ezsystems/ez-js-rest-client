/* global define */
define(["structures/CAPIError"], function(CAPIError) {
    /**
     * Implementation of the storage abstraction utilizing simple in-memory variables
     *
     * This storage is always usable. Its main purpose is the usage in conjunction with
     * Single-Page-Applications, which do not need fancy session or domain based storages,
     * which are available for more than one request.
     *
     * @class InMemoryStorage
     * @extends {StorageAbstraction}
     * @constructor
     */
    var InMemoryStorage = function () {
        /**
         * Storage object, which is used internally to store all the given data
         *
         * @property _storage
         * @type {Object}
         * @private
         */
        this._storage = {};
    };

    /**
     * Retrieve an item from the storage
     *
     * @method getItem
     * @param {string} key
     * @return {*}
     */
    InMemoryStorage.prototype.getItem = function(key) {
        if (this._storage[key] === undefined) {
            return null;
        }

        // We store the items JSON encoded to not pass object and array references around
        return JSON.parse(this._storage[key]);
    };

    /**
     * Store an item in storage
     *
     * @method setItem
     * @param {string} key
     * @param {*} value
     */
    InMemoryStorage.prototype.setItem = function(key, value) {
        // We store the items JSON encoded to not pass object and array references around
        this._storage[key] = JSON.stringify(value);
    };

    /**
     * Remove an item from storage
     *
     * @method removeItem
     * @param {string} key
     */
    InMemoryStorage.prototype.removeItem = function(key) {
        if (this._storage[key] !== undefined) {
            delete this._storage[key];
        }
    };

    /**
     * Check whether this storage implementation is compatible with the current environment.
     *
     * The InMemoryStorage is always compatible with any environment.
     *
     * @method isComaptible
     * @static
     * @return {Boolean}
     */
    InMemoryStorage.isCompatible = function () {
        return true;
    };

    return InMemoryStorage;
});