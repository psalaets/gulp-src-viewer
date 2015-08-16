var gulp = require('gulp');
var gsv = require('./');

// for testing gulp-src-viewer
gulp.task('default', function() {
  gsv(gulp);
});