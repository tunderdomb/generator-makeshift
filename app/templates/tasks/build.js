module.exports = function ( grunt ){

  function replaceAttribute( content, tag, attr, search, replace ){
    tag = new RegExp("<"+tag+"([^>]+)>", 'g')
    attr = new RegExp("("+attr+')="([^"]+)"')
    return content.replace(tag, function( match ){
      return match.replace(attr, function( match, attr, value ){
        reference(value)
        return attr+'="'+value.replace(search, replace)+'"'
      })
    })
  }

  function rewriteCssUrl( content, base, replace ){
    base = new RegExp("^"+base)
    return content.replace(/url\(([^\)]+)\)/, function( match, url ){
      reference(url)
      return "url("+url.replace(base, replace)+")"
    })
  }

  function replaceScriptUrl( content ){
    return content
      .replace(new RegExp('"<%=routes.script.srcUrl%>(.+?.js)"', 'g'), function( match, src ){
        reference(match)
        return "<%=routes.script.destUrl%>"+src
      })
      .replace(new RegExp('"<%=routes.library.srcUrl%>(.+?.js)"', 'g'), function( match, src ){
        reference(match)
        return "<%=routes.library.destUrl%>"+src
      })
      .replace(new RegExp('"<%=routes.plugin.srcUrl%>(.+?.js)"', 'g'), function( match, src ){
        reference(match)
        return "<%=routes.plugin.destUrl%>"+src
      })
      .replace(new RegExp('"<%=routes.polyfill.srcUrl%>(.+?.js)"', 'g'), function( match, src ){
        reference(match)
        return "<%=routes.polyfill.destUrl%>"+src
      })
  }

  function reference( src ){
    src = src.replace(new RegExp("^<%=routes.root.src%>".replace(/(\/+|\\+)$/, "")), "/").replace(/[\/\\]+/g, "/")
    reference[src] = true
  }
  function isReferenced( src ){
    src = src.replace(new RegExp("^<%=routes.root.src%>".replace(/(\/+|\\+)$/, "")), "/").replace(/[\/\\]+/g, "/")
    console.log(!!reference[src] ? "" : "Unreferenced "+src)
    return !!reference[src]
  }

  // HTML
  grunt.config("copy.html", {
    expand: true,
    cwd: "<%=routes.root.src%>",
    src: "*.html",
    dest: "<%=routes.root.dest%>",
    options: {process: function( content ){
      content = replaceAttribute(content, "script", "src", "<%=routes.script.srcUrl%>", "<%=routes.script.destUrl%>")
      content = replaceAttribute(content, "link", "href", "<%=routes.css.srcUrl%>", "<%=routes.css.destUrl%>")
      content = replaceAttribute(content, "img", "src", "<%=routes.image.srcUrl%>", "<%=routes.image.destUrl%>")
      content = rewriteCssUrl(content, "<%=routes.image.srcUrl%>", "<%=routes.image.destUrl%>")
      content = rewriteCssUrl(content, "<%=routes.font.srcUrl%>", "<%=routes.font.destUrl%>")
      return content
    }}
  })

  // TEMPLATE
  grunt.config("copy.template", {
    expand: true,
    cwd: "<%=routes.root.src%>",
    src: "*.html",
    dest: "<%=routes.template.dest%>",
    options: {process: function( content ){
      content = replaceAttribute(content, "script", "src", "<%=routes.script.srcUrl%>", "<%=routes.script.destUrl%>")
      content = replaceAttribute(content, "link", "href", "<%=routes.css.srcUrl%>", "<%=routes.css.destUrl%>")
      content = replaceAttribute(content, "img", "src", "<%=routes.image.srcUrl%>", "<%=routes.image.destUrl%>")
      content = rewriteCssUrl(content, "<%=routes.image.srcUrl%>", "<%=routes.image.destUrl%>")
      content = rewriteCssUrl(content, "<%=routes.font.srcUrl%>", "<%=routes.font.destUrl%>")
      return content
    }}
  })

  // CSS
  grunt.config("copy.css", {
    expand: true,
    cwd: "<%=routes.css.src%>",
    src: "**/*.css",
    dest: "<%=routes.css.dest%>",
    filter: function( src ){
      return isReferenced(src)
    },
    options: {process: function( content ){
      content = rewriteCssUrl(content, "<%=routes.image.srcUrl%>", "<%=routes.image.destUrl%>")
      content = rewriteCssUrl(content, "<%=routes.font.srcUrl%>", "<%=routes.font.destUrl%>")
      return content
    }}
  })

  // FONT
  grunt.config("copy.font", {
    expand: true,
    filter: function( src ){
      return isReferenced(src)
    },
    cwd: "<%=routes.font.src%>",
    src: "**/*.{eot,svg,woff,ttf}",
    dest: "<%=routes.font.dest%>"
  })

  // IMAGE
  grunt.config("copy.image", {
    expand: true,
    filter: function( src ){
      return isReferenced(src)
    },
    cwd: "<%=routes.image.src%>",
    src: "*.{jpg,jpeg,png,gif}",
    dest: "<%=routes.image.dest%>"
  })

  // AUDIO
  grunt.config("copy.audio", {
    expand: true,
    filter: function( src ){
      return isReferenced(src)
    },
    cwd: "<%=routes.audio.src%>",
    src: "**/*",
    dest: "<%=routes.audio.dest%>"
  })

  // VIDEO
  grunt.config("copy.video", {
    expand: true,
    filter: function( src ){
      return isReferenced(src)
    },
    cwd: "<%=routes.video.src%>",
    src: "**/*",
    dest: "<%=routes.video.dest%>"
  })

  // SCRIPT
  grunt.config("copy.script", {
    files: [{
      expand: true,
      filter: function( src ){
        return isReferenced(src)
      },
      cwd: "<%=routes.script.src%>",
      src: [
        "**/*.js",
        "!library/**/*",
        "!plugin/**/*",
        "!polyfill/**/*"
      ],
      dest: "<%=routes.script.dest%>",
      options: {process: replaceScriptUrl}
    }, {
      expand: true,
      filter: function( src ){
        return isReferenced(src)
      },
      cwd: "<%=routes.script.src%>",
      src: [
        "library/**/*",
        "plugin/**/*",
        "polyfill/**/*"
      ],
      dest: "<%=routes.script.dest%>"
    }]
  })

  // IMAGE OPTIMIZE
  grunt.config("imagemin", {
    build: {
      options: {

      },
      expand: true,
      cwd: "<%=routes.image.src%>",
      src: "**/*.{png,jpg,jpeg,gif,svg}",
      dest: "<%=routes.image.dest%>"
    }
  })

  // UGLIFY
  grunt.config("uglify.build", {
    options: {
      mangle: {
//        except: [""]
      },
      compress: {
        drop_console: true
      }
    },
    expand: true,
    cwd: "<%=routes.script.dest%>",
    src: [
      "**/*.js",
      "!library/**/*",
      "!plugin/**/*",
      "!polyfill/**/*"
    ],
    dest: "<%=routes.script.dest%>"
  })

  /*
   * build
   * */
  grunt.registerTask("build", "", function(  ){
    grunt.task.run("newer:copy:html")
    grunt.task.run("newer:copy:css")
    grunt.task.run("newer:copy:image")
    grunt.task.run("newer:copy:audio")
    grunt.task.run("newer:copy:video")
    grunt.task.run("newer:copy:script")
    grunt.task.run("newer:imagemin")
//    grunt.task.run("uglify:build")
  })

};