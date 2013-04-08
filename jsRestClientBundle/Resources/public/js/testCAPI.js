// Some simple js REST CAPI usage scenario

var jsCAPI = new CAPI(
    'http://ez.git.local',
    {
        user : "admin",
        password : "admin",
        authMethod : "HTTPBasicAuth"
    },
    "XHR");

var contentService = jsCAPI.getContentService();

var clientOutput = document.getElementById('output');


// Root
var rootAnchor = document.getElementById('root');
var rootLoader = document.getElementById('root-loader');
rootAnchor.onclick = function(e){

    rootLoader.style.display = 'block';
    e.preventDefault();

    contentService.root(
        '/api/ezp/v2/',
        function(data){
            clientOutput.innerHTML = data;
            rootLoader.style.display = 'none';
        }
    );
};



// Load single section example
var loadSectionAnchor = document.getElementById('load-section');
var loadSectionLoader = document.getElementById('load-section-loader');
loadSectionAnchor.onclick = function(e){

    loadSectionLoader.style.display = 'block';
    e.preventDefault();

    var loadSectionInput = document.getElementById('load-section-input');
    if (loadSectionInput.value.length){
        contentService.loadSection(
            loadSectionInput.value,
            function(data){
                clientOutput.innerHTML = data;
                loadSectionLoader.style.display = 'none';
            }
        );
    } else {
        clientOutput.innerHTML = 'Id is missing!';
    }
};


// Load sections list example
var loadSectionsAnchor = document.getElementById('load-sections');
var loadSectionsLoader = document.getElementById('load-sections-loader');
loadSectionsAnchor.onclick = function(e){

    loadSectionsLoader.style.display = 'block';
    e.preventDefault();
    contentService.loadSections(
        '/api/ezp/v2/content/sections',
        function(data){
            clientOutput.innerHTML = data;
            loadSectionsLoader.style.display = 'none';
        }
    );

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
    contentService.createSection(
        '/api/ezp/v2/content/sections',
        JSON.stringify(sectionInput),
        function(data){
            clientOutput.innerHTML = data;
            createSectionLoader.style.display = 'none';
        }
    );

};


// Update section example
var updateSectionAnchor = document.getElementById('update-section');
var updateSectionLoader = document.getElementById('update-section-loader');
updateSectionAnchor.onclick = function(e){

    var updateSectionInput = document.getElementById('update-section-input');
    if (updateSectionInput.value.length){

        updateSectionLoader.style.display = 'block';
        e.preventDefault();
        var sectionInput = {
            SectionInput : {
                identifier : "testSection" + Math.random()*1000000,
                name : "Test Section " + Math.round(Math.random()*1000)
            }
        }

        // compatibility remark: JSON API is supported in all modern browsers (IE-wise since IE8)
        contentService.updateSection(
            updateSectionInput.value,
            JSON.stringify(sectionInput),
            function(data){
                clientOutput.innerHTML = data;
                updateSectionLoader.style.display = 'none';
            }
        );

    } else {
        clientOutput.innerHTML = 'Id is missing!';
    }

};


// Delete section example
var deleteSectionAnchor = document.getElementById('delete-section');
var deleteSectionLoader = document.getElementById('delete-section-loader');
deleteSectionAnchor.onclick = function(e){

    deleteSectionLoader.style.display = 'block';
    e.preventDefault();

    var deleteSectionInput = document.getElementById('delete-section-input');
    if (deleteSectionInput.value.length){
        contentService.deleteSection(
            deleteSectionInput.value,
            function(data){
                clientOutput.innerHTML = data;
                deleteSectionLoader.style.display = 'none';
            }
        );
    } else {
        clientOutput.innerHTML = 'Id is missing!';
    }
};

// ******************************
// ******************************

// Load content type groups list example
var loadContentTypeGroupsAnchor = document.getElementById('load-contenttype-groups');
var loadContentTypeGroupsLoader = document.getElementById('load-contenttype-groups-loader');
loadContentTypeGroupsAnchor.onclick = function(e){

    loadContentTypeGroupsLoader.style.display = 'block';
    e.preventDefault();

    contentService.loadContentTypeGroups(
        '/api/ezp/v2/content/typegroups',
        function(data){
            clientOutput.innerHTML = data;
            loadContentTypeGroupsLoader.style.display = 'none';
        }
    );
};

// Load single content type group example
var loadContentTypeGroupAnchor = document.getElementById('load-contenttype-group');
var loadContentTypeGroupLoader = document.getElementById('load-contenttype-group-loader');
loadContentTypeGroupAnchor.onclick = function(e){

    loadContentTypeGroupLoader.style.display = 'block';
    e.preventDefault();

    var loadContentTypeGroupInput = document.getElementById('load-contenttype-group-input');
    if (loadContentTypeGroupInput.value.length){
        contentService.loadContentTypeGroup(
            loadContentTypeGroupInput.value,
            function(data){
                clientOutput.innerHTML = data;
                loadContentTypeGroupLoader.style.display = 'none';
            }
        );
    } else {
        clientOutput.innerHTML = 'Id is missing!';
    }
};

// ******************************
// ******************************

// Load content info example
var loadContentInfoAnchor = document.getElementById('load-contentinfo');
var loadContentInfoLoader = document.getElementById('load-contentinfo-loader');
loadContentInfoAnchor.onclick = function(e){

    loadContentInfoLoader.style.display = 'block';
    e.preventDefault();

    var loadContentInfoInput = document.getElementById('load-contentinfo-input');
    if (loadContentInfoInput.value.length){
        contentService.loadContentInfo(
            loadContentInfoInput.value,
            function(data){
                clientOutput.innerHTML = data;
                loadContentInfoLoader.style.display = 'none';
            }
        );
    } else {
        clientOutput.innerHTML = 'Id is missing!';
    }
};

// Load content info + current version example
var loadContentCurrentAnchor = document.getElementById('load-contentcurrent');
var loadContentCurrentLoader = document.getElementById('load-contentcurrent-loader');
loadContentCurrentAnchor.onclick = function(e){

    loadContentCurrentLoader.style.display = 'block';
    e.preventDefault();

    var loadContentCurrentInput = document.getElementById('load-contentcurrent-input');
    if (loadContentCurrentInput.value.length){
        contentService.loadContentInfoAndCurrentVersion(
            loadContentCurrentInput.value,
            function(data){
                clientOutput.innerHTML = data;
                loadContentCurrentLoader.style.display = 'none';
            }
        );
    } else {
        clientOutput.innerHTML = 'Id is missing!';
    }
};

// Load content versions example
var loadContentVersionsAnchor = document.getElementById('load-contentversions');
var loadContentVersionsLoader = document.getElementById('load-contentversions-loader');
loadContentVersionsAnchor.onclick = function(e){

    loadContentVersionsLoader.style.display = 'block';
    e.preventDefault();

    var loadContentVersionsInput = document.getElementById('load-contentversions-input');
    if (loadContentVersionsInput.value.length){
        contentService.loadVersions(
            loadContentVersionsInput.value,
            function(data){
                clientOutput.innerHTML = data;
                loadContentVersionsLoader.style.display = 'none';
            }
        );
    } else {
        clientOutput.innerHTML = 'Id is missing!';
    }
};