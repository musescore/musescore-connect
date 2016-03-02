var h = require('virtual-dom/h');
module.exports = function (item) {
    return h('a',
        {
            href: item.url.value
        },
        [
        h('h3', item.title),
            h('img', {
                    src: item.imageBase64
                }
            ),
            h('div', item.description)]
    );
};