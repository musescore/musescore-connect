var base64Img = require('base64-img');
var Q = require('q');
var content = require('./src/config/content.json');
var fs = require('fs');
var _ = {
    forEach: require('lodash.foreach')
};
var promises = [];
_.forEach(content, function (item) {
    var defer = Q.defer();
    base64Img.requestBase64(item.image, function (err, res, body) {
        item.imageBase64 = body;
        defer.resolve();
    });
    promises.push(defer.promise)
});

Q.all(promises).then(function () {
    var outputFilename = './src/config/content_base64.json';
    fs.writeFile(outputFilename, JSON.stringify(content, null, 4), function(err) {
        if(err) {
            console.log(err);
        } else {
            console.log("JSON saved to " + outputFilename);
        }
    });
});