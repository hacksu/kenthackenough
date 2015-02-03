var express = require('express');

var app = express();
var port = process.env.PORT || 3000;
var server = app.listen(port, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log('\n  🎉  Kent Hack Enough listening at http://%s:%s\n', host, port);
});

module.exports.app = app;