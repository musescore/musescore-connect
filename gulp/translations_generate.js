var _ = {
    forEach: require('lodash.foreach')
};
var Promise = require("bluebird");
var fs = require('fs');
var readFile = Promise.promisify(require("fs").readFile);
module.exports = function (gulp) {
    return function (){
        var translations = {};
        var reads = [];
        var outputFilename = './dist/translations.json';

        reads.push(readFile('./src/generated/featured_clean.json', 'utf8').then(
            function (data) {
                var obj = JSON.parse(data);
                _.forEach(obj, function (item) {
                    if (!item.nonTranslatable) {
                        translations[item.title] = item.title;
                        translations[item.description] = item.description;
                        if (item.url.localise) {
                            translations[item.url.value] = item.url.value;
                        }
                    }
                });
            }
        ));

        reads.push(readFile('./src/generated/content_clean.json', 'utf8').then(
            function (data) {
                var obj = JSON.parse(data);
                _.forEach(obj, function (item) {
                    if (!item.nonTranslatable) {
                        translations[item.title] = item.title;
                        translations[item.description] = item.description;
                        if (item.url.localise) {
                            translations[item.url.value] = item.url.value;
                        }
                    }
                });
            }
        ));

        return Promise.all(reads).then(function () {
            fs.writeFile(outputFilename, JSON.stringify(translations, null, 4), function (err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("JSON saved to " + outputFilename);
                }
            });
        });
    }
};