'use strict';

/**
* Wraps a socket.io namespace in some authentication logic
* @author Paul Dilyard
*
* To create a new namespace:
* var socket = require('./socket');
* var io = socket('/namespace', ['admin', 'staff']);
* // only admin and staff will be able to access this namespace
* var io = socket('/namespace');
* // no authorization required for above namespace
*/

var io = getIo();
var redis = require('redis').createClient();
var User = rootRequire('app/users/model');

module.exports = function (namespace, roles) {

  var nsp = io.of('/v1.0' + namespace);

  nsp.use(function (socket, next) {
    // If no roles are defined, you don't have to be authorized
    if (!roles) return next();

    var header = socket.request._query.authorization || false;
    if (!header) return next(new Error('not authorized'));

    var encoded = header.split(/\s+/).pop() || '';
    var full = new Buffer(encoded, 'base64').toString();
    var parts = full.split(/:/);
    var key = parts[0];
    var token = parts[1];

    User.Helpers.retrieve(key, token, function (err, user) {
      if (err || !user) {
        // User is not cached, fall back on mongoose
        User
          .findById(key)
          .select('email role tokens')
          .exec(function (err, user) {
            if (err || !user.tokens.length) return next(new Error('Not authorized'));

            var t;
            for (var i = 0; i < user.tokens.length; ++i) {
              if (user.tokens[i].token == token) {
                t = user.tokens[i];
                break;
              }
            }

            if (t.token == token && roles.indexOf(user.role) > -1 && Date.now() < new Date(t.expires).getTime()) {
              // Token matches, role has acccess, and token is not expired
              return next();
            } else {
              return next(new Error('Not authorized'));
            }
          });
      } else {
        // User is cached in redis
        if (roles.indexOf(user.role) > -1 && Date.now() < user.expires) {
          return next();
        } else {
          return next(new Error('Not authorized'));
        }
      }
    });
  });

  return nsp;

};