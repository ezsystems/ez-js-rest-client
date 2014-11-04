/* global define, describe, it, expect, beforeEach */
define(function (require) {
    var ContentCreateStruct = require('structures/ContentCreateStruct'),
        LocationCreateStruct = require("structures/LocationCreateStruct");

    describe('ContentCreateStruct object creation', function () {
        var parentLocationId = '/api/ezp/v2/content/locations/1/2/118',
            language = 'en-US',
            contentTypeId = '/api/ezp/v2/content/types/18',
            fieldIdentifier = 'test',
            fieldValue = 'test value',
            locationStruct,
            contentCreateStruct;

        beforeEach(function () {
            locationStruct = new LocationCreateStruct(parentLocationId);
            contentCreateStruct = new ContentCreateStruct(contentTypeId, locationStruct, language);
        });

        it('should add a new field', function () {
            contentCreateStruct.addField(fieldIdentifier, fieldValue);

            expect(contentCreateStruct.body.ContentCreate.fields.field[0]).toEqual({
                fieldDefinitionIdentifier: fieldIdentifier,
                fieldValue: fieldValue,
            });
        });
    });
});
