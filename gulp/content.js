var buffer = require('vinyl-buffer');
var util = require('gulp-util');
var Q = require('q');
var Promise = require("bluebird");
var request = require("request");
var content = require('../src/config/content.json');
var fs = require('fs');
var lwip = require('lwip');
var _ = {
    forEach: require('lodash.foreach')
};

module.exports = function(gulp){
    return function () {
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
                                .writeFile('./img/' + name + '_small.jpg', 'jpg', {quality: 60}, function (err) {
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
    }
};

function download(uri, filename, callback) {
    request.head(uri, function (err, res, body) {
        request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
    });
}