module.exports = function ( grunt ){

  /*
  * load build config
  * */
  grunt.mailsettings = grunt.file.readJSON("<%=mailsettingsPath%>")

  /*
   * init config
   * */
  grunt.initConfig({
    clean: {
      build: {
        src: "<%=routemap.root.dest%>**/*"
      },
      gen: {
        src: [
          "<%=gen.root%>newer",
          "<%=gen.css%>"
        ]
      }
    },
    newer: {options: {cache: "<%=gen.root%>newer"}}
  })

  /*
   * load tasks
   * */
  require('load-grunt-tasks')(grunt)
  grunt.loadTasks("tasks")

  /*
  * default
  * */

  grunt.registerTask("default", "", function(  ){
    console.log("Grunt~~")
  })

};