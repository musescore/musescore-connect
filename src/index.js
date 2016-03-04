var content = require('./config/content_resized.json');
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
    var AfterRender = function () {
    };
    AfterRender.prototype.hook = function (node) {

    };
    if (!initState) {
        initState = 0;
    }
    var loopSpeed = 5000;
    var interval;
    var loop = mainLoop(initState, render, {
        create: require("virtual-dom/create-element"),
        diff: require("virtual-dom/diff"),
        patch: require("virtual-dom/patch")
    });

    var hovering = false;

    function render(index) {
        console.log(content);
        console.log(index);
        return h('div',
            {
                afterRender: new AfterRender()
            },
            [
                template(content[index]),
                h('div.navigation', [
                    h('span.prev', {
                        "onclick": function () {
                            prev();
                        }
                    }, h('span.icon-keyboard_arrow_left', {})),
                    h('span.next', {
                        "onclick": function () {
                            next();
                        }
                    }, h('span.icon-navigate_next', {}))
                ])
            ])
    }

    function next() {
        var newState = parseInt(loop.state) + 1;
        if (newState >= content.length) {
            newState = 0;
        }
        loop.update(newState);
        createInterval();
    }

    function prev() {
        var newState = parseInt(loop.state) - 1;

        if (newState < 0) {
            newState = content.length - 1;
        }
        loop.update(newState);
        createInterval();
    }

    outerContainer.onmouseover = function (e) {
        hovering = true;
    };
    outerContainer.onmouseout = function (e) {
        hovering = false;
    };
    createInterval();
    function createInterval(){
        clearInterval(interval);
        interval = setInterval(function () {
            if (!hovering) {
                next();
            }
        }, loopSpeed);
    }


    container.appendChild(loop.target);

};

window.connectApp = constructor;

