/* global define, describe, it, expect */
define(function (require) {
    var ViewCreateStruct = require('structures/ViewCreateStruct');

    describe('ViewCreateStruct', function () {
        describe('constructor', function () {
            describe('identifier parameter', function () {
                it('should set the identifier', function () {
                    var identifier = "my-view",
                        struct = new ViewCreateStruct(identifier),
                        viewInput = struct.body.ViewInput;

                    expect(viewInput.identifier).toEqual(identifier);
                });

            });

            describe('type parameter', function () {
                it('should be ContentQuery by default', function () {
                    var struct = new ViewCreateStruct("my-view"),
                        viewInput = struct.body.ViewInput;

                    expect(viewInput.ContentQuery).toBeDefined();
                });

                it('should be taken into account to create the ViewInput', function () {
                    var queryType = "WhateverQuery",
                        struct = new ViewCreateStruct("my-view", queryType),
                        viewInput = struct.body.ViewInput;

                    expect(viewInput[queryType]).toBeDefined();
                });
            });

            it('should set the headers', function () {
                var struct = new ViewCreateStruct("my-view");

                expect(struct.headers.Accept).toEqual("application/vnd.ez.api.View+json; version=1.1");
                expect(struct.headers["Content-Type"]).toEqual("application/vnd.ez.api.ViewInput+json; version=1.1");
            });

            it('should define a default query structure', function () {
                var struct = new ViewCreateStruct("my-view"),
                    viewInput = struct.body.ViewInput;

                expect(viewInput.ContentQuery.Criteria).toEqual({});
                expect(viewInput.ContentQuery.FacetBuilders).toEqual({});
                expect(viewInput.ContentQuery.SortClauses).toEqual({});
            });

            it('should set the public flag to false', function () {
                var struct = new ViewCreateStruct("my-view"),
                    viewInput = struct.body.ViewInput;

                expect(viewInput.public).toEqual(false);
            });
        });
    });
});
