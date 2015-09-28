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
let config = require('./config/config');
let configure = require('./app/helpers/configure');
let routes = require('./app/routes');
let log = require('./app/helpers/logger');

log.info('🔥  Firing up the KHE API');

// Make the app
let app = express();
let router = express.Router();

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

log.info(`👂  Listening on port ${port}`);

// Export some useful objects
module.exports.app = app;
module.exports.router = router;
module.exports.io = io;

// Include routes
routes(router);

log.info('😎  We are ready to go! Hack away.');