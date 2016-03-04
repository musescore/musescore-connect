var gulp = require('gulp');
var watchify = require('watchify');
var request = require('request');
var browserify = require('browserify');
var mkpath = require('mkpath');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var notifier = require('node-notifier');
var util = require('gulp-util');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var inlinesource = require('gulp-inline-source');
var runSequence = require('run-sequence');
var Q = require('q');
var content = require('./src/config/content.json');
var fs = require('fs');
var lwip = require('lwip');
var _ = {
    forEach: require('lodash.foreach')
};


gulp.task('inlinesource', function () {
    return gulp.src('./index.html')
        .pipe(inlinesource())
        .pipe(gulp.dest('./dist'));
});
// Fonts
gulp.task('fonts', function() {
    return gulp.src(['src/fonts/*'])
        .pipe(gulp.dest('dist/fonts/'));
});

gulp.task('browserify', function () {
    return build('main', 'bundle');
});

gulp.task('copy', function () {
    rmDir('./dist/img');
    return gulp.src(['./img/*'])
        .pipe(gulp.dest('./dist/img/'));
});

gulp.task('translations', function(){
    var translations = {};
    var outputFilename = './dist/translations.json';
    _.forEach(content, function (item, index) {
        translations[item.title] = item.title;
        translations[item.description] = item.description;
        if(item.url.localise){
            translations[item.url.value] = item.url.value;
        }
    });
    fs.writeFile(outputFilename, JSON.stringify(translations, null, 4), function (err) {
        if (err) {
            console.log(err);
        } else {
            console.log("JSON saved to " + outputFilename);
        }
    });
});

gulp.task('resize', function () {
    var promises = [];
    var contentResizedImages = [];
    rmDir('./img');
    mkpath('./img');
    _.forEach(content, function (item, index) {
        var defer = Q.defer();
        var n = item.image.lastIndexOf('.');
        var d = item.image.lastIndexOf('/');
        var ext = item.image.substring(n + 1);
        var name = item.image.substring(d + 1, n);
        var filename = './img' + item.id + '.' + ext;

        download(item.image, filename, function (buffer) {
            lwip.open(filename, ext, function (err, image) {
                lwip.create(image.width(), image.height(), 'white', function (err, canvas) {
                    // paste original image on top of the canvas
                    canvas.paste(0, 0, image, function (err, image) {
                        // now image has a white background...
                        image.batch()
                            .resize(160)
                            .writeFile('./img/' + name + '_small.jpg', 'jpg', {quality: 75}, function (err) {
                                item.image = 'img/' + name + '_small.jpg';
                                contentResizedImages[index] = item;
                                defer.resolve();
                            });
                        fs.unlink(filename);
                    });
                });
            });
        });
        promises.push(defer.promise)
    });

    return Q.all(promises).then(function () {
        var outputFilename = './src/config/content_resized.json';
        fs.writeFile(outputFilename, JSON.stringify(contentResizedImages, null, 4), function (err) {
            if (err) {
                console.log(err);
            } else {
                console.log("JSON saved to " + outputFilename);
            }
        });
    });
});

gulp.task('watchify', function () {
    return bundle('main', 'bundle')
});



gulp.task('build', function (callback) {
    runSequence(
        'resize',
        'copy',
        'browserify',
        'inlinesource',
        'translations',
        'fonts',
        callback);
});

gulp.task('watch', ['watchify']);

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

function bundle() {
    watchify.args.debug = true;
    watchify.args.fullPaths = false;
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

function download(uri, filename, callback) {
    request.head(uri, function (err, res, body) {
        request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
    });
}

function rmDir(dirPath) {
    try {
        var files = fs.readdirSync(dirPath);
    }
    catch (e) {
        return;
    }
    if (files.length > 0)
        for (var i = 0; i < files.length; i++) {
            var filePath = dirPath + '/' + files[i];
            if (fs.statSync(filePath).isFile())
                fs.unlinkSync(filePath);
            else
                rmDir(filePath);
        }
    fs.rmdirSync(dirPath);
}