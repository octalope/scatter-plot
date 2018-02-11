var gulp = require('gulp');
var connect = require('gulp-connect');
var open = require('gulp-open');

var exec = require('child_process').exec;

gulp.task('chart', function (cb) {
  exec('node ./src/index.js', function (err, stdout, stderr) {
    if(stdout) {
      console.log(stdout);
    }
    if(stderr) {
      console.log(stderr);
    }
    cb(err);
  });
})

gulp.task('html', function() {
  gulp.src('./src/*.html')
    .pipe(gulp.dest('./dist'))
    .pipe(connect.reload());
});

gulp.task('connect', function () {
  connect.server({
    root: 'dist',
    port: 8001,
    livereload: true
  });
});

gulp.task('open', function() {
  gulp.src('index.html')
    .pipe(open({uri: 'http://localhost:8001/'}));
});

gulp.task('watch', function () {
  gulp.watch('./lib/*.js', ['chart']);
  gulp.watch('./src/*.js', ['chart']);
  gulp.watch('./src/*.html', ['html']);
});


gulp.task('default', ['chart', 'html', 'connect', 'open', 'watch']);

