'use strict';

/*
Kent Hack Enough

Let's try to organize organizing.
@author Paul Dilyard
*/
GLOBAL.rootRequire = function(name) {
    return require(__dirname + '/' + name);
};

let express = require('express');
let socketio = require('socket.io');
let mongoose = require('mongoose');
let winston = require('winston');
let config = require('./config/config');
let configure = require('./app/helpers/configure');
let routes = require('./app/routes');

// Make the app
let app = express();
let router = express.Router();

// Tell winston to use a log file
winston.add(winston.transports.File, {
  filename: config.log,
  json: false,
  handleExceptions: true
});
winston.exitOnError = false;

// Connect to database
let mongo = process.env.MONGO_URI || config.mongo.uri;
mongoose.connect(mongo);

// Initialize configuration
configure.app(app, router);
configure.seed();

// Start server
let port = process.env.PORT || config.port;
let server = app.listen(port);
let io = socketio(server);

// Export some useful objects
module.exports.app = app;
module.exports.router = router;
module.exports.io = io;

// Include routes
routes(router);