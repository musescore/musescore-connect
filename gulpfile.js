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
var runSequence = require('run-sequence');
var base64Img = require('base64-img');
var Q = require('q');
var content = require('./src/config/content.json');
var fs = require('fs');
var _ = {
    forEach: require('lodash.foreach')
};


gulp.task('inlinesource', function () {
    return gulp.src('./index.html')
        .pipe(inlinesource())
        .pipe(gulp.dest('./dist'));
});

gulp.task('browserify', function () {
    return build('main', 'bundle');
});

gulp.task('base64', function(){
    var promises = [];
    _.forEach(content, function (item) {
        var defer = Q.defer();
        base64Img.requestBase64(item.image, function (err, res, body) {
            item.imageBase64 = body;
            defer.resolve();
        });
        promises.push(defer.promise)
    });

    return Q.all(promises).then(function () {
        var outputFilename = './src/config/content_base64.json';
        fs.writeFile(outputFilename, JSON.stringify(content, null, 4), function(err) {
            if(err) {
                console.log(err);
            } else {
                console.log("JSON saved to " + outputFilename);
            }
        });
    });
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

gulp.task('build', function(callback) {
    runSequence(
        'base64',
        'browserify',
        'inlinesource',
        callback);
});

gulp.task('watch', ['watchify']);