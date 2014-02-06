module.exports = function ( grunt ){

  grunt.config("connect", {
    dev: {
      options: {
        port: '<%=ports.dev%>',
        hostname: "*",
        base: "<%=routemap.root.src%>",
//        keepalive: true,
        livereload: parseInt('<%=ports.livereload%>'),
        open: "http://<%=localIp%>:<%=ports.dev%>"
      }
    },
    pub: {
      options: {
        port: '<%=ports.pub%>',
        hostname: "*",
        base: "<%=routemap.root.dest%>",
        keepalive: true,
        open: "http://<%=localIp%>:<%=ports.pub%>"
      }
    },
    mail: {
      options: {
        port: '<%=ports.mail%>',
        hostname: "*",
        base: "mail/",
        keepalive: true,
        open: "http://<%=localIp%>:<%=ports.mail%>"
      }
    }
  })

  grunt.config("watch", {
    options: {
      spawn: false,
      interrupt: true
    },
    templates: {
      files: [
        "<%=res.pages%>*.{html,mustache}",
        "<%=res.partials%>**/*.{html,mustache}",
        "<%=res.helpers%>**/*.js",
        "<%=res.data%>**/*.json"
      ],
      tasks: ["render"]
    },
    modernizr: {
      files: [
        "<%=routemap.script.src%>**/*.js",
        "!<%=routemap.script.src%>{library|plugin|polyfill|module}/**/*"
      ],
      tasks: ["modernizr"]
    },
    style: {
      files: ["<%=res.style%>**/*.less"],
      tasks: ["less:dev", "newer:autoprefixer"]
    },
    livereload: {
      options: {livereload: parseInt('<%=ports.livereload%>')},
      files: [
        "<%=routemap.root.src%>*.html",
        "<%=routemap.image.src%>**/*.{jpg,jpeg,png,gif,svg}",
        "<%=routemap.css.src%>**/*.css",
        "<%=routemap.font.src%>**/*.{eot,svg,woff,ttf}",
        "<%=routemap.script.src%>**/*.js"
      ]
    }
  })

  /*
  * Runs when non-import style changes
  * */
  grunt.config("less.dev", {
    options: {
      cleancss: true,
      strictMath: true
    },
    expand: true,
    cwd: "<%=res.style%>",
    src: [
      "**/*.less",
      "!import/**/*"
    ],
    dest: "<%=gen.css%>",
    ext: ".css"
  })

  /*
  * Runs when css is generated from style
  * */
  grunt.config("autoprefixer.dev", {
    options: {
      browsers: [
        "last 10 Chrome versions",
        "last 3 ie versions",
        "last 10 ff versions",
        "last 10 Opera versions",
        "last 10 Safari versions",
        "last 3 iOS versions",
        "Android >= 2"
      ]
    },
    expand: true,
    cwd: "<%=gen.css%>",
    src: "**/*.css",
    dest: "<%=routemap.css.src%>"
  })

  /*
  * Runs when partial or template changes
  * */
  grunt.config("render", {
    options: {
      partials: ["<%=res.partials%>", "<%=routemap.template.src%>"],
      data: "<%=res.data%>",
      helpers: "<%=res.helpers%>"
    },
    pages: {
      expand: true,
      flatten: true,
      src: "<%=res.pages%>*.mustache",
      dest: "<%=routemap.root.src%>",
      ext: ".html"
    },
    mails: {
      expand: true,
      src: "mail/**/*.mustache",
      ext: ".html"
    }
  })


  /*
   * serve
   * */
  grunt.registerTask("serve", "", function(  ){
    grunt.event.once("connect.dev.listening", function() {
      // and let watch keep it alive
      grunt.task.run("watch")
    })
    // open server
    grunt.task.run("connect:dev")
  })

  /*
   * serve mails
   * */
  grunt.registerTask("servemail", "", function(  ){
    grunt.event.once("connect.mail.listening", function() {
      // and let watch keep it alive
      grunt.task.run("watch")
    })
    // open server
    grunt.task.run("connect:mail")
  })

  /*
   * public
   * */
  grunt.registerTask("public", "", function(  ){
    grunt.task.run("connect:pub")
  })

};