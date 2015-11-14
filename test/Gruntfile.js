module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      build: {
        src: 'src/<%= pkg.name %>.js',
        dest: 'build/<%= pkg.name %>.min.js'
      }
    }
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');

  // Default task(s).
  grunt.registerTask('default', ['uglify']);

  // Test
  grunt.registerTask('test-api', function() {

    this.async();

    grunt.util.spawn({

      cmd: './test-api.sh'

    }, function(error, result, code) {

      if (error) {
        grunt.log.write('Error: ' + error);
      } else {
        try {
          var resultObj = JSON.parse(result.stdout);
          console.log(resultObj);
        } catch (e) {
          grunt.log.write('Cannot parse result!');
        }
      }
      grunt.log.write('\n');
      if (code !== 0) grunt.log.write(code);

    });

  });

};
