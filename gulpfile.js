var gulp = require('gulp');
var yargs = require('yargs');
var watchify = require('watchify');
var request = require('request');
var browserify = require('browserify');
var mkpath = require('mkpath');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var util = require('gulp-util');
var uglify = require('gulp-uglify');
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
gulp.task('clean', function () {
    rmDir('./src/generated');
    rmDir('./img');
    mkpath('./src/generated');
    mkpath('./img');
});
// Fonts
gulp.task('fonts', function () {
    return gulp.src(['src/fonts/*'])
        .pipe(gulp.dest('dist/fonts/'));
});

gulp.task('browserify', function () {
    return build('main', 'bundle');
});

gulp.task('featured', function () {
    var promises = [];
    var JsonDefer = Q.defer();
    var filename = 'src/generated/featured.json';
    var featured_clean = [];
    var uri = 'https://api.musescore.com/services/rest/score.json?featured=1&oauth_consumer_key=' + process.env.MUSESCORE_API_KEY;
    if (process.env.MUSESCORE_API_KEY) {
        request.head(uri, function (err, res, body) {
            request(uri).pipe(fs.createWriteStream(filename)).on('close', function () {
                var content = JSON.parse(fs.readFileSync(filename, 'utf8'));
                content = content.slice(0,10);
                _.forEach(content, function (score, index) {
                    var defer = Q.defer();
                    promises.push(defer.promise);
                    var cleanItem = {};
                    cleanItem.nonTranslatable = true;
                    cleanItem.id = score.id;
                    cleanItem.title = score.title;
                    cleanItem.url = {
                        value: score.permalink,
                        localise: false
                    };
                    cleanItem.description = '<a href="'+ score.user.custom_url +'">' + score.user.username + '</a>';
                    var imageUrl = 'https://s3.amazonaws.com/static.musescore.com/' + score.id + '/' + score.secret + '/score_0.png';
                    var n = imageUrl.lastIndexOf('.');
                    var d = imageUrl.lastIndexOf('/');
                    var ext = imageUrl.substring(n + 1);
                    var name = imageUrl.substring(d + 1, n);
                    var imageFilename = './img/' + score.id + '.' + ext;
                    download(imageUrl, imageFilename, function (buffer) {
                        lwip.open(imageFilename, ext, function (err, image) {
                            lwip.create(image.width(), image.height(), 'white', function (err, canvas) {
                                // paste original image on top of the canvas
                                canvas.paste(0, 0, image, function (err, image) {
                                    var width = 160;
                                    var height = 160 * image.height() / image.width();
                                    image.batch()
                                        .resize(width, height)
                                        .writeFile('./img/' + score.id + '_' + name + '_small.jpg', 'jpg', {quality: 75}, function (err) {
                                            cleanItem.image = 'img/' + score.id + '_' + name + '_small.jpg';
                                            featured_clean.push(cleanItem);
                                            defer.resolve();
                                        });
                                    fs.unlink(imageFilename);
                                });
                            });
                        });
                    });

                });
                Q.all(promises).then(function () {
                    var outputFilename = './src/generated/featured_clean.json';
                    fs.writeFile(outputFilename, JSON.stringify(featured_clean, null, 4), function (err) {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log("JSON saved to " + outputFilename);
                            JsonDefer.resolve();
                        }
                    });
                });

            });
        });
    }
    return JsonDefer.promise;


});
gulp.task('copy', function () {
    rmDir('./dist/img');
    return gulp.src(['./img/*'])
        .pipe(gulp.dest('./dist/img/'));
});
gulp.task('translations', function () {
    var translations = {};
    var outputFilename = './dist/translations.json';
    _.forEach(content, function (item, index) {
        translations[item.title] = item.title;
        translations[item.description] = item.description;
        if (item.url.localise) {
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

gulp.task('content', function () {
    var promises = [];
    var contentResizedImages = [];
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
                        var width = 160;
                        var height = 160 * image.height() / image.width();
                        image.batch()
                            .resize(width, height)
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
        var outputFilename = './src/generated/content_clean.json';
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
        'clean',
        'featured',
        'content',
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
