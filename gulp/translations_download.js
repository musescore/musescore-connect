var _ = {
    forEach: require('lodash.foreach')
};
var Transifex = require("transifex");
var transifex = new Transifex({
    project_slug: "musescore",
    credential: process.env.TRANSIFEX_USER + ":" + process.env.TRANSIFEX_PASSWORD
});

var Promise = require("bluebird");
var fs = Promise.promisifyAll(require('fs'));

module.exports = function (gulp) {
    return function () {
        return new Promise(function (resolve) {
            var files = [];
            //Without new Promise, this throwing will throw an actual exception
            transifex.projectInstanceMethods("musescore", function (err, data) {
                fs.writeFile('translations/languageList.json', JSON.stringify(data.teams, null, 4));

                _.forEach(data.teams, function (lang) {
                    files.push(new Promise(function (resolve) {
                        transifex.translationStringsMethod("musescore", "start-center", lang, function (err, data) {
                            var cleanData = {};
                            _.forEach(JSON.parse(data), function (item) {
                                cleanData[item.source_string.replace(/[^a-z0-9 ]/gi, '').replace(/[ ]/g, '_').toLowerCase()] = item.translation.length == 0 ? item.source_string : item.translation;
                            });

                            fs.writeFile('translations/' + lang + '.json', JSON.stringify(cleanData, null, 4), function (err) {
                                    if (err) {
                                        console.log(err);
                                    } else {
                                        resolve();
                                    }
                                }
                            );
                        });
                    }));
                });
                Promise.all(files).then(resolve);
            });
        });
    }
};
