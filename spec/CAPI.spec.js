var window = {}, sessionStorage = {};

//var fs = require('fs');
//eval(fs.readFileSync('dist/CAPI.js'));

var requirejs = require('requirejs');

requirejs.config({
    dist: 'dist/CAPI'
});

requirejs(["dist"],
    function (requiredCAPI) {

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

    });




