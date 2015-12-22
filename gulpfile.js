/**
 * Created by meathill on 15/12/21.
 */

var build = require('./build.json')
  , gulp = require('gulp')
  , compass = require('gulp-compass')
  , minifyCSS= require('gulp-minify-css');

gulp.task('compass', function () {
  gulp.src('./public/sass/*.sass')
    .pipe(compass({
      config_file: './config.rb',
      sass: './public/sass',
      css: './public/css',
      sourcemap: false
    }))
    .pipe(minifyCSS())
    .pipe(gulp.dest('./public/css/'));
});

gulp.task('')