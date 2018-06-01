/* globals define, describe, it, expect */
define(['utils/urijs'], function (parse) {
    describe("urijs", function () {
        it("should export the 'parse' function", function () {
            expect(parse).toBeDefined();
            expect(function () {
                return (typeof parse === "function");
            }).toBeTruthy();
        });
    });
});
