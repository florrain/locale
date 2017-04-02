var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var babel = require('gulp-babel');
var mocha = require('gulp-mocha');
var gutil = require('gulp-util');
var eslint = require('gulp-eslint');
var del = require('del');

var paths = {
  scripts: ['src/**.js'],
  tests: ['test/tests.js'],
};

gulp.task('clean', function () {
  return del(['build']);
});

gulp.task('build', ['clean'], function () {
  return gulp.src(paths.scripts)
    .pipe(sourcemaps.init())
    .pipe(babel({
      presets: ['es2015'],
    }))
    .pipe(uglify())
    .pipe(concat('locale.min.js'))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('dist'));
});

gulp.task('lint', function () {
  return gulp.src(['**/*.js', '!node_modules/**', '!dist/**'])
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
