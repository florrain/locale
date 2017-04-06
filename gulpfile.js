var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var babel = require('gulp-babel');
var mocha = require('gulp-mocha');
var gutil = require('gulp-util');
var eslint = require('gulp-eslint');
var del = require('del');

var paths = {
  scripts: ['src/**.js'],
  tests: ['test/tests.js'],
  dist: {
    folder: 'dist',
    file: 'locale.js'
  }
};

gulp.task('clean', function () {
  return del([paths.dist.folder]);
});

gulp.task('build', ['lint', 'clean'], function () {
  return gulp.src(paths.scripts)
    .pipe(babel({
      presets: ['es2015'],
    }))
    .pipe(concat(paths.dist.file))
    .pipe(gulp.dest(paths.dist.folder));
});

gulp.task('lint', function () {
  return gulp.src(paths.scripts)
      .pipe(eslint())
      .pipe(eslint.format())
      .pipe(eslint.failAfterError());
});

gulp.task('mocha', function () {
  return gulp.src(paths.tests, { read: false })
    .pipe(mocha({
      reporter: 'spec',
      compilers: 'js:babel-core/register',
    }))
    .on('error', gutil.log);
});

gulp.task('watch', function () {
  gulp.watch([paths.scripts, paths.tests], ['lint', 'mocha']);
});

gulp.task('default', ['watch']);
