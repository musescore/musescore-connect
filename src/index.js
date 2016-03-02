var content = require('./config/content_base64.json');
var Cookies = require('js-cookie');
var createElement = require('virtual-dom/create-element');
var template = require('./template');
var mainLoop = require("main-loop");
var h = require('virtual-dom/h');
console.log(Cookies.get('name'));

var constructor = function (container) {
    var initState = 0;

    var loop = mainLoop(initState, render, {
        create: require("virtual-dom/create-element"),
        diff: require("virtual-dom/diff"),
        patch: require("virtual-dom/patch")
    });

    function render(index) {
        return h('div', [
            template(content[index]),
            h('div.navigation', [
                h('span', {
                    "onclick": function () {
                        next();
                    }
                }, 'next'),
                h('span', {
                    "onclick": function () {
                        prev();
                    }
                }, 'prev')
            ])
        ])
    }

    function next() {
        var newState = loop.state + 1;
        if (newState >= content.length) {
            newState = 0;
        }
        loop.update(newState);
    }

    function prev() {
        var newState = loop.state - 1;

        if (newState < 0) {
            newState = content.length - 1;
        }

        loop.update(newState);
    }

    container.appendChild(loop.target);

};

window.connectApp = constructor;

