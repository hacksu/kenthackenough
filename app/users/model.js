/*

User Model
@author Paul Dilyard

@dependencies:
  mongoose, bcrypt, auth, validate

@usage:
  var User = require('./model');

  // Create a new user
  var user = new User({
    email: ...,
    password: ...,
    ...
  });

  // Protect a route
  app.get('/', User.Auth(), function (req, res) {});

  // Admins only
  app.get('/admin', User.Auth([User.ADMIN]), function (req, res) {});

*/

var mongoose = require('mongoose');
var redis = require('redis').createClient();
var bcrypt = require('bcrypt');
var uuid = require('uuid');
var schema = require('validate');
var _ = require('underscore');

var User = mongoose.model('User', {
  email: {type: String, unique: true},
  permissions: {type: [String], default: []},
  password: String,
  salt: String,
  token: String,
  application: {type: mongoose.Schema.Types.ObjectId, ref: 'Application'},
  created: { type : Date, default: Date.now() }
});

var Helpers = {

  /**
  * Generate a random salt
  * @return A salt of length 10
  */
  salt: function () {
    return bcrypt.genSaltSync(10);
  },

  /**
  * Hash a password
  * @param password A password
  * @param salt A salt for the algorithm
  * @return The hashed password
  */
  hash: function(password, salt) {
    return bcrypt.hashSync(password, salt);
  },

  /**
  * Generate a token
  * @return A new token
  */
  token: function () {
    return uuid.v4();
  },

  /**
  * Check a user's password
  * @param password The actual user's fully hashed password
  * @param attempt The password to attempt with
  * @param hash The user's salt
  * @return true if password matches, else false
  */
  checkPassword: function(password, attempt, salt) {
    if (Helpers.hash(attempt, salt) == password) {
      return true;
    }
    return false;
  },

  /**
  * Parse the Authorization headers
  * @return {key: String, token: String}
  */
  parseAuthHeader: function (headers) {
    var header = headers['Authorization'] || headers['authorization'] || false;
    if (!header) return null;

    var encoded = header.split(/\s+/).pop() || '';
    var full = new Buffer(encoded, 'base64').toString();
    var parts = full.split(/:/);
    var key = parts[0];
    var token = parts[1];

    return {key: key, token: token};
  },

  /**
  * End a response with an HTTPAuth error
  * @param res A response object
  */
  authError: function (res) {
    res
      .status(401)
      .send({errors: ['You must be logged in to access this area']});
  },

  /**
  * Validate a user
  * @param user An object representing the potential user
  * @return An array of error messages
  */
  validate: function (user) {
    var test = schema({
      email: {
        type: 'string',
        required: true,
        message: 'A valid email address is required'
      },
      password: {
        type: 'string',
        required: true,
        match: /.{2,32}/,
        message: 'Your password must be between 2 and 32 characters long.'
      }
    }, {typecast: true});
    return test.validate(user);
  },

  /**
  * Cache a user's authorization credentials (key and token)
  * @param user The user document
  * @param callback (Optional) Called when caching is complete
  */
  cache: function (user, callback) {
    redis.hmset('users:id:'+user._id, {
      token: user.token,
      role: user.role,
      permissions: user.permissions
    }, function (err, status) {
      callback && callback();
    });
  },

  /**
  * Uncache a user
  * @param user The user document
  * @param callback (Optional) Called when the operation is complete
  */
  uncache: function (user, callback) {
    redis.del('users:id:'+user._id, function (err) {
      callback && callback();
    });
  }

};

/**
* Authenticate a user
* @param ..args.. A list of permissions that are allowed to proceed
*/
var permit = function () {
  var permissions = Array.prototype.slice.call(arguments);

  function checkUser(user, token) {
    if (user.token == token) {
      user.permissions = user.permissions.split(',');
      var i = _.intersection(user.permissions, permissions);
      if (i.length) {
        // we're good, let them in
        return true;
      } else {
        // they don't share any permissions, so they're not allowed in
        return false;
      }
    } else {
      return false;
    }
  }

  return function (req, res, next) {
    console.log(Date.now());
    var access = Helpers.parseAuthHeader(req.headers);
    if (!access) return Helpers.authError(res);

    var rkey = 'users:id:' + access.key;
    redis.hgetall(rkey, function (err, user) {
      if (err || !user) {
        // it's not in redis, but let's check mongo just to be sure (this
        // shouldn't happen if the user is logged in)
        User.findById(access.key, function (err, user) {
          if (err || !user) return Helpers.authError(res);
          if (checkUser(user, access.token)) {
            // let them in
            req.user = {
              _id: access.key,
              token: access.token
            };
            next();
          } else {
            return Helpers.authError(res);
          }
        });
      } else {
        // we have our user in redis
        if (checkUser(user, access.token)) {
          req.user = {
            _id: access.key,
            token: access.token
          };
          console.log(Date.now());
          next();
        } else {
          return Helpers.authError(res);
        }
      }
    }); // end redis

  };
};

module.exports = User;
module.exports.permit = permit;
module.exports.Helpers = Helpers;
module.exports.validate = Helpers.validate;