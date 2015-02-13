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
var error = require('./app/error');

// Start up server
var app = express();
app.use(cors());
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(multer({dest: './uploads/'}));
app.use(error);
app.use(function (req, res, next) {
  console.log(req.method + ' ' + req.url);
  next();
});
var port = process.env.PORT || 3000;
var server = app.listen(port);

// Connect to database
var mongo = process.env.MONGO_URI || 'mongodb://localhost:27017/khe';
mongoose.connect(mongo);

module.exports.app = app;
module.exports.mongoose = mongoose;
GLOBAL.getAppInstance = function () {
  return app;
};

// Include modules
[
  'users',
  'applications'
].forEach(function (module) {
  require('./app/' + module + '/controller');
});