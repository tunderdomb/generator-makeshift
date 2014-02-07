(function( f ){
  polyfill(function(  ){
    f(window, document, {}.undefined)
    window.dispatchEvent(new Event('clientScriptReady'))
  })
}(function( win, doc, undefined ){

}));