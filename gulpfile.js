var gulp = require('gulp');
var typescript = require('gulp-typescript');

gulp.task('default', ['watch']);

gulp.task('watch', ['scripts'], function() {

  gulp.watch('src/**/*.ts', ['scripts']);
});

gulp.task('scripts', function() {

  return gulp.src('src/**/*.ts')
    .pipe(typescript({
      target: 'ES5',
      out: "jquery-scope-watch.js"
    }))
    .pipe(gulp.dest('release'));
});
