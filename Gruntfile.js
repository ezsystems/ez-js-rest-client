module.exports = function(grunt) {

    var sourceFiles = [
        'src/structures/ContentCreateStruct.js',
        'src/structures/ContentUpdateStruct.js',
        'src/structures/ContentMetadataUpdateStruct.js',
        'src/structures/LocationCreateStruct.js',
        'src/structures/LocationUpdateStruct.js',
        'src/structures/SectionInputStruct.js',
        'src/structures/SessionCreateStruct.js',
        'src/structures/ViewCreateStruct.js',
        'src/structures/RelationCreateStruct.js',
        'src/structures/ObjectStateGroupCreateStruct.js',
        'src/structures/ObjectStateGroupUpdateStruct.js',
        'src/structures/ObjectStateUpdateStruct.js',
        'src/structures/ObjectStateCreateStruct.js',
        'src/structures/UrlAliasCreateStruct.js',
        'src/structures/UrlWildcardCreateStruct.js',
        'src/structures/ContentTypeGroupInputStruct.js',
        'src/structures/ContentTypeCreateStruct.js',
        'src/structures/ContentTypeUpdateStruct.js',
        'src/structures/FieldDefinitionCreateStruct.js',
        'src/structures/FieldDefinitionUpdateStruct.js',
        'src/structures/UserGroupCreateStruct.js',
        'src/structures/UserGroupUpdateStruct.js',
        'src/structures/UserCreateStruct.js',
        'src/structures/UserUpdateStruct.js',
        'src/structures/RoleInputStruct.js',
        'src/structures/RoleAssignInputStruct.js',
        'src/structures/PolicyCreateStruct.js',
        'src/structures/PolicyUpdateStruct.js',

        'src/structures/Request.js',
        'src/structures/Response.js',
        'src/structures/CAPIError.js',

        'src/services/DiscoveryService.js',
        'src/services/ContentService.js',
        'src/services/ContentTypeService.js',
        'src/services/UserService.js',

        'src/connections/XmlHttpRequestConnection.js',
        'src/connections/MicrosoftXmlHttpRequestConnection.js',

        'src/authAgents/HttpBasicAuthAgent.js',
        'src/authAgents/SessionAuthAgent.js',

        'src/ConnectionFeatureFactory.js',
        'src/ConnectionManager.js',
        'src/CAPI.js'

    ];

    var testCombo = sourceFiles.slice(0);
    testCombo.unshift('test/CAPI.testing.header.js');
    testCombo.push('test/CAPI.tests.js');
    testCombo.push('test/XmlHttpRequestConnection.tests.js');
    testCombo.push('test/MicrosoftXmlHttpRequestConnection.tests.js');
    testCombo.push('test/SessionAuthAgent.tests.js');
    testCombo.push('test/HttpBasicAuthAgent.tests.js');
    testCombo.push('test/ConnectionFeatureFactory.tests.js');
    testCombo.push('test/ConnectionManager.tests.js');
    testCombo.push('test/DiscoveryService.tests.js');
    testCombo.push('test/ContentService.tests.js');
    testCombo.push('test/ContentTypeService.tests.js');
    testCombo.push('test/UserService.tests.js');
    testCombo.push('test/Response.tests.js');


    grunt.initConfig({
        concat: {
            options: {
                separator: '\r\n'
            },
            dist: {
                src: sourceFiles,
                dest: 'dist/CAPI.js'
            },
            bundle: {
                src: sourceFiles,
                dest: 'test/manual/jsRestClientBundle/Resources/public/js/CAPI.js'
            },
            test: {
                src: testCombo,
                dest: 'spec/CAPI.spec.js'
            }
        },
        jshint: {
            options: {
                jshintrc: 'jshint.json'
            },
            all: ['dist/*.js']
        },
        jasmine_node: {
            coverage: {
            },
            options: {
                forceExit: true,
                match: '.',
                matchall: false,
                extensions: 'js',
                specNameMatcher: 'spec',
                junitreport: {
                    report: false,
                    useDotNotation: true,
                    consolidate: true
                }
            }
        },
        pkg: grunt.file.readJSON('package.json'),
        yuidoc: {
            compile: {
                name: '<%= pkg.name %>',
                description: '<%= pkg.description %>',
                version: '<%= pkg.version %>',
                url: '<%= pkg.repository %>',
                logo: "http://ez.no/extension/ez_ezno/design/ezno_2011/images/ez-logo.png",
                options: {
                    paths: 'src/',
                    outdir: 'api/'
                }
            }
        },
        shell: {
            livedoc: {
                command: 'yuidoc --server',
                options: {
                    stdout: true,
                    stderr: true
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-jasmine-node-coverage');
    grunt.loadNpmTasks('grunt-contrib-yuidoc');
    grunt.loadNpmTasks('grunt-shell');

    grunt.registerTask('default', ['concat']);
    grunt.registerTask('hint', ['concat', 'jshint']);
    grunt.registerTask('test', ['concat', 'jasmine_node'] );
    grunt.registerTask('doc', ['yuidoc'] );
    grunt.registerTask('livedoc', ['shell:livedoc'] );

};