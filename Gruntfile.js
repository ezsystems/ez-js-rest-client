module.exports = function(grunt) {

    grunt.initConfig({
        concat: {
            options: {
                separator: ';'
            },
            dist: {
                src: [
                    'jsRestClientBundle/Resources/public/js/REST-client/structures/ContentCreateStruct.js',
                    'jsRestClientBundle/Resources/public/js/REST-client/structures/ContentUpdateStruct.js',
                    'jsRestClientBundle/Resources/public/js/REST-client/structures/ContentMetadataUpdateStruct.js',
                    'jsRestClientBundle/Resources/public/js/REST-client/structures/LocationCreateStruct.js',
                    'jsRestClientBundle/Resources/public/js/REST-client/structures/LocationUpdateStruct.js',
                    'jsRestClientBundle/Resources/public/js/REST-client/structures/SessionCreateStruct.js',
                    'jsRestClientBundle/Resources/public/js/REST-client/structures/ViewCreateStruct.js',
                    'jsRestClientBundle/Resources/public/js/REST-client/structures/RelationCreateStruct.js',
                    'jsRestClientBundle/Resources/public/js/REST-client/structures/ObjectStateGroupCreateStruct.js',
                    'jsRestClientBundle/Resources/public/js/REST-client/structures/ObjectStateGroupUpdateStruct.js',
                    'jsRestClientBundle/Resources/public/js/REST-client/structures/ObjectStateUpdateStruct.js',
                    'jsRestClientBundle/Resources/public/js/REST-client/structures/ObjectStateCreateStruct.js',
                    'jsRestClientBundle/Resources/public/js/REST-client/structures/UrlAliasCreateStruct.js',
                    'jsRestClientBundle/Resources/public/js/REST-client/structures/UrlWildcardCreateStruct.js',
                    'jsRestClientBundle/Resources/public/js/REST-client/structures/ContentTypeGroupInputStruct.js',
                    'jsRestClientBundle/Resources/public/js/REST-client/structures/ContentTypeCreateStruct.js',
                    'jsRestClientBundle/Resources/public/js/REST-client/structures/ContentTypeUpdateStruct.js',
                    'jsRestClientBundle/Resources/public/js/REST-client/structures/FieldDefinitionCreateStruct.js',
                    'jsRestClientBundle/Resources/public/js/REST-client/structures/FieldDefinitionUpdateStruct.js',
                    'jsRestClientBundle/Resources/public/js/REST-client/structures/UserGroupCreateStruct.js',
                    'jsRestClientBundle/Resources/public/js/REST-client/structures/UserGroupUpdateStruct.js',
                    'jsRestClientBundle/Resources/public/js/REST-client/structures/UserCreateStruct.js',
                    'jsRestClientBundle/Resources/public/js/REST-client/structures/UserUpdateStruct.js',
                    'jsRestClientBundle/Resources/public/js/REST-client/structures/RoleInputStruct.js',
                    'jsRestClientBundle/Resources/public/js/REST-client/structures/RoleAssignInputStruct.js',
                    'jsRestClientBundle/Resources/public/js/REST-client/structures/PolicyCreateStruct.js',
                    'jsRestClientBundle/Resources/public/js/REST-client/structures/PolicyUpdateStruct.js',

                    'jsRestClientBundle/Resources/public/js/REST-client/structures/Request.js',
                    'jsRestClientBundle/Resources/public/js/REST-client/structures/Response.js',
                    'jsRestClientBundle/Resources/public/js/REST-client/structures/Error.js',

                    'jsRestClientBundle/Resources/public/js/REST-client/services/DiscoveryService.js',
                    'jsRestClientBundle/Resources/public/js/REST-client/services/ContentService.js',
                    'jsRestClientBundle/Resources/public/js/REST-client/services/ContentTypeService.js',
                    'jsRestClientBundle/Resources/public/js/REST-client/services/UserService.js',

                    'jsRestClientBundle/Resources/public/js/REST-client/connections/XmlHttpRequestConnection.js',
                    'jsRestClientBundle/Resources/public/js/REST-client/connections/MicrosoftXmlHttpRequestConnection.js',

                    'jsRestClientBundle/Resources/public/js/REST-client/authAgents/HttpBasicAuthAgent.js',
                    'jsRestClientBundle/Resources/public/js/REST-client/authAgents/SessionAuthAgent.js',

                    'jsRestClientBundle/Resources/public/js/REST-client/ConnectionFeatureFactory.js',
                    'jsRestClientBundle/Resources/public/js/REST-client/ConnectionManager.js',
                    'jsRestClientBundle/Resources/public/js/REST-client/CAPI.js'

                ],
                dest: 'dist/CAPI.js'
            }
        },
        jshint: {
            options: {
                jshintrc: 'jshint.json'
            },
            all: ['dist/*.js']
        }
    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-jshint');

    // Default task(s).
    grunt.registerTask('default', ['concat','jshint']);
};