var uglify = require('gulp-uglify');
var buffer = require('vinyl-buffer');
var browserify = require('browserify');
var util = require('gulp-util');
var source = require('vinyl-source-stream');

module.exports = function (gulp) {
    return function (){
        var bundler = browserify('./src/index.js', {fullPaths: false});
        bundler.on('log', util.log.bind(util));
        return bundler.bundle()
            .on('error', util.log)
            .pipe(source('bundle.js'))
            .pipe(buffer())
            .pipe(uglify())
            .pipe(gulp.dest('./src'));
    }
};