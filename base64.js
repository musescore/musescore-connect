var base64Img = require('base64-img');
var content = require('./src/config/content.json');
var fs = require('fs');


var data = _.map(content, function (panel) {
    panel.panes = panesMap(panel.panes);
    return panel;
});