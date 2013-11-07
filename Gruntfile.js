module.exports = function(grunt) {

    var baseSourcesPath = "src/",
        wrapStartFile = 'wrap/wrap.start.js',
        wrapEndFile = 'wrap/wrap.end.js',
        sourceFiles = [
            'src/*.js',
            'src/*/*.js'
        ],
        testFiles = [
            'test/*.tests.js',
            'test/manual/jsRestClientBundle/Resources/public/js/*.js',
            '!test/manual/jsRestClientBundle/Resources/public/js/CAPI.js'
        ];

    grunt.initConfig({
        requirejs: {
            dist: {
                options: {
                    almond: true,
                    name : 'PromiseCAPI',
                    optimize: "none",
                    baseUrl: baseSourcesPath,
                    out: "dist/CAPI.js",
                    wrap: {
                        startFile: wrapStartFile,
                        endFile: wrapEndFile
                    }
                }
            },
            distmin: {
                options: {
                    almond: true,
                    name : 'PromiseCAPI',
                    optimize: "uglify",
                    baseUrl: baseSourcesPath,
                    out: "dist/CAPI-min.js",
                    wrap: {
                        startFile: wrapStartFile,
                        endFile: wrapEndFile
                    }
                }
            },
            testBundle: {
                options: {
                    almond: true,
                    name : 'PromiseCAPI',
                    optimize: "none",
                    baseUrl: baseSourcesPath,
                    out: "test/manual/jsRestClientBundle/Resources/public/js/CAPI.js",
                    wrap: {
                        startFile: wrapStartFile,
                        endFile: wrapEndFile
                    }
                }
            }
        },
        jshint: {
            options: {
                jshintrc: 'jshint.json'
            },
            all: [sourceFiles, testFiles]
        },
        instrument : {
            files : sourceFiles,
            options : {
                basePath : 'test/instrument'
            }
        },
        jasmine: {
            options: {
                specs: 'test/*.tests.js',
                template: require('grunt-template-jasmine-requirejs'),
                templateOptions: {
                    requireConfig: {
                        baseUrl: baseSourcesPath
                    }
                }
            },
            test: {
                //Default options
            },
            coverage: {
                options: {
                    template: require('grunt-template-jasmine-istanbul'),
                    templateOptions: {
                        coverage: 'test/coverage/coverage.json',
                        report: [{
                            type: 'text-summary'
                        }, {
                            type: 'lcov',
                            options: {
                                dir: 'test/coverage'
                            }
                        }],
                        template: require('grunt-template-jasmine-requirejs'),
                        templateOptions: {
                            requireConfig: {
                                baseUrl: 'test/instrument/src/'
                            }
                        }
                    }
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
                    paths: baseSourcesPath,
                    outdir: 'api/'
                }
            }
        },
        shell: {
            livedoc: {
                command: 'yuidoc --server 3000 --config yuidoc.json',
                options: {
                    stdout: true,
                    stderr: true
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-requirejs');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-istanbul');
    grunt.loadNpmTasks('grunt-contrib-jasmine');
    grunt.loadNpmTasks('grunt-contrib-yuidoc');
    grunt.loadNpmTasks('grunt-shell');

    grunt.registerTask('hint', ['jshint']);
    grunt.registerTask('build', ['jshint', 'requirejs']);
    grunt.registerTask('test', ['jshint', 'jasmine:test'] );
    grunt.registerTask('coverage', ['jshint', 'instrument', 'jasmine:coverage'] );
    grunt.registerTask('doc', ['yuidoc'] );
    grunt.registerTask('livedoc', ['shell:livedoc'] );

};