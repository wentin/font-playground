module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        sass: {
            dist: {
                options: {
                    style: 'compressed',
                    sourcemap: 'none'
                },
                files: {
                    'css/style.css': 'scss/style.scss',
                    'fonts/fonts.css': 'scss/fonts.scss'
                }
            }
        },
        autoprefixer: {
            options: {
                map: false
            },
            dist: {
                files: {
                    'css/style.css': 'css/style.css',
                    'fonts/fonts.css': 'fonts/fonts.css',
                }
            }
        },
        watch: {
            css: {
                files: 'scss/*.scss',
                tasks: ['sass', 'autoprefixer']
            },
            all: {
                files: ['scss/*.scss', '*.html', 'js/*.js'],
                options: {
                  livereload: true
                }
            }
        },
        connect: {
          server: {
            options: {
              port: 8080,
              hostname: '*',
              protocol: 'https'
            }
          }
        }
    });
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-autoprefixer');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.registerTask('default', ['connect', 'watch']);
}

