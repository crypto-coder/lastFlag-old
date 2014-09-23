
module.exports = function(grunt) {

	grunt.loadNpmTasks('grunt-loopback-sdk-angular');
	grunt.loadNpmTasks('grunt-docular');
	grunt.loadNpmTasks('grunt-contrib-uglify');

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		loopback_sdk_angular: {
			services: {
				options: {
					input: 'server/server.js',
					output: 'client/js/lb-services.js'
				}
			}
		},
		docular: {
			groups: [{
				groupTitle: 'Loopback',
				groupId: 'loopback',
				sections: [{
					id: 'lbServices',
					title: 'Loopback Services',
					scripts: [ 'client/js/lb-services.js' ]
				}]
			}]
		},
		uglify: {
			options: {
				banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */'
			},
			build: {
				src: 'src/<%= pkg.name %>.js',
				dest: 'build/<%= pkg.name %>.min.js'
			}	
		}
	});

	grunt.registerTask('default', ['loopback_sdk_angular', 'docular']);
};

