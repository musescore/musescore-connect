var inlinesource = require('gulp-inline-source');
module.exports = function (gulp) {
    return function (){
        return gulp.src('./index.html')
            .pipe(inlinesource())
            .pipe(gulp.dest('./dist'));
    }
};
