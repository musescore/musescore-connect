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
    return function(){
        var promises = [];
        var JsonDefer = Q.defer();
        var filename = 'src/generated/featured.json';
        var featured_clean = [];
        var timestamp = new Date().getTime();
        var uri = 'https://api.musescore.com/services/rest/score.json?featured=1&no_cache=' + timestamp + '&oauth_consumer_key=' + process.env.MUSESCORE_API_KEY;
        if (process.env.MUSESCORE_API_KEY) {
            request.head(uri, function (err, res, body) {
                request(uri).pipe(fs.createWriteStream(filename)).on('close', function () {
                    var content = JSON.parse(fs.readFileSync(filename, 'utf8'));
                    content = content.slice(0, 10);
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
                        cleanItem.description = '<a href="' + score.user.custom_url + '">' + score.user.username + '</a>';
                        var imageUrl = 'https://s3.amazonaws.com/static.musescore.com/' + score.id + '/' + score.secret + '/score_0.png';
                        var n = imageUrl.lastIndexOf('.');
                        var d = imageUrl.lastIndexOf('/');
                        var ext = imageUrl.substring(n + 1);
                        var name = imageUrl.substring(d + 1, n);
                        var imageFilename = './img/' + score.id + '.' + ext;
                        download(imageUrl, imageFilename, function (buffer) {
                            lwip.open(imageFilename, ext, function (err, image) {
                                if (image) {
                                    lwip.create(image.width(), image.height(), 'white', function (err, canvas) {
                                        // paste original image on top of the canvas
                                        canvas.paste(0, 0, image, function (err, image) {
                                            var width = 140;
                                            var height = 140 * image.height() / image.width();
                                            image.batch()
                                                .resize(width, height)
                                                .writeFile('./img/' + score.id + '_' + name + '_small.jpg', 'jpg', {quality: 65}, function (err) {
                                                    cleanItem.image = 'img/' + score.id + '_' + name + '_small.jpg';
                                                    featured_clean.push(cleanItem);
                                                    defer.resolve();
                                                });
                                            fs.unlink(imageFilename);
                                        });
                                    });
                                } else {
                                    defer.resolve();
                                }
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
    }

};

function download(uri, filename, callback) {
    request.head(uri, function (err, res, body) {
        request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
    });
}