var h = require('virtual-dom/h');
var Cookies = require('js-cookie');
module.exports = function (item) {
    var url = item.url.value;
    var description = item.description;
    var title = item.title;

    if(Transifex){
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
            h('h3', title),
            h('img', {
                    src: item.image
                }
            ),
            h('div', description)]
    );
};