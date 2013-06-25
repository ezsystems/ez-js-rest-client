require(
    '../dist/CAPI.js',
    function(requiredCAPI){

        describe("CAPI", function () {

            beforeEach(function (){

                var authAgent = new SessionAuthAgent({
                        login : "admin",
                        password : "admin"
                    }),
                    jsCAPI = new CAPI(
                        'http://ez.git.local',
                        authAgent
                    );

            });

            describe("Content Service", function () {
                it("exists", function () {

                    var contentService = jsCAPI.getContentService();
                    expect(contentService).toBeDefined();

                });
            });
        });

    }
);

