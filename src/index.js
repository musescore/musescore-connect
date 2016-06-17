var content = require('./generated/content_clean.json');
var featured = require('./generated/featured_clean.json');
var Cookies = require('js-cookie');
var template = require('./template');
var mainLoop = require("main-loop");
var i18next = require('i18next');
var XHR = require('i18next-xhr-backend');
var h = require('virtual-dom/h');
var _ = {
    findKey: require("lodash.findkey"),
    merge: require("lodash.merge")
};
var language = window.navigator.userLanguage || window.navigator.language;
language = language.replace('-', '_');

document.addEventListener("DOMContentLoaded", function () {
    var container = document.getElementById('container');
    var page = document.getElementById('page');

    i18next
        .use(XHR)
        .init({
            debug: false,
            load: 'currentOnly',
            lng: language,
            preload: [language],
            fallbackLng: undefined,
            backend: {
                loadPath: 'translations/{{lng}}.json'
            }
        }, function () {
            constructor(container, page)
        });
});


var constructor = function (container, outerContainer) {

    var initState = _.findKey(featured, function (item) {
        return !Cookies.get(item.id);
    });

    var items = content.concat(featured);
    if (!initState) {
        initState = 0;
    }
    var loopSpeed = 10000;
    var interval;
    var loop = mainLoop(initState, render, {
        create: require("virtual-dom/create-element"),
        diff: require("virtual-dom/diff"),
        patch: require("virtual-dom/patch")
    });

    var hovering = false;

    function render(index) {
        return h('div',
            [
                template(items[index], i18next),
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
        if (newState >= items.length) {
            newState = 0;
        }
        loop.update(newState);
        createInterval();
    }

    function prev() {
        var newState = parseInt(loop.state) - 1;

        if (newState < 0) {
            newState = items.length - 1;
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
    function createInterval() {
        clearInterval(interval);
        interval = setInterval(function () {
            if (!hovering) {
                next();
            }
        }, loopSpeed);
    }

    container.appendChild(loop.target);
};

