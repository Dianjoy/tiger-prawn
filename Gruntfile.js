/**
 * Created by meathill on 14/11/5.
 */

'use strict';

module.exports = function (grunt) {
  var config = grunt.file.readJSON('build.json')
    , jsFiles = [];

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    clean: {
      options: {
        force: true
      },
      begin: [config.temp, config.dist],
      end: [config.temp]
    },
    // TODO 移除page的样式
    compass: {
      all: {
        options: {
          cssDir: config.temp + 'css/',
          environment: 'production',
          force: true,
          noLineComments: true,
          outputStyle: 'compressed',
          sourcemap: false
        }
      }
    },
    cssmin: {
      target: {
        files: [{
          expand: true,
          cwd: config.temp + 'css/',
          src: ['screen.css'],
          dest: config.dist + 'css/',
          ext: '.min.css'
        }]
      }
    },
    index: {
      index: 'index.dev.html'
    },
    concat: {
      options: {
        banner: '"use strict";\n(function () {\n',
        footer: '}());',
        separator: ';\n',
        stripBanners: {
          block: true,
          line: true
        },
        process: function (src) {
          return src.replace(/(^|\n)[ \t]*('use strict'|"use strict");?\s*/g, '');
        }
      },
      js: {
        src: jsFiles,
        dest: config.dist + 'js/tiger-prawn.js'
      }
    },
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> Version <%= pkg.version %>\n <%= grunt.template.today("yyyy-mm-dd") %> */\n',
        compress: {
          global_defs: {
            'DEBUG': false
          },
          dead_code: true,
          unused: true,
          drop_console: true
        },
        report: 'gzip'
      },
      all: {
        files: [{
          src: config.dist + 'js/tiger-prawn.js',
          dest: config.dist + 'js/tiger-prawn.min.js'
        }]
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-compass');
  grunt.loadNpmTasks('grunt-contrib-cssmin');

  grunt.registerMultiTask('index', 'find out js', function () {
    var JS_REG = /<script src="(js\/\S+?)"><\/script>/g
      , html = grunt.file.read(this.data);
    // 取HTML中引用的文件
    html.replace(JS_REG, function (match, src) {
      var filename = src.substr(src.lastIndexOf('/') + 1);
      // 不打包特殊文件
      if (['define.js', 'index.js', 'config.js'].indexOf(filename) != -1) {
        return '';
      }
      // 不打包除Base外的路由文件
      if (/^js\/router\//.test(src) && filename != 'Base.js') {
        return '';
      }
      // 不打包page目录里的专用业务逻辑
      if (/^js\/page\//.test(src)) {
        return '';
      }
      // 只打包model目录里的通用类
      if (/^js\/model\//.test(src) && !/(Model|Me|Notice|ListCollection|TableMemento|ProxyCollection|Manager)\./.test(src)) {
        return '';
      }
      jsFiles.push(src);
      return match;
    });
    // 取所有组件
    grunt.file.recurse('js/component', function (path) {
      if (jsFiles.indexOf(path) === -1) {
        jsFiles.push(path);
      }
    });
    console.log(jsFiles);
  });

  grunt.registerTask('default', [
    'clean:begin',
    'compass',
    'cssmin',
    'index',
    'concat',
    'uglify',
    'clean:end'
  ]);
};