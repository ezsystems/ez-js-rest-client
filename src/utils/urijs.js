/* global define */
define(['urijs/URI'], function (URI) {
    "use strict";
    /**
     * Provides the parse function
     *
     * @class parse
     * @static
     */

    /**
     * Parses a string into its URI components.
     *
     * @method parse
     * @static
     * @param {String} url The URL to parse
     * @return {Object} containing the found components
     */
    var parse = function (url) {
        return URI(url);
    };

    return parse;
});
