/* global define, describe, it, expect */
define(function (require) {

    // Declaring dependencies
    var Response = require("structures/Response");

    describe("Response", function () {

        var testRootInnerObject = {
                "dummyIndex": "dummyValue"
            },
            testRootObject = {
                "Root": testRootInnerObject
            },
            TestWrapperObject = function () {
                this.body = JSON.stringify(testRootObject);
            },
            response;

        TestWrapperObject.prototype.dummyProperty = "prototype dummy property";

        it("is parsing it's 'body' property (JSON string) into structured 'document' property", function(){

            response = new Response(new TestWrapperObject());

            expect(response.document.Root).toEqual(testRootInnerObject);
        });

        it("has correct default value for the 'document' property", function(){

            response = new Response({});

            expect(response.document).toBeNull();
        });


    });

});