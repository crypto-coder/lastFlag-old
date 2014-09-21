var nodeExtend = require('node.extend');
var Q = require('q');
var fse = require('fs-extra');
var path = require('path');
var request = require('request');
var grunt = require('grunt');
var zlib = require('zlib');

var DocModel = function () {
    Object.defineProperty(this, "id", {
        get: function() {
            return this.name
        }
    });

    Object.defineProperty(this, "name", {
        get: function() {
            var name = this.data.content.match('^#(.+)');
            if(name) {
                name = name[1];
            } else {
                name = '';
            }
            return name;
        }
    });

    Object.defineProperty(this, "module", {
        get: function() {
            return this.data.module
        }
    });
    Object.defineProperty(this, "groupId", {
        get: function () {
            return this.data.groupId;
        },
        set: function (value) {
            this.data.groupId = value;
        }
    });
}
DocModel.prototype.setData = function (data) {
    this.data = data;
}
DocModel.prototype.setPath = function (path) {
    this.path = path;
}
DocModel.prototype.toJSON = function () {
    var data = nodeExtend({}, this.data);
    data.path = this.path;
    data.name = this.name;
    data.id = this.id;
    data.search = data.content;
    data.sortOn = data.name;
    data.handler = 'markdown';
    return data;
}
DocModel.prototype.hasParent = function () {
    return !!this.parentDoc;
}

var Plugin = function () {

};

Plugin.prototype = nodeExtend(Plugin.prototype, {
    register: function (generator) {
        this._generator = generator;
        generator.on('FileParse', this.parseFile.bind(this));
        generator.on('CreateDocs', this.createDocs.bind(this));
        generator.on('CopyFiles', this.copyFiles.bind(this));
        generator.on('SetupRunConfig', this.setupConfig.bind(this));
        generator.on('ProcessConfig', this.processConfig.bind(this));
    },

    processConfig: function (configuration, promises) {
        var deferred = Q.defer();
        promises.push(deferred.promise);
        if(configuration.showDocularDocs) {

            var dest = 'downloaded/docular/';
            console.log("Fetching docular source code for documentation");

            request({url: 'https://github.com/Vertafore/docular/archive/master.tar.gz', encoding: null})
                .on('error', deferred.reject)
                .pipe(zlib.Unzip())
                .on('error', deferred.reject)
                .pipe(require('tar').Extract( { path: dest } ) )
                .on('error', deferred.reject)
                .on('end', function () {
                    console.log("Adding Docular docs to configuration");

                    configuration.groups.push({
                        groupTitle: 'Docular Docs',
                        groupId: 'docular',
                        groupIcon: 'lightbulb-o',
                        files: grunt.file.expand(['downloaded/docular/docular-master/docs/**/*.*'])
                    });

                    deferred.resolve();
                });

        } else {
            deferred.resolve();
        }

    },

    parseFile: function (fileData, promises) {
        if(fileData.extension === 'md') {
            fileData.docs.push({
                fileName: fileData.fileName,
                handler: 'markdown',
                content: fileData.content
            })
        }
    },
    copyFiles: function (webappDir) {
        fse.ensureDirSync(webappDir + '/resources/plugins/markdown');
        fse.copySync(path.resolve(__dirname, './web'), webappDir + '/resources/plugins/markdown');
    },
    setupConfig: function (configuration, promises) {
        configuration.angularModules.push('docular.plugin.markdown');
        configuration.javascript.push('resources/plugins/markdown/markdownPlugin.js');
    },
    createDocs: function (doc, promises) {
        if(doc.handler === 'markdown') {
            promises.push(function (currentModel) {
                var docModel = new DocModel();
                if(!currentModel) {
                    docModel.setData(doc);
                } else {
                    docModel.setData(currentModel.toJSON());
                }
                return Q(docModel);
            });
        }
    }
});

module.exports = Plugin;