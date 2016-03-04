var h = require('virtual-dom/h');
var VNode = require('virtual-dom/vnode/vnode');
var VText = require('virtual-dom/vnode/vtext');

var convertHTML = require('html-to-vdom')({
    VNode: VNode,
    VText: VText
});
var Cookies = require('js-cookie');
module.exports = function (item) {
    var url = item.url.value;
    var description = item.description;
    var title = item.title;
    console.log(item.nonTranslatable);
    if (window.Transifex && !item.nonTranslatable) {

        if (item.url.localise) {
            url = Transifex.live.translateText(item.url.value);
        }
        description = Transifex.live.translateText(item.description);
        title = Transifex.live.translateText(item.title);
    }
    return h('a.content',
        {
            href: url,
            "onclick": function () {
                Cookies.set(item.id, item.id, {expires: item.ttl});
            }
        },
        [
            h('div.spotlight-title', title),
            h('div.spotlight-image', h('img.', {
                    src: item.image
                }
            )),
            h('div.spotlight-body', convertHTML(description))]
    );
};