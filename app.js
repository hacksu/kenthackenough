/*

Kent Hack Enough

Let's try to organize organizing.
@author Paul Dilyard

To get the app instance, just call getApp() from anywhere
To get the router, call getRouter() from anywhere
To get a db connection, require('mongoose')
To get the socket.io connection, call getIo()

*/
GLOBAL.rootRequire = function(name) {
    return require(__dirname + '/' + name);
};

var express = require('express');
var http = require('http');
var socketio = require('socket.io');
var cors = require('cors');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var winston = require('winston');
var compress = require('compression');
var error = require('./app/helpers/error');
var config = require('./config/config');
var initConfig = require('./app/helpers/initconfig');
var zip = require('express-zip');

// Start up server
var app = express();
var router = express.Router();

// Tell winston to use a log file
winston.add(winston.transports.File, {
  filename: config.log,
  json: false,
  handleExceptions: true
});
winston.exitOnError = false;

// Configure app
app.use(cors());
app.use(compress());
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(error);
app.use('/v1.0', router);
app.set('json spaces', 2);
var port = process.env.PORT || config.port;
var server = app.listen(port);
var io = socketio(server);

// Connect to database
var mongo = process.env.MONGO_URI || config.mongo.uri;
mongoose.connect(mongo);

// Initialize configuration
initConfig();

// Export some useful objects
module.exports.router = router;
module.exports.app = app;
module.exports.io = io;
GLOBAL.getApp = function () {
  return app;
};
GLOBAL.getRouter = function () {
  return router;
};
GLOBAL.getIo = function () {
  return io;
};

// Include modules
[
  'devices',
  'emails',
  'events',
  'exports',
  'messages',
  'news',
  'tickets',
  'urls',
  'users/application',
  'users',
  'projects',
  'stats'
].forEach(function (module) {
  require('./app/' + module + '/controller');
});