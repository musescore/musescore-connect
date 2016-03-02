var content = require('./config/content.json');

var Cookies = require('js-cookie');
console.log(Cookies.get('name'));
console.log(content);

var constructor = function(container){
    console.log(container);
};

window.connectApp = constructor;

