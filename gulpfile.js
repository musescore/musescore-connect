var gulp = require('gulp');
var watchify = require('watchify');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var notifier = require('node-notifier');
var util = require('gulp-util');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var inlinesource = require('gulp-inline-source');

gulp.task('inlinesource', function () {
    return gulp.src('./index.html')
        .pipe(inlinesource())
        .pipe(gulp.dest('./dist'));
});

gulp.task('browserify', function () {
    return build('main', 'bundle');
});

function build() {
    var bundler = browserify('./src/index.js', {fullPaths: false});
    bundler.on('log', util.log.bind(util));
    bundler.bundle()
        .on('error', util.log)
        .pipe(source('bundle.js'))
        .pipe(buffer())
        .pipe(uglify())
        .pipe(gulp.dest('./src'));
}

gulp.task('watchify', function () {
    return bundle('main', 'bundle')
});

function bundle() {
    watchify.args.debug = true;
    watchify.args.fullPaths = true;
    var bundler = watchify(browserify('./src/index.js', watchify.args));
    bundler.on('update', rebundle);
    bundler.on('log', util.log.bind(util));
    function rebundle() {
        return bundler.bundle()
            .on('error', util.log)
            .pipe(source('bundle.js'))
            .pipe(buffer())
            .pipe(gulp.dest('./src'))
    }

    return rebundle();
}

// Standard handler
function standardHandler(err) {
    // Notification
    notifier.notify({message: 'Error: ' + err.message});
    // Log to console
    util.log(util.colors.red('Error'), err.message);
}

gulp.task('build', ['browserify', 'inlinesource']);
gulp.task('watch', ['watchify']);