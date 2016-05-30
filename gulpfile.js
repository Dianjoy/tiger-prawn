/**
 * Created by meathill on 15/12/21.
 */
'use strict';

const BUILD = 'BUILD';
const VERSION = 'VERSION';
const DEST_HTML = 'index.html';
const TEMP_HTML = 'index.tmp.html';

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
  , libs = []
  , version = '';

gulp.task('clear', function () {
  return del([
    DEST_HTML,
    TEMP_HTML,
    'css/screen.css',
    'js/bundle.js',
    'js/bundle.min.js'
  ]);
});

gulp.task('version', function (callback) {
  let build = fs.existsSync(BUILD) ? Number(fs.readFileSync(BUILD)) : 0;
  version = fs.readFileSync(VERSION, 'utf8');

  build++;
  fs.writeFile(BUILD, build);

  // 生成本次的版本号
  version = version + '.' + build;
  callback();
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
      return '<script src="js/bundle.min.js?v=' + version + '"></script>';
    }
    return '';
  });
  // 取所有库
  html.replace(/(?:href|src)="(bower_components[^"]*(?:css|js))"/g, function (match, src) {
    libs.push(src);
  });
  fs.writeFile(TEMP_HTML, minify(html, {
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
    .pipe(replace('${version}', version))
    .pipe(gulp.dest('js/'))
    .pipe(uglify())
    .pipe(rename('bundle.min.js'))
    .pipe(gulp.dest('js/'));
});

gulp.task('html', function () {
  return gulp.src(TEMP_HTML)
    .pipe(replace(/\.(css|js)"/g, '.$1?v=' + version + '"'))
    .pipe(rename(DEST_HTML))
    .pipe(gulp.dest('./'));
});

gulp.task('default', function (taskDone) {
  sequence(
    'clear',
    'version',
    ['js', 'compass'],
    'html',
    taskDone
  );
});