/**
* Wraps a socket.io namespace in some authentication logic
* @author Paul Dilyard
*
* To create a new namespace:
* var socket = require('./socket');
* var io = socket('/namespace', ['admin', 'staff']);
* // only admin and staff will be able to access this namespace
*/

var io = getIo();
var redis = require('redis').createClient();
var User = rootRequire('app/users/model');

module.exports = function (namespace, roles) {

  if (!roles) roles = ['admin', 'staff', 'attendee'];

  var nsp = io.of(namespace);

  nsp.use(function (socket, next) {
    var header = socket.request._query.authorization || false;
    if (!header) return next(new Error('not authorized'));

    var encoded = header.split(/\s+/).pop() || '';
    var full = new Buffer(encoded, 'base64').toString();
    var parts = full.split(/:/);
    var key = parts[0];
    var token = parts[1];

    // Check for logged in user in redis
    var rkey = 'users:id:' + key;
    redis.hgetall(rkey, function (err, user) {
      if (err || !user) {
        // it's not in redis, but let's check mongo just to be sure (this
        // shouldn't happen if the user is logged in)
        User.findById(key, function (err, user) {
          if (err || !user) return next(new Error('not authorized'));
          if (user.token == token && roles.indexOf(user.role) >= 0) {
            User.Helpers.cache(user);
            next();
          } else {
            next(new Error('not authorized'));
          }
        });
      } else {
        // we have our use in redis
        if (user.token == token && roles.indexOf(user.role) >= 0) {
          next();
        } else {
          next(new Error('not authorized'));
        }
      }

    });
  });

  return nsp;

};