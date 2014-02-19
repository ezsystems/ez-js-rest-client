/* global define */
define(["uritemplate"], function (uriTemplateLib) {
    "use strict";
    /**
     * Provides the parseUriTemplate function
     *
     * @class parseUriTemplate
     * @static
     */

    /**
     * Parses an URI Template according to the RFC 6570.
     *
     * @method parse
     * @static
     * @param {String} template the template to interpret
     * @param {Object} the parameters
     * @return {String}
     */
    var parseUriTemplate = function (template, params) {
        return uriTemplateLib.parse(template).expand(params);
    };

    return parseUriTemplate;
});
