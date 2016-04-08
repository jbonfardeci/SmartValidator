var gulp = require('gulp');
var uglify = require('gulp-uglify');
 
gulp.task('default', function() {
  
  //minify and uglify js
  return gulp.src('js/*.js')
    .pipe(uglify())
    .pipe(gulp.dest('js/min/'));
  
});