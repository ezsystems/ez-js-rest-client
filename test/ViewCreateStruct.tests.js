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
        describe('getCriteria', function () {

            it('should get Criteria property', function () {
                var struct = new ViewCreateStruct("my-view"),
                    viewInput = struct.body.ViewInput;

                expect(struct.getCriteria()).toEqual(viewInput.ContentQuery.Criteria);
            });
        });
        describe('getQuery', function () {

            it('should get Query property', function () {
                var struct = new ViewCreateStruct("my-view"),
                    viewInput = struct.body.ViewInput;

                expect(struct.getQuery()).toEqual(viewInput.ContentQuery.Query);
            });
        });
        describe('getFilter', function () {

            it('should get Filter property', function () {
                var struct = new ViewCreateStruct("my-view"),
                    viewInput = struct.body.ViewInput;

                expect(struct.getFilter()).toEqual(viewInput.ContentQuery.Filter);
            });
        });
        describe('setFilter', function () {

            it('should set Filter property', function () {
                var struct = new ViewCreateStruct("my-view"),
                    filter = {some: 'thing'};

                struct.setFilter(filter);
                expect(struct.getFilter()).toEqual(filter);
            });
        });
        describe('setCriteria', function () {

            it('should set Criteria property', function () {
                var struct = new ViewCreateStruct("my-view"),
                    criteria = {some: 'thing'};

                struct.setCriteria(criteria);
                expect(struct.getCriteria()).toEqual(criteria);
            });
        });
        describe('setQuery', function () {

            it('should set Query property', function () {
                var struct = new ViewCreateStruct("my-view"),
                    query = {some: 'thing'};

                struct.setQuery(query);
                expect(struct.getQuery()).toEqual(query);
            });
        });
        describe('setSortClauses', function () {

            it('should set SortClauses property', function () {
                var struct = new ViewCreateStruct("my-view"),
                    viewInput = struct.body.ViewInput,
                    sortClauses = {some: 'thing'};

                struct.setSortClauses(sortClauses);
                expect(viewInput.ContentQuery.SortClauses).toEqual(sortClauses);
            });
        });
        describe('setFacetBuilders', function () {

            it('should set FacetBuilders property', function () {
                var struct = new ViewCreateStruct("my-view"),
                    viewInput = struct.body.ViewInput,
                    facetBuilders = {some: 'thing'};

                struct.setFacetBuilders(facetBuilders);
                expect(viewInput.ContentQuery.FacetBuilders).toEqual(facetBuilders);
            });
        });
        describe('setLimitAndOffset', function () {

            it('should set Limit and Offset property', function () {
                var struct = new ViewCreateStruct("my-view"),
                    viewInput = struct.body.ViewInput,
                    limit = 1,
                    offset = 2;

                struct.setLimitAndOffset(limit, offset);
                expect(viewInput.ContentQuery.limit).toEqual(limit);
                expect(viewInput.ContentQuery.offset).toEqual(offset);
            });
        });
    });
});
