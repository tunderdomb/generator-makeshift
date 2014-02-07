'use strict';
var util = require('util');
var path = require('path');
var yeoman = require('yeoman-generator');

var MakeshiftGenerator = module.exports = function MakeshiftGenerator(args, options, config) {
  yeoman.generators.Base.apply(this, arguments)

  this.on("end", function (){
    if ( this.installNpm ) {
      this.npmInstall(null, null, null)
    }
  })

  // have Yeoman greet the user.
  console.log(this.yeoman)
};

util.inherits(MakeshiftGenerator, yeoman.generators.Base);

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

MakeshiftGenerator.prototype.selectRouteMap = function (){var done = this.async()
  console.log("\nSelect route mapping..." +
    "\nNOTE: You can find more info about route maps in the README of this generator.")

  this.prompt([{
    type: "list",
    name: "routeMap",
    message: "Route mapping",
    default: "default",
    choices: ["default", "asp"]
  }], function( props ){
    this.routeMap = props.routeMap
    done()
  }.bind(this))
}

MakeshiftGenerator.prototype.initSetup = function (){
  console.log("\nInitiating...")

  this.manifest = JSON.parse(this.src.read("manifest.json"))

  switch( this.routeMap ){
    case "asp":
      this.manifest.routes = JSON.parse(this.src.read("routes/asp.json"))
      break
    case "default":
    default:
      this.manifest.routes = JSON.parse(this.src.read("routes/default.json"))
  }
  this.dest.write("manifest.json", JSON.stringify(this.manifest, null, "  "))
}

MakeshiftGenerator.prototype.defineRoutes = function (){
  console.log("\nA `manifest.json` file is generated in the root of your project." +
    "\nThis setup will read back your changes, " +
    "\nand some of these values will be baked into the build scripts, " +
    "\nor used as templates." +
    "\nReview them and change if necessary." +
    "\nNOTE: You can find info about the manifest file in the README of this generator.")
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

MakeshiftGenerator.prototype.rereadManifest = function (){
  console.log("Routing...")

  var manifest = JSON.parse(this.dest.read("manifest.json"))
    , routes = manifest.routes

  routes.library = {
    src: routes.script.src+"library/",
    dest: routes.script.dest+"library/"
  }
  routes.plugin = {
    src: routes.script.src+"plugin/",
    dest: routes.script.dest+"plugin/"
  }
  routes.module = {
    src: routes.script.src+"module/",
    dest: routes.script.dest+"module/"
  }
  routes.polyfill = {
    src: routes.script.src+"polyfill/",
    dest: routes.script.dest+"polyfill/"
  }

  // sanitize values
  for( var entry in routes ){
    entry = routes[entry]

    entry.src = (entry.src+"/").replace(/^\/+/g, "").replace(/\/+$/g, "/")

    if ( entry.dest ) {
      entry.dest = (entry.dest+"/").replace(/^\/+/g, "").replace(/\/+$/g, "/")
    }
    else {
      entry.dest = entry.src
    }

    if ( entry.src != routes.root.src ) {
      entry.srcUrl = "/"+entry.src
      entry.destUrl = "/"+entry.dest
      entry.src = routes.root.src+entry.src
      entry.dest = routes.root.dest+entry.dest
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

  // after values have been confirmed, re assign manifest content
  this.manifest = manifest
  this.routes = manifest.routes
}

MakeshiftGenerator.prototype.makeDirs = function (){
  console.log("Creating directory structure...")

  var manifest = this.manifest
    , routes = manifest.routes
    , prop
    , cwd = {cwd: this.sourceRoot()}

  // copy generated folders and contents
  for ( prop in this.gen ) { this.mkdir(this.gen[prop]) }
  this.expandFiles(this.gen.root+"**/*", cwd)
    .forEach(function( file ){
      this.template(file)
    }.bind(this))

  // copy resource folders and contents
  for ( prop in this.res ) { this.mkdir(this.res[prop]) }
  this.expandFiles(this.res.root+"**/*", cwd)
    .forEach(function( file ){
      this.template(file)
    }.bind(this))

  for ( prop in routes ) {
    this.mkdir(routes[prop].src)
    this.mkdir(routes[prop].dest)
  }
  // extend image dir with resolution folders
  this.mkdir(routes.image.src+"ldpi")
  this.mkdir(routes.image.src+"mdpi")
  this.mkdir(routes.image.src+"hdpi")
  this.mkdir(routes.image.src+"xdpi")

  // extend script root with behavioral separation
  this.expandFiles(routes.root.src+"**/*", cwd)
    .forEach(function( file ){
      this.copy(file)
    }.bind(this))
}

MakeshiftGenerator.prototype.copyTasks = function (){
  console.log("Copying tasks...")

  // copy every task
  this.expandFiles("tasks/**/*.js", {
    cwd: this.sourceRoot()
  }).forEach(function( file ){
      this.template(file)
    }.bind(this))
}

MakeshiftGenerator.prototype.rootFiles = function (){
  console.log("Copying root files...")

  this.template("README.md")
  this.template("Gruntfile.js")
  this.copy(".gitignore")
  this.write("package.json", JSON.stringify(this.manifest["package.json"], null, "  "))
  delete this.manifest["package.json"]
  delete this.manifest["routes"]
  this.writeFileFromString(JSON.stringify(this.manifest, null, "  "), this.destinationRoot()+"/manifest.json")
}
MakeshiftGenerator.prototype.askNpmInstall = function (){

  var done = this.async()
  this.prompt([{
    type: "confirm",
    name: "installNpm",
    message: "Install npm modules",
    default: false
  }], function( props ){
    this.installNpm = props.installNpm
    done()
  }.bind(this))
}
