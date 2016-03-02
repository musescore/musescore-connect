var content = require('./config/content.json');
var Cookies = require('js-cookie');
var createElement = require('virtual-dom/create-element');
var template = require('./template');
var mainLoop = require("main-loop");
var h = require('virtual-dom/h');
var _ = {
    findKey: require("lodash.findkey")
};


var constructor = function (container, outerContainer) {

    var initState = _.findKey(content, function (item) {
        return !Cookies.get(item.id);
    });

    var loopSpeed = 5000;
    var loop = mainLoop(initState, render, {
        create: require("virtual-dom/create-element"),
        diff: require("virtual-dom/diff"),
        patch: require("virtual-dom/patch")
    });

    var hovering = false;

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

    outerContainer.onmouseover = function (e) {
        hovering = true;
    };
    outerContainer.onmouseout = function (e) {
        hovering = false;
    };
    var interval = setInterval(function () {
        if (!hovering) {
            next();
        }
    }, loopSpeed);

    container.appendChild(loop.target);

};

window.connectApp = constructor;

