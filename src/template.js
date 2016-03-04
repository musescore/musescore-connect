var h = require('virtual-dom/h');
var Cookies = require('js-cookie');
module.exports = function (item) {
    console.log(item);
    var url = item.url.value;
    var description = item.description;
    var title = item.title;

    if(window.Transifex){
        if (item.url.localise) {
            url = Transifex.live.translateText(item.url.value);
        }
        description = Transifex.live.translateText(item.description);
        title = Transifex.live.translateText(item.title);
    }

    return h('a',
        {
            href: url,
            "onclick": function () {
                Cookies.set(item.id, item.id, {expires: item.ttl});
            }
        },
        [
            h('div.spotlight-title', title),
            h('img.spotlight-image', {
                    src: item.image
                }
            ),
            h('div.spotlight-body', description)]
    );
};