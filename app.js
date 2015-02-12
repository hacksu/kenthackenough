/*

Kent Hack Enough

Let's try to organize organizing.
@author Paul Dilyard

To get the app instance, just call getAppInstance() from anywhere
To get a db connection, require('mongoose')

*/
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var multer = require('multer');
var error = require('./app/error');

// Start up server
var app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(multer({dest: './uploads/'}));
app.use(error);
var port = process.env.PORT || 3000;
var server = app.listen(port, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log('\n  🎉  Kent Hack Enough listening at http://%s:%s\n', host, port);
});

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