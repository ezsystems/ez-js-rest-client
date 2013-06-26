
describe("CAPI", function () {

    var authAgent = {},
        jsCAPI = new CAPI(
            'http://ez.git.local',
            authAgent
        );

    beforeEach(function (){

    });

    describe("Content Service", function () {
        it("exists", function () {

            var contentService = jsCAPI.getContentService();
            expect(contentService).toBeDefined();

        });
    });
});




