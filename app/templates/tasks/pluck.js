module.exports = function ( grunt ){

  grunt.registerMultiTask("pluck", "", function( runType ){
    var path = require('path')
    this.files.forEach(function(filePair) {
      filePair.src.forEach(function(src) {
        if (!grunt.file.exists(src)) {
          return
        }
        var dest = filePair.dest.replace(path.extname(src), ".css")
          , classes = []
          , ids = []
          , hash = {}
          , css
        function pluck(  ){
          grunt.file.read(src).replace(/class\s*=\s*"([^"]+)"/g, function( match, cls ){
            cls.trim().split(/\s+/).forEach(function( cls ){
              if ( /^-?[_a-zA-Z]+[_a-zA-Z0-9-]*/.test(cls) ) {
                if ( !hash[cls] ) {
                  classes.push("."+cls+"{}")
                }
                hash[cls] = true
              }
            })
            return match
          }).replace(/id\s*=\s*"([^"]+)"/g, function( match, id ){
            ids.push("#"+id+"{}")
            return match
          })

          return ids.join("\n")
            +"\n"
            +classes.join("\n")
        }
        css = pluck()
        if ( classes.length || ids.length ) {
          grunt.file.write(dest, css)
          console.log("Plucked "+classes.length+" classes and "+ids.length+" ids from '"+src+"'")
        }
      })
    })
  })

};