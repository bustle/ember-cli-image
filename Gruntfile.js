module.exports = function(grunt) {

  'use strict';

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    projectInfo:  '/**\n * <%= pkg.name %>\n' +
                  ' * <%= pkg.description %>\n' +
                  ' *\n' +
                  ' * version: <%= pkg.version %>\n' +
                  ' * last modifed: <%= grunt.template.today("yyyy-mm-dd") %>\n' +
                  ' *\n' +
                  ' * Garth Poitras <garth22@gmail.com>\n' +
                  ' * Copyright <%= grunt.template.today("yyyy") %> (c) <%= pkg.author %>\n' +
                  ' */\n',

    wrapClosure: {
      header: '(function(window, Ember, undefined){\n\n' +
              '"use strict";\n\n',
      footer: '\n})(this, Ember);'
    },

    jshint: {
      beforeconcat: ['Gruntfile.js', 'src/**/*.js'],
      afterconcat: ['<%= pkg.name %>.js']
    },

    concat: {
      options: {
        banner: '<%= projectInfo %>\n' + 
                '<%= wrapClosure.header %>',
        footer: '<%= wrapClosure.footer %>'
      },

      dist: {
        src: [
          'src/image-loader.js',
          'src/img-view.js',
          'src/background-image-view.js',
          'src/image-container-view.js'
        ],
        dest: '<%= pkg.name %>.js'
      }
    },

    uglify: {
      dist: {
        files: {
          '<%= pkg.name %>.min.js': ['<%= concat.dist.dest %>']
        }
      }
    },

    qunit: {
      files: ['tests/*.html']
    }
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-qunit');

  // Build task
  grunt.registerTask('build', ['jshint:beforeconcat', 'concat:dist', 'jshint:afterconcat']);

  // Test task
  grunt.registerTask('test', ['qunit']);

  // Package task
  grunt.registerTask('package', ['uglify']);

  // Travis CI task
  grunt.registerTask('travis', ['build', 'test']);

  // Default task: all
  grunt.registerTask('default', ['build', 'test', 'package']);

};
