var nodeExtend = require('node.extend');
var Q = require('q');
var util = require('util');
var Parser = require('./core/parser');
var DocModel = require('./core/docModel');
var fse = require('fs-extra');
var path = require('path');
var request = require('request');
var grunt = require('grunt');
var zlib = require('zlib');
var fs = require('fs');

var Plugin = function () {
    
};

Plugin.prototype = nodeExtend(Plugin.prototype, {
    register: function (generator) {
        this._generator = generator;
        generator.on('FileParse', this.parseFile.bind(this));
        generator.on('CreateDocs', this.createDocs.bind(this));
        generator.on('FileParseBackfill', this.backfillData.bind(this));
        generator.on('ProcessConfig', this.processConfig.bind(this));
        generator.on('SetupRunConfig', this.setupConfig.bind(this));
        generator.on('GetStyles', this.getStyles.bind(this));
        generator.on('CopyFiles', this.copyFiles.bind(this));
    },
    
    createDocs: function (fileData, promises) {
        if(fileData.docType === 'ngdoc') {
            promises.push(function (currentModel) {
                var docModel = new DocModel();
                if(!currentModel) {
                    docModel.setData(fileData);
                } else {
                    docModel.setData(currentModel.toJSON());
                }
                return Q(docModel);
            });
        }
    },
    
    getStyles: function (styles) {
        styles.push(fse.readFileSync( path.resolve(__dirname, './web/ngplugin.less'), 'utf8' ));
    },
    
    processConfig: function (configuration, promises) {
        var deferred = Q.defer();
        promises.push(deferred.promise);
        if(configuration.showAngularDocs) {
            
            var dest = 'downloaded/angular/';
            var version = configuration.showAngularDocs === true ? 'master' : 'v' + configuration.showAngularDocs;
            console.log("Fetching angular source code for documentation");
            
            request({url: 'https://github.com/angular/angular.js/archive/' + version + '.tar.gz', encoding: null})
                    .on('error', deferred.reject)
                    .pipe(zlib.Unzip())
                    .on('error', deferred.reject)
                    .pipe(require('tar').Extract( { path: dest } ) )
                    .on('error', deferred.reject)
                    .on('end', function () {
                        console.log("Adding Angular docs to configuration");
                        var version = configuration.showAngularDocs === true ? 'master' : configuration.showAngularDocs;
                        
                        configuration.groups.push({
                            groupTitle: 'Angular Docs',
                            groupId: 'angular',
                            groupIcon: 'book',
                            examples: {
                                autoBootstrap: true,
                                include: {
                                    angular: true
                                }
                            },
                            groups: [
                                {
                                    id: "api",
                                    title:"API's",
                                    scripts: grunt.file.expand(['downloaded/angular/angular.js-' + version + '/src/**/*.js']),
                                    index: grunt.file.expand(['downloaded/angular/angular.js-' + version + '/docs/content/api/index.ngdoc'])
                                },
                                {
                                    id: "guide",
                                    title: "Guide",
                                    groupIcon: 'book',
                                    files: grunt.file.expand(['downloaded/angular/angular.js-' + version + '/docs/content/guide/**/*.ngdoc'])
                                },
                                {
                                    id: "misc",
                                    title: "Misc",
                                    groupIcon: 'empire',
                                    files: grunt.file.expand(['downloaded/angular/angular.js-' + version + '/docs/content/misc/**/*.ngdoc'])
                                },
                                {
                                    id: "tutorial",
                                    title: "Tutorial",
                                    groupIcon: 'life-ring',
                                    files: grunt.file.expand(['downloaded/angular/angular.js-' + version + '/docs/content/tutorial/**/*.ngdoc'])
                                }
                            ]
                        });
                        
                        deferred.resolve();
                    });
            
        } else {
            deferred.resolve();
        }
        
    },
    
    setupConfig: function (configuration, promises) {
        configuration.angularModules.push('docular.plugin.ngdoc');
        configuration.javascript.push('resources/plugins/ngdoc/ngplugin.js');
        configuration.css.push('resources/plugins/ngdoc/ngplugin.css');
    },
    
    copyFiles: function (webappDir) {
        fse.ensureDirSync(webappDir + '/resources/plugins/ngdoc');
        fse.copySync(path.resolve(__dirname, './web'), webappDir + '/resources/plugins/ngdoc');
    },
    
    backfillData: function (fileData, allFiles) {
        var parser = new Parser();
        if(fileData.extension === 'ngdoc' || fileData.extension === 'js') {
            parser.backfill(fileData, allFiles);
        }
    },
    
    parseFile: function (fileData, allFiles, promises) {
        var deferred = Q.defer(), parser = new Parser();
        promises.push(deferred.promise);
        
        var results = false;
        if(fileData.extension === 'ngdoc' || fileData.extension === 'js') {
            results = parser.parse(fileData, allFiles);
        }
        if(!results) {
            deferred.resolve();
            return;
        }
        
        for(var i = 0, l = results.length; i < l; i++) {
            if(results[i]) {
               fileData.docs.push(results[i]); 
            }
        }
        
        deferred.resolve();
    }
});

module.exports = Plugin;