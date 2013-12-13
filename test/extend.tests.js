/* globals define, describe, beforeEach, it, expect */
define(["utils/extend"], function(extend) {
    describe("Extend", function() {
        var emptyObj,
            firstObj,
            secondObj,
            thirdObj,
            fourthObj,
            fifthObj;

        beforeEach(function() {
            // We are initializing the object structures before every run to ensure
            // no one unintentionally changed their data. They are references!
            emptyObj = {};

            firstObj = {
                "foo": "first foo",
                "bar": "first bar"
            };

            secondObj = {
                "foo": "second foo",
                "baz": "second baz"
            };

            thirdObj = {
                "foo": "third foo",
                "bar": "third bar",
                "baz": "third baz"
            };

            fourthObj = Object.create(thirdObj);
            fourthObj.foo = "fourth foo";

            fifthObj = {
                "foo": undefined,
                "bar": null,
                "baz": false
            };
        });

        it("should return the input if only one object is given", function() {
            // As the reference might be used to change the data, we do a "string" comparison
            var original = JSON.stringify(firstObj),
                result = extend(firstObj);

            expect(result).toEqual(JSON.parse(original));
        });

        it("should return a reference to the input", function() {
            var result = extend(firstObj);
            expect(result).toBe(firstObj);
        });

        it("should return a reference to the input", function() {
            var result = extend(firstObj);
            expect(result).toBe(firstObj);
        });

        it("should extend first object with second one", function() {
            var result = extend(firstObj, secondObj);
            expect(result).toEqual({
                "foo": "second foo",
                "bar": "first bar",
                "baz": "second baz"
            });
        });

        it("should return reference to first object after extension", function() {
            var result = extend(firstObj, secondObj);
            expect(result).toBe(firstObj);
        });

        it("should extend multiple objects in given order", function() {
            var result = extend(firstObj, secondObj, thirdObj);
            expect(result).toEqual({
                "foo": "third foo",
                "bar": "third bar",
                "baz": "third baz"
            });
        });

        it("should extend multiple objects in given order (2)", function() {
            var result = extend(firstObj, thirdObj, secondObj);
            expect(result).toEqual({
                "foo": "second foo",
                "bar": "third bar",
                "baz": "second baz"
            });
        });

        it("should work if first object is empty", function() {
            var result = extend(emptyObj, firstObj);
            expect(result).toEqual({
                "foo": "first foo",
                "bar": "first bar"
            });
        });

        it("should work if second object is empty", function() {
            var result = extend(firstObj, emptyObj);
            expect(result).toEqual({
                "foo": "first foo",
                "bar": "first bar"
            });
        });

        it("should only operate on own values not inherited ones", function() {
            var result = extend(firstObj, fourthObj);
            expect(result).toEqual({
                "foo": "fourth foo",
                "bar": "first bar"
            });
        });

        it("should ignore non objects", function() {
            var result = extend(firstObj, null, undefined, "foo", 23, true, secondObj);
            expect(result).toEqual({
                "foo": "second foo",
                "bar": "first bar",
                "baz": "second baz"
            });
        });

        it("should ignore empty properties", function() {
            var result = extend(firstObj, fifthObj);
            expect(result).toEqual({
                "foo": "first foo",
                "bar": null,
                "baz": false
            });
        });

    });
});