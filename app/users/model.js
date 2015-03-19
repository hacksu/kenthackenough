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
var bcrypt = require('bcrypt-nodejs');
var uuid = require('uuid');
var schema = require('validate');

var User = mongoose.model('User', {
  email: {type: String, unique: true},
  role: {type: String, enum: ['attendee', 'staff', 'admin'], default: 'attendee'},
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
      role: user.role
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
* Authenticate a user (protect a route)
* @param ...roles An list of roles that are allowed into the route
*/
var auth = function () {
  var roles = Array.prototype.slice.call(arguments);
  if (!roles.length) roles = ['admin', 'staff', 'attendee'];

  return function (req, res, next) {
    var header = req.headers['Authorization'] || req.headers['authorization'] || false;
    if (!header) return Helpers.authError(res);

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
          if (err || !user) return Helpers.authError(res);
          if (user.token == token && roles.indexOf(user.role) >= 0) {
            req.user = {
              _id: key,
              token: token
            };
            Helpers.cache(user);
            next();
          } else {
            Helpers.authError(res);
          }
        });
      } else {
        // we have our use in redis
        if (user.token == token && roles.indexOf(user.role) >= 0) {
          req.user = {
            _id: key,
            token: token
          };
          next();
        } else {
          Helpers.authError(res);
        }
      }

    });

  }

};

module.exports = User;
module.exports.auth = auth;
module.exports.Helpers = Helpers;
module.exports.validate = Helpers.validate;