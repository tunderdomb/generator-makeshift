'use strict';
var util = require('util');
var path = require('path');
var yeoman = require('yeoman-generator');

var MakeshiftGenerator = module.exports = function MakeshiftGenerator(args, options, config) {
  yeoman.generators.Base.apply(this, arguments)

  this.on("end", function (){
    this.npmInstall(null, null, null)
  })

  // have Yeoman greet the user.
  console.log(this.yeoman)
};

util.inherits(MakeshiftGenerator, yeoman.generators.Base);

MakeshiftGenerator.prototype.initSetup = function (){
  console.log("Initiating...")

  this.authorName = "no author defined"
  this.authorEmail = "no email"
  this.projectName = "unnamed"
  this.projectLicence = "MIT"
  this.projectDescription = "No description."
  this.useCsv = false

  this.gitRepo = ""
  this.initGit = false

  this.routemapPath = "routemap.json"
  this.mailsettingsPath = "res/mail.json"
  this.scriptsettingsPath = "res/scripts.json"

}

MakeshiftGenerator.prototype.askFast = function (){
  console.log("Hello...")
  var done = this.async()
  this.prompt([{
    type: "confirm",
    name: "usedefaults",
    message: "Use default setting and end this quickly",
    default: true
  }], function( props ){
    this.usedefaults = props.usedefaults
    done()
  }.bind(this))
}

MakeshiftGenerator.prototype.askBasic = function (){
  if( this.usedefaults ) return
  console.log("Basics...")

  var done = this.async()
  this.prompt([{
    type: "input",
    name: "authorName",
    message: "Author name",
    default: this.authorName
  }, {
    type: "input",
    name: "authorEmail",
    message: "Author email",
    default: this.authorEmail
  }, {
    type: "input",
    name: "projectName",
    message: "Project name",
    default: this.projectName,
    validate: function( value ){
      return  /^[\w\-\.]+$/.test(value)
    }
  }, {
    type: "input",
    name: "projectDescription",
    message: "Project description",
    default: this.projectDescription
  }, {
    type: "input",
    name: "projectLicence",
    message: this.projectLicence,
    default: "MIT"
  }, {
    type: "confirm",
    name: "useCsv",
    message: "Use version control",
    default: this.useCsv
  }], function ( props ){
    this.authorName = props.authorName
    this.authorEmail = props.authorEmail
    this.projectName = props.projectName
    this.projectLicence = props.projectLicence
    this.projectDescription = props.projectDescription
    this.useCsv = props.useCsv
    done()
  }.bind(this))
}

MakeshiftGenerator.prototype.askCvs = function (){
  if( this.usedefaults || !this.useCsv ) return
  console.log("Versioning...")

  var done = this.async()

  this.prompt([{
    type: "input",
    name: "gitRepo",
    message: "Git repository url",
    default: this.gitRepo
  }, {
    type: "confirm",
    name: "initGit",
    message: "Init git",
    default: this.initGit
  }], function ( props ){
    this.gitRepo = props.gitRepo
    this.initGit = props.initGit
    done()
  }.bind(this))
}

MakeshiftGenerator.prototype.allocatePorts = function (){
  console.log("Allocating ports...")

  // Allocate a port for local servers
  var portspath = path.join(__dirname, "../ports.json")
  var ports = JSON.parse(this.readFileAsString(portspath))
  var lastPort = ports[ports.length - 1]
  this.ports = {
    dev: ++lastPort,
    pub: ++lastPort,
    livereload: ++lastPort,
    mail: ++lastPort
  }

  ports = ports.concat([lastPort - 3, lastPort - 2, lastPort - 1, lastPort])
  this.writeFileFromString(JSON.stringify(ports), portspath)

  // get the local ip of this machine
  var os = require("os")
  var ifaces = os.networkInterfaces()
  var localIp
  for ( var dev in ifaces ) {
    ifaces[dev].forEach(function ( details ){
      if ( details.family == "IPv4" ) {
        localIp = localIp || details.address
      }
    })
  }
  this.localIp = localIp

  this.addresses = {
    dev: this.localIp+":"+this.ports.dev,
    pub: this.localIp+":"+this.ports.pub,
    mail: this.localIp+":"+this.ports.mail,
    livereload: this.localIp+":"+this.ports.livereload
  }
}

MakeshiftGenerator.prototype.copyRoutes = function (){
  var routemap = JSON.parse(this.src.read(this.routemapPath))
  this.copy("routemap.json")
}

MakeshiftGenerator.prototype.defineRoutes = function (){
  console.log("\nA routemap is generated in the root of your project." +
    "\nEvery entry is relative to the `root` values," +
    "\nand should end with a forward slash (/)." +
    "\n`src` fields are development paths, " +
    "\nand will map on build to their `dest` destination respectively." +
    "\nEmpty `dest` values means 'same as `src`'." +
    "\nThese values will be baked into the build scripts, " +
    "\nso review them and change if necessary.")
  var done = this.async()
  this.prompt([{
    type: "confirm",
    name: "ok",
    message: "CONTINUE",
    default: true
  }], function(  ){
    done()
  })
}

MakeshiftGenerator.prototype.finalizeRoutes = function (){
  console.log("Routing...")
  this.routemap = JSON.parse(this.dest.read(this.routemapPath))
  // sanitize values
  for( var entry in this.routemap ){
    entry = this.routemap[entry]

    entry.src = (entry.src+"/").replace(/^\/+/g, "").replace(/\/+$/g, "/")

    if ( entry.dest ) {
      entry.dest = (entry.dest+"/").replace(/^\/+/g, "").replace(/\/+$/g, "/")
    }
    else {
      entry.dest = entry.src
    }

    if ( entry.src != this.routemap.root.src ) {
      entry.srcUrl = "/"+entry.src
      entry.destUrl = "/"+entry.dest
      entry.src = this.routemap.root.src+entry.src
      entry.dest = this.routemap.root.dest+entry.dest
    }
  }
  // generated sources are not optional
  this.gen = {
    root: "gen/",
    page: "gen/page/",
    mail: "gen/mail/",
    css: "gen/css/",
    script: "gen/script/"
  }
  // neither does resource dirs
  this.res = {
    root: "res/",
    data: "res/data/",
    style: "res/style/",
    import: "res/style/import/",
    pages: "res/pages/",
    partials: "res/partials/",
    helpers: "res/helpers/"
  }
  this.writeFileFromString(JSON.stringify(this.routemap, null, "  "), this.destinationRoot()+"/"+this.routemapPath)
}

MakeshiftGenerator.prototype.makeDirs = function (){
  console.log("Creating directory structure...")

  var prop

  for ( prop in this.gen ) {this.mkdir(this.gen[prop])}
  this.expandFiles(this.gen.root+"**/*", {
    cwd: this.sourceRoot()
  }).forEach(function( file ){
      this.template(file)
    }.bind(this))

  for ( prop in this.res ) {this.mkdir(this.res[prop])}
  this.expandFiles(this.res.root+"**/*", {
    cwd: this.sourceRoot()
  }).forEach(function( file ){
      this.template(file)
    }.bind(this))

  for ( prop in this.routemap ) {
    this.mkdir(this.routemap[prop].src)
    this.mkdir(this.routemap[prop].dest)
  }
  this.expandFiles(this.routemap.root.src+"**/*", {
    cwd: this.sourceRoot()
  }).forEach(function( file ){
    this.copy(file)
  }.bind(this))

  // extend image dir with resolution folders
  this.mkdir(this.routemap.image.src+"ldpi")
  this.mkdir(this.routemap.image.src+"mdpi")
  this.mkdir(this.routemap.image.src+"hdpi")
  this.mkdir(this.routemap.image.src+"xdpi")

  // extend script root with behavioral separation
  this.mkdir(this.routemap.library = this.routemap.script.src+"library/")
  this.mkdir(this.routemap.plugin = this.routemap.script.src+"plugin/")
  this.mkdir(this.routemap.polyfill = this.routemap.script.src+"polyfill/")
  this.mkdir(this.routemap.module = this.routemap.script.src+"module/")

}

MakeshiftGenerator.prototype.copyTasks = function (){
  console.log("Copying tasks...")

  // copy every task
  this.template("tasks/build.js")
  this.template("tasks/make.js")
  this.template("tasks/modernizr.js")
  this.template("tasks/pluck.js")
  this.template("tasks/render.js")
  this.template("tasks/serve.js")

}

MakeshiftGenerator.prototype.rootFiles = function (){
  console.log("Copying root files...")

  this.template("Gruntfile.js")
  this.copy(".gitignore")
  this.template("package.json")
  this.template("README.md")
  this.copy(this.mailsettingsPath)
  this.copy(this.scriptsettingsPath)
}