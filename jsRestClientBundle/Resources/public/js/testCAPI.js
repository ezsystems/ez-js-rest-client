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

var clientOutput = document.getElementById('output');

// Load single section example
var loadSectionAnchor = document.getElementById('load-section');
var loadSectionLoader = document.getElementById('load-section-loader');
loadSectionAnchor.onclick = function(e){

    loadSectionLoader.style.display = 'block';
    e.preventDefault();
    contentService.loadSection(2, function(data){
        clientOutput.innerHTML = data;
        loadSectionLoader.style.display = 'none';
    });

};


// Load sections list example
var loadSectionsAnchor = document.getElementById('load-sections');
var loadSectionsLoader = document.getElementById('load-sections-loader');
loadSectionsAnchor.onclick = function(e){

    loadSectionsLoader.style.display = 'block';
    e.preventDefault();
    contentService.loadSections(function(data){
        clientOutput.innerHTML = data;
        loadSectionsLoader.style.display = 'none';
    });

};


// Create section example
var createSectionAnchor = document.getElementById('create-section');
var createSectionLoader = document.getElementById('create-section-loader');
createSectionAnchor.onclick = function(e){

    createSectionLoader.style.display = 'block';
    e.preventDefault();
    var sectionInput = {
        SectionInput : {
            identifier : "testSection" + Math.random()*1000000,
            name : "Test Section"
        }
    }

    // compatibility remark: JSON API is supported in all modern browsers (IE-wise since IE8)
    contentService.createSection(JSON.stringify(sectionInput), function(data){
        clientOutput.innerHTML = data;
        createSectionLoader.style.display = 'none';
    });



};



