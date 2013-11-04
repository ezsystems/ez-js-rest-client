/* global define, describe, it, expect */
define(function (require) {

    // Declaring dependencies
    var Request = require("structures/Request");

    describe("Request", function () {

        var TestWrapperObject = function () {
            this.body = "body";
        },
        request;

        TestWrapperObject.prototype.dummyProperty = "prototype dummy property";

        it("is running constructor correctly", function(){

            request = new Request(new TestWrapperObject());

            expect(request.body).toEqual("body");
        });

    });

});