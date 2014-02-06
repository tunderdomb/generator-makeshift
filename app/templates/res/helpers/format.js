module.exports = function( context ){
  context.example = function(  ){
    return function (text, render) {
      return "" + render(text) + "";
    }
  }
}