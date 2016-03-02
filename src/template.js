var h = require('virtual-dom/h');
var Cookies = require('js-cookie');
module.exports = function (item) {
    return h('a',
        {
            href: item.url.value,
            "onclick": function(){
                Cookies.set(item.id, item.id, { expires: item.ttl });
            }
        },
        [
        h('h3', item.title),
            h('img', {
                    src: item.image
                }
            ),
            h('div', item.description)]
    );
};