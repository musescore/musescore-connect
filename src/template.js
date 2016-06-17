var h = require('virtual-dom/h');
var VNode = require('virtual-dom/vnode/vnode');
var VText = require('virtual-dom/vnode/vtext');

var convertHTML = require('html-to-vdom')({
    VNode: VNode,
    VText: VText
});
var Cookies = require('js-cookie');

module.exports = function (item, i18next) {
    var url = item.url.value;
    var length = 50;
    if (item.url.localise) {
        url = i18next.t(item.url.value.replace(/[^a-z0-9 ]/gi, '').replace(/[ ]/g, '_').toLowerCase(), {defaultValue: item.url.value});
    }
    var description = i18next.t(item.description.replace(/[^a-z0-9 ]/gi, '').replace(/[ ]/g, '_').toLowerCase(), {defaultValue: item.description});
    var title = i18next.t(item.title.replace(/[^a-z0-9 ]/gi, '').replace(/[ ]/g, '_').toLowerCase(), {defaultValue: item.title});

    description = description ? convertHTML(description) : '';
    title = title.length > length ? title.substring(0, length) + '...' : title.substring(0, length);

    return h('div.content',
        [
            h('a', {
                href: url,
                "onclick": function () {
                    Cookies.set(item.id, item.id, {expires: item.ttl});
                }
            }, [
                h('div.spotlight-title', title),
                h('div.spotlight-image', h('img.', {src: item.image}))
            ]),
            h('div.spotlight-body', description)
        ]
    );
};