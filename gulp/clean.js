var fs = require('fs-extra');
module.exports = function (gulp) {
    return function () {
        fs.emptyDir('./dist/fonts');
        fs.emptyDir('./dist/img');
        fs.emptyDir('./dist/translations');
        fs.emptyDir('./src/generated');
        fs.emptyDir('./translations');
        fs.emptyDir('./img');
    }
};