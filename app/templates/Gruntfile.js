module.exports = function ( grunt ){

  /*
  * load build config
  * */
  grunt.manifest = grunt.file.readJSON("manifest.json")

  /*
   * init config
   * */
  grunt.initConfig({
    clean: {
      build: {
        src: "<%=routes.root.dest%>**/*"
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