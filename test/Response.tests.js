
describe("Response", function () {

    var testRootInnerObject = {
            "dummyIndex": "dummyValue"
        },
        testRootObject = {
            "Root": testRootInnerObject
        },
        response;

    it("is parsing it's 'body' property (JSON string) into structured 'document' property", function(){

        response = new Response({
            body : JSON.stringify(testRootObject)
        });

        expect(response.document.Root).toEqual(testRootInnerObject);
    });

    it("has correct default value for 'document' property", function(){

        response = new Response({});

        expect(response.document).toBeNull();
    });


});