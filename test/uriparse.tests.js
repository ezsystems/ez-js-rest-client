/* globals define, describe, it, expect */
define(['utils/uriparse'], function (parseUriTemplate) {
    var template = "{+var}",
        params = {"var": "value", "something": "else"};

    describe("uriparse", function () {
        it("should export the 'parseUriTemplate' function", function () {
            expect(parseUriTemplate).toBeDefined();
            expect(function () {
                return (typeof parseUriTemplate === "function");
            }).toBeTruthy();
        });

        it("should throw an error if it can not parse a template", function () {
            expect(function () {
                parseUriTemplate("{id", {});
            }).toThrow();
        });

        it("should parse and expand the template Uri", function () {
            var url = parseUriTemplate(template, params);
            
            expect(url).toEqual("value");
        });
    });
});
