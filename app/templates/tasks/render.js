/*
 * grunt-mustache
 * https://github.com/tunderdomb/grunt-mustache
 *
 * Copyright (c) 2014 tunderdomb
 * Licensed under the MIT license.
 */

'use strict';

function extend( obj, ext ){
  for( var prop in ext ){
    obj[prop] = ext[prop]
  }
  return obj
}

var mustache = require("mustache")
  , path = require('path')


module.exports = function ( grunt ){

  // Please see the Grunt documentation for more information regarding task
  // creation: http://gruntjs.com/creating-tasks

  function getData( dataPathPattern ){
    var data = {}
    console.log("Collecting data from '"+dataPathPattern+"'")
    dataPathPattern = path.normalize(dataPathPattern+"/*.json")
    grunt.file.expand(dataPathPattern).forEach(function( dataPath ){
      try{
        data[path.basename(dataPath, path.extname(dataPath))] = JSON.parse(grunt.file.read(dataPath))
      }
      catch(e){}
    })
    return data
  }

  function findPartial( dir, name, ext ){
    var filePath = path.join(dir, name+ext)
    if (grunt.file.exists(filePath)) {
      return grunt.file.read(filePath)
    }
    else {
      console.warn("Partial not found '"+name+"'")
      return ""
    }
  }

  function registerHelpers( helpersDir, context ){
    console.log("Registering helpers from '"+helpersDir+"'")
    grunt.file.expand(helpersDir+"**/*.js").forEach(function( helper ){
      helper = path.resolve(helper)
      try{
        require(helper)(context)
      }
      catch(e){}
    })
    return context
  }

  grunt.registerMultiTask('render', 'Render templates', function (){
    // Merge task-specific and/or target-specific options with these defaults.
    var options = this.options({
      partials: "",
      data: "",
      helpers: null
    })

    var context = options.data ? getData(options.data) : {}

    registerHelpers(options.helpers, context)

    // Iterate over all specified file groups.
    this.files.forEach(function ( fileGroups ){
      // Render mustache files.
      fileGroups.src.filter(function ( filepath ){
        // Warn on and remove invalid source files (if nonull was set).
        if ( !grunt.file.exists(filepath) ) {
          grunt.log.warn('Source file "' + filepath + '" not found.')
          return false
        }
        grunt.file.write(fileGroups.dest, mustache.render(grunt.file.read(filepath), context, function( name ){
          var partial = ""
          switch( typeof options.partials ){
            case "string":
              partial = findPartial(options.partials, name, path.extname(filepath))
              break
            default :
              options.partials.forEach(function( src ){
                partial = partial || findPartial(src, name, path.extname(filepath))
              })
          }
          return partial
        }))
        console.log("Rendered mustache '"+fileGroups.dest+"'")
        return true
      })
    })
  })
};
