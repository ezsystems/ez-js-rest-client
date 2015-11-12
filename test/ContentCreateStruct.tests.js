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
            locationStruct = new LocationCreateStruct(),
            contentCreateStruct;

        describe('constructor', function () {
            beforeEach(function () {
                locationStruct = new LocationCreateStruct(parentLocationId);
                contentCreateStruct = new ContentCreateStruct(contentTypeId, locationStruct, language, true);
            });

            it('should take the locationCreateStruct paremeter into account', function () {
                expect(contentCreateStruct.body.ContentCreate.LocationCreate).toBe(locationStruct.body.LocationCreate);
            });

            it('should take the contentTypeId paremeter into account', function () {
                expect(contentCreateStruct.body.ContentCreate.ContentType._href).toBe(contentTypeId);
            });

            it('should take the languageCode paremeter into account', function () {
                expect(contentCreateStruct.body.ContentCreate.mainLanguageCode).toBe(language);
            });

            it('should take the alwaysAvailable paremeter into account', function () {
                expect(contentCreateStruct.body.ContentCreate.alwaysAvailable).toBe(true);
            });
        });

        describe('addField', function () {
            beforeEach(function () {
                locationStruct = new LocationCreateStruct(parentLocationId);
                contentCreateStruct = new ContentCreateStruct(contentTypeId, locationStruct, language, false);
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
});
