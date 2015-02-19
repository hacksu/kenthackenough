/*

Kent Hack Enough

Let's try to organize organizing.
@author Paul Dilyard

To get the app instance, just call getAppInstance() from anywhere
To get a db connection, require('mongoose')

*/
var express = require('express');
var cors = require('cors');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var multer = require('multer');
var winston = require('winston');
var error = require('./app/helpers/error');

// Start up server
var app = express();
var router = express.Router();

// Tell winston to use a log file
winston.add(winston.transports.File, {
  filename: 'app.log',
  handleExceptions: true
});
winston.exitOnError = false;

// Configure app
app.use(cors());
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(multer({dest: './uploads/'}));
app.use(error);
app.use(function (req, res, next) {
  winston.info(req.method + ' ' + req.url);
  next();
});
var port = process.env.PORT || 3000;
var server = app.listen(port);

// Connect to database
var mongo = process.env.MONGO_URI || 'mongodb://localhost:27017/khe';
mongoose.connect(mongo);

// Export some useful objects
module.exports.router = router;
module.exports.app = app;
module.exports.mongoose = mongoose;
GLOBAL.getAppInstance = function () {
  return app;
};
GLOBAL.getRouter = function () {
  return router;
};

// Include modules
[
  'users',
  'applications'
].forEach(function (module) {
  require('./app/modules/' + module + '/controller');
});

// Add an /api prefix to all routes
app.use('/api', router);