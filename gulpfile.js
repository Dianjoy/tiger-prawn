/**
 * Created by meathill on 15/12/21.
 */
'use strict';

var fs = require('fs')
  , _ = require('underscore')
  , gulp = require('gulp')
  , compass = require('gulp-compass')
  , minifyCSS= require('gulp-minify-css')
  , uglify = require('gulp-uglify')
  , concat = require('gulp-concat')
  , rename = require('gulp-rename')
  , replace = require('gulp-replace')
  , del = require('del')
  , sequence = require('run-sequence')
  , minify = require('html-minifier').minify
  , libs = [];

gulp.task('clear', function () {
  return del([
    'index.html',
    'css/screen.css',
    'js/bundle.js',
    'js/bundle.min.js'
  ]);
});

gulp.task('compass', function () {
  return gulp.src('sass/*.sass')
    .pipe(compass({
      sass: 'sass',
      css: 'css',
      sourcemap: false,
      style: 'compressed'
    }))
    .pipe(minifyCSS())
    .pipe(gulp.dest('css'));
});

gulp.task('js', function () {
  let html = fs.readFileSync('index.dev.html', 'utf8')
    , jses = [];
  // 取所有js
  html = html.replace(/<script src="js\/(.*?\.js)"(?: ([\w\-])+(?:="([^"]*)")?)*><\/script>\n/g, function (match, src) {
    if (/^define.js$/.test(src)) {
      return '';
    }
    jses.push(src);
    if (/^index.js$/.test(src)) {
      return '<script src="js/bundle.min.js"></script>';
    }
    return '';
  });
  // 取所有库
  html.replace(/(?:href|src)="(bower_components[^"]*(?:css|js))"/g, function (match, src) {
    libs.push(src);
  });

  // 更新 manifest.appcache
  html = html.replace('<html', '<html manifest="manifest.appcache"');
  fs.writeFile('index.html', minify(html, {
    removeComments: true,
    collapseWhitespace: true
  }));

  let others = _.chain(fs.readdirSync('js'))
    .filter(function (filename) {
      let fd = fs.openSync('js/' + filename, 'r')
        , stat = fs.fstatSync(fd);
      return stat.isDirectory();
    })
    .map(function (dir) {
      return _.map(fs.readdirSync('js/' + dir), function (value) {
        return dir + '/' + value;
      });
    })
    .flatten()
    .reject(function (filename) {
      return jses.indexOf(filename) != -1;
    })
    .value();

  jses = _.map(jses.concat(others), function (value) {
    return 'js/' + value;
  });

  return gulp.src(jses)
    .pipe(concat('bundle.js'))
    .pipe(gulp.dest('js/'))
    .pipe(uglify())
    .pipe(rename('bundle.min.js'))
    .pipe(gulp.dest('js/'));
});

gulp.task('manifest', function () {
  let config = fs.readFileSync('js/config.js', 'utf8')
    , api = config.match(/ns.API = '([^']+)'/)[1];
  gulp.src('manifest.appcache.sample')
    .pipe(replace('# {{date}}', (new Date()).toISOString()))
    .pipe(replace('# {{API}}', api))
    .pipe(replace('# {{libs}}', libs.join('\n')))
    .pipe(rename('manifest.appcache'))
    .pipe(gulp.dest(''));
});

gulp.task('default', function (taskDone) {
  sequence(
    'clear',
    ['js', 'compass'],
    'manifest',
    taskDone
  );
});