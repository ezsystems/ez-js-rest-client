/* globals define */
define([], function () {
    /**
     * Provides only the `extend` function.
     *
     * @class extend
     * @static
     */

    /**
     * Extend the given object with properties of an arbitrary amount of other objects
     *
     * Override priority is determined using the order the objects are given in
     * Each further object has a higher priority then the one before it.
     *
     * Only actual properties of the given objects will be used not the ones bubbling up
     * through the prototype chain.
     *
     * @method extend
     * @static
     * @param target
     * @param [obj]* Arbitrary amount of objects which will extend the first one
     * @return {Object} the extended object
     */
    var extend = function (target /*, obj, ... */) {
        var extensions = Array.prototype.slice.call(arguments, 1);
        extensions.forEach(function (extension) {
            var key;

            if (typeof extension !== "object") {
                // Skip everything that is not an object
                return;
            }

            for (key in extension) {
                if (extension.hasOwnProperty(key) && extension[key] !== undefined) {
                    target[key] = extension[key];
                }
            }
        });

        return target;
    };

    return extend;
});
