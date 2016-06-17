var buffer = require('vinyl-buffer');
var browserify = require('browserify');
var watchify = require('watchify');
var util = require('gulp-util');
var source = require('vinyl-source-stream');
module.exports = function (gulp) {
    return function (){
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
};