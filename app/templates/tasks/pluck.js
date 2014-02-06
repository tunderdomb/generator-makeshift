module.exports = function ( grunt ){

  grunt.registerMultiTask("pluck", "", function( runType ){
    var path = require('path')
    this.files.forEach(function(filePair) {
      filePair.src.forEach(function(src) {
        console.log(src)
        if (!grunt.file.exists(src)) {
          return
        }
        var dest = filePair.dest+path.basename(src).replace(path.extname(src), ".css")
        grunt.file.write(dest, function(  ){
          var classes = []
            , hash = {}
          grunt.file.read(src).replace(/class="([^"]+)"/g, function( match, cls ){
            cls.trim().split(/\s+/).forEach(function( cls ){
              if ( /^-?[_a-zA-Z]+[_a-zA-Z0-9-]*/.test(cls) ) {
                if ( !hash[cls] ) {
                  classes.push("."+cls+"{}")
                }
                hash[cls] = true
              }
            })
            return match
          })
          return classes.join("\n")
        })
        console.log("Plucked : "+src + " to "+filePair.dest)
      })
    })
  })

};