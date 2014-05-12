/* global define, describe, it, expect */
define(function (require) {
    var CAPIError = require("structures/CAPIError");

    describe("CAPIError", function () {
        it("should extend Error", function () {
            var error = new CAPIError();

            expect(error instanceof Error).toEqual(true);
        });

        it("should store the message", function () {
            var msg = 'Hey!',
                error = new CAPIError(msg);

            expect(error.message).toEqual(msg);
        });

        it("should store the details of the error", function () {
            var info = {},
                error = new CAPIError("", info);

            expect((function () { return error.details === info; })()).toEqual(true);
        });
    });
});
