/* global define, describe, it, expect, beforeEach */
define(function (require) {
    var ContentMetadataUpdateStruct = require('structures/ContentMetadataUpdateStruct');

    describe('ContentMetadataUpdateStruct', function () {
        var contentMetadataUpdateStruct;

        beforeEach(function () {
            contentMetadataUpdateStruct = new ContentMetadataUpdateStruct();
        });

        describe('constructor', function () {
            it('should initialize the body', function () {
                expect(contentMetadataUpdateStruct.body).toEqual({'ContentUpdate': {}});
            });

            it('should set the headers', function () {
                expect(contentMetadataUpdateStruct.headers).toEqual({
                    "Accept": "application/vnd.ez.api.ContentInfo+json",
                    "Content-Type": "application/vnd.ez.api.ContentUpdate+json"
                });
            });
        });

        describe('setSection', function () {
            it('should set the Section property', function () {
                var sectionId = 'section-id';

                contentMetadataUpdateStruct.setSection(sectionId);

                expect(contentMetadataUpdateStruct.body.ContentUpdate.Section).toEqual({
                    _href: sectionId,
                });
            });
        });

        describe('setMainLocation', function () {
            it('should set the MainLocation property', function () {
                var locationId = 'location-id';

                contentMetadataUpdateStruct.setMainLocation(locationId);

                expect(contentMetadataUpdateStruct.body.ContentUpdate.MainLocation).toEqual({
                    _href: locationId,
                });
            });
        });
    });
});
