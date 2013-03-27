// Some simple js REST CAPI usage scenario

var jsCAPI = new CAPI(
    'http://ez.git.local/api/ezp/v2',
    {
        user : "admin",
        password : "admin",
        authMethod : "HTTPBasicAuth"
    },
    "XHR");
var contentService = jsCAPI.getContentService();


contentService.loadSections(function(data){
    console.log(data);
});


contentService.loadSection(2, function(data){
    console.log(data);
});


//var sectionInput = {
//    SectionInput : {
//        identifier : "testSection" + Math.random()*1000000,
//        name : "Test Section"
//    }
//}
//
//// compatibility remark: JSON API is supported in all modern browsers (IE-wise since IE8)
//contentService.createSection(JSON.stringify(sectionInput), function(data){
//    console.log(data);
//});

