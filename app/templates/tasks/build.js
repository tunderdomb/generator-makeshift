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
      .replace(new RegExp('"<%=routemap.script.srcUrl%>(.+?.js)"', 'g'), function( match, src ){
        reference(match)
        return "<%=routemap.script.destUrl%>"+src
      })
      .replace(new RegExp('"<%=routemap.library.srcUrl%>(.+?.js)"', 'g'), function( match, src ){
        reference(match)
        return "<%=routemap.library.destUrl%>"+src
      })
      .replace(new RegExp('"<%=routemap.plugin.srcUrl%>(.+?.js)"', 'g'), function( match, src ){
        reference(match)
        return "<%=routemap.plugin.destUrl%>"+src
      })
      .replace(new RegExp('"<%=routemap.polyfill.srcUrl%>(.+?.js)"', 'g'), function( match, src ){
        reference(match)
        return "<%=routemap.polyfill.destUrl%>"+src
      })
  }

  function reference( src ){
    src = src.replace(new RegExp("^<%=routemap.root.src%>".replace(/(\/+|\\+)$/, "")), "/").replace(/[\/\\]+/g, "/")
    reference[src] = true
  }
  function isReferenced( src ){
    src = src.replace(new RegExp("^<%=routemap.root.src%>".replace(/(\/+|\\+)$/, "")), "/").replace(/[\/\\]+/g, "/")
    console.log(!!reference[src] ? "" : "Unreferenced "+src)
    return !!reference[src]
  }

  // HTML
  grunt.config("copy.html", {
    expand: true,
    cwd: "<%=routemap.root.src%>",
    src: "*.html",
    dest: "<%=routemap.root.dest%>",
    options: {process: function( content ){
      content = replaceAttribute(content, "script", "src", "<%=routemap.script.srcUrl%>", "<%=routemap.script.destUrl%>")
      content = replaceAttribute(content, "link", "href", "<%=routemap.css.srcUrl%>", "<%=routemap.css.destUrl%>")
      content = replaceAttribute(content, "img", "src", "<%=routemap.image.srcUrl%>", "<%=routemap.image.destUrl%>")
      content = rewriteCssUrl(content, "<%=routemap.image.srcUrl%>", "<%=routemap.image.destUrl%>")
      content = rewriteCssUrl(content, "<%=routemap.font.srcUrl%>", "<%=routemap.font.destUrl%>")
      return content
    }}
  })

  // TEMPLATE
  grunt.config("copy.template", {
    expand: true,
    cwd: "<%=routemap.root.src%>",
    src: "*.html",
    dest: "<%=routemap.template.dest%>",
    options: {process: function( content ){
      content = replaceAttribute(content, "script", "src", "<%=routemap.script.srcUrl%>", "<%=routemap.script.destUrl%>")
      content = replaceAttribute(content, "link", "href", "<%=routemap.css.srcUrl%>", "<%=routemap.css.destUrl%>")
      content = replaceAttribute(content, "img", "src", "<%=routemap.image.srcUrl%>", "<%=routemap.image.destUrl%>")
      content = rewriteCssUrl(content, "<%=routemap.image.srcUrl%>", "<%=routemap.image.destUrl%>")
      content = rewriteCssUrl(content, "<%=routemap.font.srcUrl%>", "<%=routemap.font.destUrl%>")
      return content
    }}
  })

  // CSS
  grunt.config("copy.css", {
    expand: true,
    cwd: "<%=routemap.css.src%>",
    src: "**/*.css",
    dest: "<%=routemap.css.dest%>",
    filter: function( src ){
      return isReferenced(src)
    },
    options: {process: function( content ){
      content = rewriteCssUrl(content, "<%=routemap.image.srcUrl%>", "<%=routemap.image.destUrl%>")
      content = rewriteCssUrl(content, "<%=routemap.font.srcUrl%>", "<%=routemap.font.destUrl%>")
      return content
    }}
  })

  // FONT
  grunt.config("copy.font", {
    expand: true,
    filter: function( src ){
      return isReferenced(src)
    },
    cwd: "<%=routemap.font.src%>",
    src: "**/*.{eot,svg,woff,ttf}",
    dest: "<%=routemap.font.dest%>"
  })

  // IMAGE
  grunt.config("copy.image", {
    expand: true,
    filter: function( src ){
      return isReferenced(src)
    },
    cwd: "<%=routemap.image.src%>",
    src: "*.{jpg,jpeg,png,gif}",
    dest: "<%=routemap.image.dest%>"
  })

  // AUDIO
  grunt.config("copy.audio", {
    expand: true,
    filter: function( src ){
      return isReferenced(src)
    },
    cwd: "<%=routemap.audio.src%>",
    src: "**/*",
    dest: "<%=routemap.audio.dest%>"
  })

  // VIDEO
  grunt.config("copy.video", {
    expand: true,
    filter: function( src ){
      return isReferenced(src)
    },
    cwd: "<%=routemap.video.src%>",
    src: "**/*",
    dest: "<%=routemap.video.dest%>"
  })

  // SCRIPT
  grunt.config("copy.script", {
    files: [{
      expand: true,
      filter: function( src ){
        return isReferenced(src)
      },
      cwd: "<%=routemap.script.src%>",
      src: [
        "**/*.js",
        "!library/**/*",
        "!plugin/**/*",
        "!polyfill/**/*"
      ],
      dest: "<%=routemap.script.dest%>",
      options: {process: replaceScriptUrl}
    }, {
      expand: true,
      filter: function( src ){
        return isReferenced(src)
      },
      cwd: "<%=routemap.script.src%>",
      src: [
        "library/**/*",
        "plugin/**/*",
        "polyfill/**/*"
      ],
      dest: "<%=routemap.script.dest%>"
    }]
  })

  // IMAGE OPTIMIZE
  grunt.config("imagemin", {
    build: {
      options: {

      },
      expand: true,
      cwd: "<%=routemap.image.src%>",
      src: "**/*.{png,jpg,jpeg,gif,svg}",
      dest: "<%=routemap.image.dest%>"
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
    cwd: "<%=routemap.script.dest%>",
    src: [
      "**/*.js",
      "!library/**/*",
      "!plugin/**/*",
      "!polyfill/**/*"
    ],
    dest: "<%=routemap.script.dest%>"
  })

  /*
   * build
   * */
  grunt.registerTask("build", "", function(  ){
    grunt.task.run("copy:html")
    grunt.task.run("copy:css")
    grunt.task.run("copy:image")
    grunt.task.run("copy:audio")
    grunt.task.run("copy:video")
    grunt.task.run("copy:script")
    grunt.task.run("imagemin")
    grunt.task.run("uglify:build")
  })

};