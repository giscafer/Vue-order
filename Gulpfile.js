var gulp = require('gulp');
var watch = require('gulp-watch');

var path = 'src/server/test/**/*.js';

gulp.task('watch', function() {
  gulp.watch(['src/server/test/**/*.js', 'lib/*.js'], ['mocha']);
});

var mocha = require('gulp-mocha');
 
gulp.task('mocha', function () {
    return gulp.src(path , {read: false})
        // gulp-mocha needs filepaths so you can't have any plugins before it 
        .pipe(mocha({reporter: 'spec'}));
});


gulp.task('default',['mocha', 'watch']);