var inherit = require('inherit');
var nodeExtend = require('node.extend');
module.exports = inherit({
    
    __constructor: function () {
        Object.defineProperty(this, "id", {
            get: function() {
                var data = this.data;
                if(this.type === 'overview' || this.type === 'tutorial') {
                    return this.name;
                }
                return this.data.groupId + '_' + this.data.module + '_' + JSON.stringify(data.parentDoc) + '_' + data.ngdoc + '_' + data.id;
            }
        });
        Object.defineProperty(this, "module", {
            get: function () {
                return this.data.module;
            },
            set: function (value) {
                this.data.module = value;
            }
        });
        Object.defineProperty(this, "type", {
            get: function () {
                return this.data.ngdoc;
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
        Object.defineProperty(this, "parentDoc", {
            get: function () {
                return this.data.parentDoc;
            }
        });
        Object.defineProperty(this, "name", {
            get: function () {
                return this.data.name;
            }
        });
        Object.defineProperty(this, "path", {
            get: function () {
                return this.data.path;
            }
        });
        Object.defineProperty(this, "handler", {
            get: function () {
                return 'ngdoc';
            }
        });
    },
    
    getDocType: function () {
        return this.data.ngdoc;
    },
    
    addSubdoc: function (doc) {
        if(!this.data.subdocs) {
            this.data.subdocs = [];
        }
        this.data.subdocs.push(doc);
    },
    canHaveChildren: function () {
        return [
            'service',
            'object',
            'type',
            'module',
            'provider',
            'overview',
            'directive'
        ].indexOf(this.data.ngdoc) !== -1;
    },
    
    hasParent: function () {
        if(this.parentDoc && (this.parentDoc.name || this.parentDoc.module)) {
            return true;
        }
        return false;
    },
    
    getParentQuery: function () {
        return this.parentDoc;
    },
    
    toJSON: function () {
        var data = nodeExtend({}, this.data);
        data.type = this.type;
        data.handler = 'ngdoc';
        data.search = [data.name, data.module + '.' + data.ngdoc + ':' + data.name, data.file].join(' ');
        data.sortOn = data.step || data.name;
        if(data.type === 'overview' || data.type === 'tutorial') {
            data.module = data.name;
        }
        return data;
    },
    
    setPath: function (path) {
        this.data.path = path;
    },
    
    setData: function (data) {
        this.data = data;
        
        if(data.ngdoc === 'property' && (data.params.length > 0 || data.returns)) {
            data.ngdoc = 'method';
        }
        
        if(this.type != 'overview' && this.type != 'tutorial') {
            if(data.parentDoc && data.parentDoc.module && !data.parentDoc.name) {
                data.parentDoc.type = 'module';
            }
        } else {
            if(data.parentDoc && !data.parentDoc.name) {
                data.parentDoc.type = this.type;
            }
        }
        if(!data.id) {
            data.id = data.name;
        }
        
    }
});