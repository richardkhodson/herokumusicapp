module.exports = function(grunt) {
	grunt.initConfig({
		appConfig: grunt.file.readJSON('bower.json') || {},
		sass: {
			dist: {
				options: {
					style: 'expanded',
					noCache: true
				},
				files: [
					{'./dist/soundcloud-widget.css': './src/soundcloud-widget.sass'}
				]
			}
		},
		uglify: {
			dist: {
				options: {
					sourceMap: true
				},
				files: {
					'./dist/soundcloud-widget.min.js': './src/soundcloud-widget.js'
				}
			}
		},
		usebanner: {
			dist: {
				options: {
					position: 'top',
					banner: '/*\n * jQuery Soundcloud Widget\n' +
					' * <%= grunt.template.today("yyyy") %> <%= appConfig.authors[0] %> \n' +
					' * License: <%= appConfig.license %>\n */\n '
				},
				files: {
					src: ['dist/soundcloud-widget.min.js', 'dist/soundcloud-widget.js']
				}
			}
		},
		copy: {
			main: {
				src: 'src/soundcloud-widget.js',
				dest: 'dist/soundcloud-widget.js'
			}
		},
		watch: {
			scripts: {
				files: ['./src/**/*.js', './src/**/*.sass'],
				tasks: ['sass', 'copy', 'uglify', 'usebanner']
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-sass');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-banner');

	grunt.registerTask('default', ['watch']);
	grunt.registerTask('build', ['sass', 'copy', 'uglify', 'usebanner']);

};