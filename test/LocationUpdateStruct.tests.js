/* global define, describe, it, expect */
define(function (require) {
    var LocationUpdateStruct = require('structures/LocationUpdateStruct');

    describe('LocationUpdateStruct', function () {
        describe('constructor', function () {
            it('should set the headers', function () {
                var struct = new LocationUpdateStruct();

                expect(struct.headers.Accept).toEqual("application/vnd.ez.api.Location+json");
                expect(struct.headers["Content-Type"]).toEqual("application/vnd.ez.api.LocationUpdate+json");
            });

            it('should set the body', function () {
                var struct = new LocationUpdateStruct();

                expect(struct.body).toEqual({LocationUpdate: {}});
            });
        });
    });
});
