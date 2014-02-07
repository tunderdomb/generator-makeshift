
var path = require("path")

module.exports = function ( grunt ){

  grunt.copyLayout = function( src, dest, layout, name, process ){
    layout = src+layout
    name += path.extname(layout)
    if ( grunt.file.exists(layout) ) {
      layout = grunt.file.read(layout)
      if ( process ) {
        layout = process(layout)
      }
      grunt.file.write(dest+name, layout)
    }
    else {
      console.warn("Cannot generate from: ", layout)
    }
  }

  /*
   * makepage
   * */
  grunt.registerTask("makepage", "", function( layout, pageName ){
    if ( !pageName ) {
      pageName = layout
      if ( !pageName ) throw new Error("Missing page name")
      layout = "default"
    }
    layout += ".mustache"
    grunt.copyLayout("<%=gen.page%>", "<%=res.pages%>", layout, pageName)
    grunt.task.run("render")
    console.log("Generated page '<%=res.pages%>"+pageName+"'")
  })

  /*
   * makejs
   * */
  grunt.registerTask("makejs", "", function( layout, scriptName ){
    if ( !scriptName ) {
      scriptName = layout
      if ( !scriptName ) throw new Error("Missing script name")
      layout = "default"
    }
    layout += ".js"
    grunt.copyLayout("<%=gen.script%>", "<%=routes.script.src%>", layout, scriptName)
    console.log("Generated script '<%=routes.script.src%>"+scriptName+"'")
  })

  /*
  * makemail
  * */
  grunt.registerTask("makemail", "", function( layout, mailDirName ){
    if ( !mailDirName ) {
      mailDirName = layout
      if ( !mailDirName ) throw new Error("Missing directory name")
      layout = "boilerplate"
    }
    layout += ".mustache"
    grunt.copyLayout("<%=gen.mail%>", "mail/"+mailDirName+"/", layout, "index")
    grunt.task.run("render")
    console.log("Generated mail 'mail/"+mailDirName+"'")
  })

  /*
  * makeless
  * */
  grunt.registerTask("makeless", "", function( name ){
    if ( !name ) throw new Error("Missing style name")
    grunt.copyLayout("gen/less.less", "<%=res.style%>", "less.less", name)
    grunt.task.run("style")
    console.log("Generated style '<%=res.style%>"+name+"'")
  })

};