var gulp = require('gulp');
var buffer = require('vinyl-buffer');
var util = require('gulp-util');
var runSequence = require('run-sequence');

var _ = {
    forEach: require('lodash.foreach'),
    map: require('lodash.map')
};

gulp.task('watchify', require('./gulp/watchify')(gulp));
gulp.task('browserify', require('./gulp/browserify')(gulp));
gulp.task('translations:download',  require('./gulp/translations_download')(gulp));
gulp.task('translations:generate',  require('./gulp/translations_generate')(gulp));
gulp.task('inlinesource', require('./gulp/inlinesource')(gulp));
gulp.task('clean', require('./gulp/clean')(gulp));
gulp.task('content', require('./gulp/content')(gulp));
gulp.task('featured', require('./gulp/featured')(gulp));
gulp.task('copy:fonts', function () {
    return gulp.src(['src/fonts/*'])
        .pipe(gulp.dest('dist/fonts/'));
});

gulp.task('copy:img', function () {
    return gulp.src(['./img/*'])
        .pipe(gulp.dest('./dist/img/'));
});

gulp.task('copy:trans', function () {
    return gulp.src(['./translations/*'])
        .pipe(gulp.dest('./dist/translations/'));
});

gulp.task('build', function (callback) {
    runSequence(
        'clean',
        'content',
        'featured',
        'translations:generate',
        'translations:download',
        'copy:img',
        'copy:trans',
        'copy:fonts',
        'browserify',
        'inlinesource',
        callback);
});
