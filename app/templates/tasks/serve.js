module.exports = function ( grunt ){

  grunt.config("connect", {
    dev: {
      options: {
        port: '<%=ports.dev%>',
        hostname: "*",
        base: "<%=routes.root.src%>",
//        keepalive: true,
        livereload: parseInt('<%=ports.livereload%>'),
        open: "http://<%=localIp%>:<%=ports.dev%>"
      }
    },
    pub: {
      options: {
        port: '<%=ports.pub%>',
        hostname: "*",
        base: "<%=routes.root.dest%>",
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
      options: {livereload: parseInt('<%=ports.livereload%>')},
      files: [
        "<%=res.pages%>*.{html,mustache}",
        "<%=res.partials%>**/*.{html,mustache}",
        "<%=res.helpers%>**/*.js",
        "<%=res.data%>**/*.json"
      ],
      tasks: ["render"]
    },
    pluck: {
      files: [
        "<%=res.pages%>*.{html,mustache}",
        "<%=res.partials%>**/*.{html,mustache}",
        "<%=routes.template.src%>*.{html,mustache}"
      ],
      tasks: ["newer:pluck"]
    },
    modernizr: {
      files: [
        "<%=routes.script.src%>**/*.js",
        "!<%=routes.script.src%>{library|plugin|polyfill|module}/**/*"
      ],
      tasks: ["modernizr"]
    },
    style: {
      options: {livereload: parseInt('<%=ports.livereload%>')},
      files: ["<%=res.style%>**/*.less"],
      tasks: ["style"]
    },
    livereload: {
      options: {livereload: parseInt('<%=ports.livereload%>')},
      files: [
//        "<%=routes.root.src%>*.html",
        "<%=routes.image.src%>**/*.{jpg,jpeg,png,gif,svg}",
//        "<%=routes.css.src%>**/*.css",
        "<%=routes.font.src%>**/*.{eot,svg,woff,ttf}",
        "<%=routes.script.src%>**/*.js"
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
    dest: "<%=routes.css.src%>",
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
    cwd: "<%=routes.css.src%>",
    src: "**/*.css",
    dest: "<%=routes.css.src%>"
  })

  /*
  * Runs when template or page is modified
  * */
  grunt.config("pluck", {
    dev: {
      expand: true,
      flatten: true,
      src:[
        "<%=res.pages%>*.{html,mustache}",
        "<%=res.partials%>**/*.{html,mustache}",
        "<%=routes.template.src%>*.{html,mustache}"
      ],
      dest: "<%=gen.root%>css/"
    }
  })

  /*
  * Runs when partial or template changes
  * */
  grunt.config("render", {
    options: {
      partials: ["<%=res.partials%>", "<%=routes.template.src%>"],
      data: "<%=res.data%>",
      helpers: "<%=res.helpers%>"
    },
    pages: {
      expand: true,
      flatten: true,
      src: "<%=res.pages%>*.mustache",
      dest: "<%=routes.root.src%>",
      ext: ".html"
    },
    mails: {
      expand: true,
      src: "mail/**/*.mustache",
      ext: ".html"
    }
  })

  /*
   * style
   * */
  grunt.registerTask("style", "", function(  ){
    grunt.task.run("less:dev")
    grunt.task.run("newer:autoprefixer:dev")
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
    grunt.task.run("render")
    grunt.task.run("modernizr")
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