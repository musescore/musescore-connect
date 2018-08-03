var h = require('virtual-dom/h')
var VNode = require('virtual-dom/vnode/vnode')
var VText = require('virtual-dom/vnode/vtext')
var qs = require('querystringify');

var convertHTML = require('html-to-vdom')({
  VNode: VNode,
  VText: VText
})
var Cookies = require('js-cookie')

module.exports = function (item, i18next) {
  var url = item.url.value
  var description = item.description
  var title = item.title
  var length = 50
  if (!item.localised) {
    if (item.url.localise) {
      url = i18next.t(item.url.value.replace(/[^a-z0-9 ]/gi, '').replace(/[ ]/g, '_').toLowerCase(), {defaultValue: item.url.value})
    }
    description = i18next.t(item.description.replace(/[^a-z0-9 ]/gi, '').replace(/[ ]/g, '_').toLowerCase(), {defaultValue: item.description})
    title = i18next.t(item.title.replace(/[^a-z0-9 ]/gi, '').replace(/[ ]/g, '_').toLowerCase(), {defaultValue: item.title})
  }

  description = description ? convertHTML(description) : ''
  title = title.length > length ? title.substring(0, length) + '...' : title.substring(0, length)
  var split = url.split("?")
  var parsed = {};
  if(split[1]){
    parsed = qs.parse(split[1]);
  }
  parsed.utm_source="connect";
  parsed.utm_medium="editor";
  parsed.utm_campaign="connect";
  url = split[0]+qs.stringify(parsed, true);
  return h('div.content',
    [
      h('a', {
        href: url,
        'onclick': function () {
          ga('send', 'event', 'outbound', 'click', url, {
            'transport': 'beacon'
          })
          Cookies.set(item.id, item.id, {expires: item.ttl})
        }
      }, [
        h('div.spotlight-title', title),
        h('div.spotlight-image', h('img.', {src: item.image}))
      ]),
      h('div.spotlight-body', description)
    ]
  )
}