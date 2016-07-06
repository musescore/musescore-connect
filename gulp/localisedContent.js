var buffer = require('vinyl-buffer');
var util = require('gulp-util');
var Promise = require("bluebird");
var fs = Promise.promisifyAll(require('fs'));
var readFile = Promise.promisify(require("fs").readFile);
var request = require("request");
var lwip = require('lwip');
var _ = {
    forEach: require('lodash.foreach')
};

module.exports = function (gulp) {
    return function () {
        var promises = [];
        var content = {};
        return new Promise(function (resolve) {
            fs.readdir('./src/config/localised_content', function (err, files) {
                _.forEach(files, function (file) {
                    promises.push(get(file, function (data) {
                        content[data.id] = data;
                    }));
                });
                Promise.all(promises).then(function () {
                    var outputFilename = './src/generated/content_localised.json';
                    fs.writeFile(outputFilename, JSON.stringify(content, null, 4), function (err) {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log("JSON saved to " + outputFilename);
                            resolve();
                        }
                    });
                });
            });


        })
    }
};
function guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

function get(file, cb) {
    var files = [];
    var data = {};
    var contentResizedImages = [];
    return readFile('./src/config/localised_content/' + file, 'utf8')
        .then(function (result) {
            data = JSON.parse(result);
        })
        .then(function () {
            _.forEach(data.content, function (item, index) {
                files.push(new Promise(function (resolve) {
                    var n = item.image.lastIndexOf('.');
                    var d = item.image.lastIndexOf('/');
                    var ext = item.image.substring(n + 1);
                    var name = item.image.substring(d + 1, n);
                    var filename = './img' + item.id + guid() + '.' + ext;
                    download(item.image, filename, function (buffer) {
                        lwip.open(filename, ext, function (err, image) {
                            lwip.create(image.width(), image.height(), 'white', function (err, canvas) {
                                // paste original image on top of the canvas
                                canvas.paste(0, 0, image, function (err, image) {
                                    // now image has a white background...
                                    var width = 145;
                                    var height = 145 * image.height() / image.width();
                                    image.batch()
                                        .resize(width, height)
                                        .writeFile('./img/' + name + '_small.jpg', 'jpg', {quality: 65}, function (err) {
                                            item.image = 'img/' + name + '_small.jpg';
                                            contentResizedImages[index] = item;
                                            resolve();
                                        });
                                    fs.unlink(filename);
                                });
                            });
                        });
                    });
                }));
            });
        }).then(function(){
            return Promise.all(files).then(function () {
                data.content = contentResizedImages;
                cb(data);
            });
        });
}

function download(uri, filename, callback) {
    request.head(uri, function (err, res, body) {
        request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
    });
}