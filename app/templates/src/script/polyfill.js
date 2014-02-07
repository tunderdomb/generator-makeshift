var polyfill = (function( loaded, listeners ){
  Modernizr.load([{
    test: Modernizr.dataset || Modernizr.dom_dataset,
    nope: "<%=routes.polyfill.srcUrl%>dataset.js"
  }, {
    test: Modernizr.classlist || Modernizr.dom_classlist,
    nope: "<%=routes.polyfill.srcUrl%>classlist.js"
  }, {
    test: Modernizr.placeholder || Modernizr.forms_placeholder,
    nope: "<%=routes.polyfill.srcUrl%>placeholder.js"
  }, {
    test:  !!(document.querySelector || document.querySelectorAll),
    nope: "<%=routes.polyfill.srcUrl%>queryselectorall.js"
  }, {
    test: !!(String.prototype.trim),
    nope: "<%=routes.polyfill.srcUrl%>trim.js"
  }, {
    test: (Array.prototype.pop
      && Array.prototype.push
      && Array.prototype.reverse
      && Array.prototype.shift
      && Array.prototype.sort
      && Array.prototype.splice
      && Array.prototype.unshift
      && Array.prototype.concat
      && Array.prototype.join
      && Array.prototype.slice
      && Array.prototype.indexOf
      && Array.prototype.lastIndexOf
      && Array.prototype.forEach
      && Array.prototype.every
      && Array.prototype.some
      && Array.prototype.filter
      && Array.prototype.map
      && Array.prototype.reduce
      && Array.prototype.reduceRight
      && Array.isArray),
    nope: "<%=routes.polyfill.srcUrl%>array.generics.min.js"
  }, {
    test: !!(Function.prototype.bind),
    nope: "<%=routes.polyfill.srcUrl%>bind.js"
  }, {
    test: !!(Date.prototype.toISOString),
    nope: "<%=routes.polyfill.srcUrl%>toisostring.js"
  }, {
    test: !!(Object.keys),
    nope: "<%=routes.polyfill.srcUrl%>keys.js"
  }, {
    test: !!(Date.now),
    nope: "<%=routes.polyfill.srcUrl%>now.js"
  }, {
    test: !!(Date.parse),
    nope: "<%=routes.polyfill.srcUrl%>dateparse.js"
  }, {
    test: !!(window.localStorage),
    nope: "<%=routes.polyfill.srcUrl%>storage.js"
  }, {
    test: !!(window.XMLHttpRequest),
    nope: "<%=routes.polyfill.srcUrl%>xhr.js"
  }, {
    test:  !!(window.JSON),
    nope: "<%=routes.polyfill.srcUrl%>json.js"
  }, {
    test:  !!(window.requestAnimationFrame),
    nope: "<%=routes.polyfill.srcUrl%>requestanimationframe.js"
  }, {
    test:  "onhashchange" in window,
    nope: "<%=routes.polyfill.srcUrl%>hashchange.js"
  }, {
    test:  !!(window.EventSource),
    nope: "<%=routes.polyfill.srcUrl%>eventsource.js"
  }, {
    test:  !!(Object.getPrototypeOf),
    nope: "<%=routes.polyfill.srcUrl%>getprototypeof.js"
  }, {
    complete: function(  ){
      loaded = true
      while(listeners.length && listeners.shift()());
    }
  }])
  return function( listener ){
    if( loaded ) listener()
    else listeners.push(listener)
  }
}(false, []));