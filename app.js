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
var multer = require('multer');
var winston = require('winston');
var compress = require('compression');
var error = require('./app/helpers/error');
var config = require('./config/config');
var initConfig = require('./app/helpers/initconfig');

// Start up server
var app = express();
var router = express.Router();

// Tell winston to use a log file
winston.add(winston.transports.File, {
  filename: config.log,
  // handleExceptions: true
});
winston.remove(winston.transports.Console);
// winston.exitOnError = false;

// Configure app
app.use(cors());
app.use(compress());
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(multer({dest: './uploads/'}));
app.use(error);
app.use(function (req, res, next) {
  winston.info(req.method + ' ' + req.url);
  next();
});
app.use(router);
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
  'emails',
  'messages',
  'tickets',
  'urls',
  'users/application',
  'users'
].forEach(function (module) {
  require('./app/' + module + '/controller');
});