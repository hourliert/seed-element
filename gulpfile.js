var gulp = require('gulp'),
	bs = require('browser-sync').create(),
	bg = require('gulp-bg'),
	ps = require('ps-node'),
  babel = require('gulp-babel'),
  sourcemaps = require('gulp-sourcemaps'),
  crisper = require('gulp-crisper'),
  gulpif = require('gulp-if'),
  jshint = require('gulp-jshint');

var POLYSERVE_PORT = 8080,
    elementName = 'seed-element';

var browserSyncConfig = function(path, cb) {
  bs.init({
    proxy: 'localhost:' + POLYSERVE_PORT,
    startPath: path
  });

  bs.reload();

  process.on('exit', function() {
    bs.exit();
  });
  cb();
};

var watchComponent = function() {
  gulp.watch(['./src/*.{js,html}', 'demo/**/*.html', 'test/**/*.html'], ['js', 'jshint', bs.reload]);
};

// Transpile all JS to ES5.
gulp.task('js', function () {
  return gulp.src(['src/**/*.{js,html}'])
    .pipe(sourcemaps.init())
    .pipe(gulpif('*.html', crisper())) // Extract JS from .html files
    .pipe(gulpif('*.js', babel()))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('.'));
});

// Lint JavaScript
gulp.task('jshint', function () {
  return gulp.src([
      'src/**/*.{js,html}',
      'gulpfile.js'
    ])
    .pipe(jshint.extract()) // Extract JS from .html files
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'))
    .pipe(gulpif(!bs.active, jshint.reporter('fail')));
});

gulp.task('polyserve', ['js', 'jshint'], function(cb) {
  ps.lookup({
    command: 'polyserve',
    psargs: '-f'
  }, function(err, resultList) {
    if (err) {
      throw new Error(err);
    }
 
    if (!resultList.length) {
      bg('./node_modules/polyserve/bin/polyserve', '-p ' + POLYSERVE_PORT)();
    }
    cb();
  }); 
});
	
gulp.task('serve', ['polyserve'], function(cb) {
  browserSyncConfig('/components/' + elementName + '/demo/', cb);
  watchComponent();
});

gulp.task('serve:doc', ['polyserve'], function(cb) {
  browserSyncConfig('/components/' + elementName + '/', cb);
  watchComponent();
});

gulp.task('test:watch', ['polyserve'], function(cb) {
  browserSyncConfig('/components/' + elementName + '/test/', cb);
  watchComponent();
});

try { require('web-component-tester').gulp.init(gulp); } catch (err) {}