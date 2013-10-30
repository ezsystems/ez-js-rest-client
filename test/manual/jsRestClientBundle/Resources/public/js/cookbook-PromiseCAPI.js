/* global CAPI, SessionAuthAgent, PromiseCAPI */
// Some simple PromiseCAPI usage scenario

var jsCAPI = new CAPI(
        'http://ez.git.local',
        new SessionAuthAgent({login: "admin", password: "admin"})
    );

var jsPromiseCAPI = new PromiseCAPI(jsCAPI);

var promiseContentService = jsPromiseCAPI.getContentService();

var promise = promiseContentService.loadSection("/api/ezp/v2/content/sections/1");

promise.then(
    function(result) {

        console.log(result);

    },
    function(error) {

        console.log(error);

    }
);

