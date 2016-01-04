/**
 * Created by meathill on 15/12/21.
 */

var build = require('./build.json')
  , fs = require('fs')
  , _ = require('underscore')
  , gulp = require('gulp')
  , compass = require('gulp-compass')
  , minifyCSS= require('gulp-minify-css')
  , uglify = require('gulp-uglify')
  , concat = require('gulp-concat')
  , rename = require('gulp-rename');

gulp.task('compass', function () {
  gulp.src('sass/*.sass')
    .pipe(compass({
      sass: 'sass',
      css: 'css',
      sourcemap: false,
      style: 'compressed'
    }))
    .pipe(minifyCSS())
    .pipe(gulp.dest(build.build + '/css/'));
});

gulp.task('js', function () {
  let html = fs.readFileSync('index.dev.html', 'utf8')
    , jses = [];
  html = html.replace(/<script src="js\/(.*?\.js)"(?: ([\w\-])+(?:="([^"]*)")?)*><\/script>/, function (match, src) {
    if (/^define.js$/.test(src)) {
      return '';
    }
    if (/^index.js$/.test(src)) {
      return '<script src="js/bundle.min.js"></script>';
    }
    jses.push(src);
    return '';
  });

  let others = _.chain(fs.readSync('js'))
    .filter(function (filename) {
      let stat = fs.fstatSync('js/' + filename);
      return stat.isDirectory();
    })
    .map(function (dir) {
      return _.map(fs.readSync('js/' + dir), function (value) {
        return dir + '/' + value;
      });
    })
    .flatten()
    .reject(function (filename) {
      return jses.indexOf(filename) != -1;
    })
    .value();

  gulp.src(jses.concat(others))
    .pipe(concat('bundle.js'))
    .pipe(gulp.dest(build.build + 'js/'))
    .pipe(uglify())
    .pipe(rename('bundle.min.js'))
    .pipe(gulp.dest(build.build + 'js/'));

  fs.writeFile(build + 'index.html', html);
});