/* global eZ */
// Some simple PromiseCAPI usage scenario

var jsCAPI = new eZ.CAPI(
        'http://ez.git.local',
        new eZ.SessionAuthAgent({login: "admin", password: "ezpublish"}),
        {logRequests: true}
    ),
    jsPromiseCAPI = new eZ.PromiseCAPI(jsCAPI),
    promiseContentService = jsPromiseCAPI.getContentService(),
    promise = promiseContentService.loadSection("/api/ezp/v2/content/sections/1");

promise.then(
    function(result) {

        console.log(result);

    },
    function(error) {

        console.log(error);

    }
);

