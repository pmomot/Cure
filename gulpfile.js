var gulp = require('gulp'),
    sass = require('gulp-sass');

gulp.task('styles', function() {
    gulp.src('public/scss/**/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('public/css/compiled'));
});

//Watch task
gulp.task('default',function() {
    gulp.watch('public/scss/**/*.scss',['styles']);
});