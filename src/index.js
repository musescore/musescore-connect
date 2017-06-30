var content = require('./generated/content_clean.json');
var featured = require('./generated/featured_clean.json');
var localisedContent = require('./generated/content_localised.json');
var Cookies = require('js-cookie');
var template = require('./template');
var mainLoop = require("main-loop");
var i18next = require('i18next');
var XHR = require('i18next-xhr-backend');
var h = require('virtual-dom/h');
var _ = {
    findKey: require("lodash.findkey"),
    merge: require("lodash.merge"),
    find: require("lodash.find"),
    map: require("lodash.map")
};

var languages = require("../translations/languageList.json");
var language = window.navigator.userLanguage || window.navigator.language;

language = language.replace('-', '_');

var lang = _.find(languages, function (lang) {
    return lang == language;
});

if (typeof lang == 'undefined') {
    lang = _.find(languages, function (lang) {
        return lang == language.substring(0, 2);
    });
}
if (typeof lang == 'undefined') {
    lang = _.find(languages, function (lang) {
        return lang.substring(0, 2) == language.substring(0, 2);
    });
}

// ignore en_US
var lang = lang == 'en_US' ? undefined : lang;
document.addEventListener("DOMContentLoaded", function () {
    var container = document.getElementById('container');
    var page = document.getElementById('page');
    i18next
        .use(XHR)
        .init({
            debug: false,
            load: 'currentOnly',
            lng: lang,
            preload: [lang],
            fallbackLng: undefined,
            backend: {
                loadPath: 'translations/{{lng}}.json'
            }
        }, function () {
            constructor(container, page, lang)
        });
});


var constructor = function (container, outerContainer, lang) {
    var items = [];
    var initState = _.findKey(featured, function (item) {
        return !Cookies.get(item.id);
    });
    /*
    if (localisedContent[lang]) {

        items = localisedContent[lang].content;
        items = _.map(items, function(item){
            item.localised = true;
            return item;
        });

        if (localisedContent[lang].appendContent) {
            items = items.concat(content, featured);
        }
    } else {
        items = content.concat(featured);
    }
    */
    if (!initState) {
        initState = 0;
    }
    var loopSpeed = 60000;
    var loop = mainLoop(initState, render, {
        create: require("virtual-dom/create-element"),
        diff: require("virtual-dom/diff"),
        patch: require("virtual-dom/patch")
    });

    var hovering = false;

    function render(index) {
        return h('div',
            [
                h('div.spotlight-title', 'Support MuseScore'),
                h('iframe',{
                    src:"https://www.kickstarter.com/projects/openscore/openscore-join-the-sheet-music-revolution/widget/card.html?v=2",
                    width:"185",
                    height:"420",
                    frameborder:"0",
                    scrolling:"no",
                    style:{
                        border: 'none'
                    }
                }),
                items.length > 1 ? h('div.navigation', [
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
                ]) : ''
            ])
    }

    function next() {
        var newState = parseInt(loop.state) + 1;
        if (newState >= items.length) {
            newState = 0;
        }
        loop.update(newState);
    }

    function prev() {
        var newState = parseInt(loop.state) - 1;

        if (newState < 0) {
            newState = items.length - 1;
        }
        loop.update(newState);
    }

    outerContainer.onmouseover = function (e) {
        hovering = true;
    };
    outerContainer.onmouseout = function (e) {
        hovering = false;
    };
    if(items.length > 1){
        //createInterval();
    }
    function createInterval() {
        setTimeout(function () {
            if (!hovering) {
                next();
            }
            window.requestAnimationFrame(createInterval)
        }, loopSpeed);
    }

    container.appendChild(loop.target);
};

