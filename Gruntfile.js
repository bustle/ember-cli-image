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
      header: '(function(Ember){\n\n' +
              '"use strict";\n\n',
      footer: '\n})(Ember);'
    },

    jshint: {
      beforeconcat: ['Gruntfile.js', 'src/**/*.js', 'addons/**/*.js'],
      afterconcat: ['dist/<%= pkg.name %>.js']
    },

    concat: {
      options: {
        banner: '<%= projectInfo %>\n' + 
                '<%= wrapClosure.header %>',
        footer: '<%= wrapClosure.footer %>'
      },

      dist: {
        src: [
          'src/image-state.js',
          'src/image-loader.js',
          'src/image-view.js',
          'src/background-image-view.js',
          'src/image-container-view.js'
        ],
        dest: 'dist/<%= pkg.name %>.js'
      }
    },

    qunit: {
      files: ['tests/*.html']
    }
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-qunit');

  // Build task
  grunt.registerTask('build', ['jshint:beforeconcat', 'concat:dist', 'jshint:afterconcat']);

  // Test task
  grunt.registerTask('test', ['qunit']);


  // Travis CI task
  grunt.registerTask('travis', ['build', 'test']);

  // Default task: all
  grunt.registerTask('default', ['build', 'test']);

};
