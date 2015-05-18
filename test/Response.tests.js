/* global define, describe, it, expect, spyOn */
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

        it("is parsing it's 'body' property (JSON string) into structured 'document' property", function (){

            response = new Response(new TestWrapperObject());

            expect(response.document.Root).toEqual(testRootInnerObject);
        });

        it("has correct default value for the 'document' property", function (){

            response = new Response({});

            expect(response.document).toBeNull();
        });

        it("is handling broken JSON as body properly", function (){

            var data = new TestWrapperObject();

            // Cut of the last character to create invalid json
            data.body = data.body.substring(0,-1);

            response = new Response(data);
            expect(response.document).toBeNull();
        });

    });

    describe("getHeader", function () {
        it("should call getResponseHeader on the XHR object", function () {
            var response,
                header = 'location',
                xhr = {getResponseHeader: function (h) {}},
                params =  {xhr: xhr};

            spyOn(xhr, 'getResponseHeader');
            response = new Response(params);
            response.getHeader(header);
            expect(xhr.getResponseHeader).toHaveBeenCalledWith(header);
        });
    });
});
