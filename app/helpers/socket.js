'use strict';

/**
* Wraps a socket.io namespace in some authentication logic
* @author Paul Dilyard
*
* To create a new namespace:
* let socket = require('./socket');
* let io = socket('/namespace', ['admin', 'staff']);
* // only admin and staff will be able to access this namespace
* let io = socket('/namespace');
* // no authorization required for above namespace
*/

let io = require('../../app').io;
let config = rootRequire('config/config');
let redis = require('redis').createClient(config.redis.port, config.redis.host);
let User = rootRequire('app/users/model');

module.exports = function (namespace, roles) {

  let nsp = io.of(config.prefix + namespace);

  nsp.use(function (socket, next) {
    // If no roles are defined, you don't have to be authorized
    if (!roles) return next();

    let header = socket.request._query.authorization || false;
    if (!header) return next(new Error('not authorized'));

    let encoded = header.split(/\s+/).pop() || '';
    let full = new Buffer(encoded, 'base64').toString();
    let parts = full.split(/:/);
    let key = parts[0];
    let token = parts[1];

    User.Helpers.retrieve(key, token, function (err, user) {
      if (err || !user) {
        // User is not cached, fall back on mongoose
        User
          .findById(key)
          .select('email role tokens')
          .exec(function (err, user) {
            if (err || !user.tokens.length) return next(new Error('Not authorized'));

            let t;
            for (let i = 0; i < user.tokens.length; ++i) {
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