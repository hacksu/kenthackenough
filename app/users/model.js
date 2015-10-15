'use strict';

/*

User Model
@author Paul Dilyard

@dependencies:
  mongoose, bcrypt, auth, validate

@usage:
  let User = require('./model');

  // Create a new user
  let user = new User({
    email: ...,
    password: ...,
    ...
  });

  // Protect a route
  app.get('/', User.Auth(), function (req, res) {});

  // Admins only
  app.get('/admin', User.Auth([User.ADMIN]), function (req, res) {});

*/

let mongoose = require('mongoose');
let config = rootRequire('config/config');
let redis = require('redis').createClient(config.redis.port, config.redis.host);
let bcrypt = require('bcryptjs');
let uuid = require('uuid');
let schema = require('validate');

let User = mongoose.model('User', {
  email: {type: String, unique: true},
  role: {type: String, enum: ['attendee', 'staff', 'admin'], default: 'attendee'},

  application: {type: mongoose.Schema.Types.ObjectId, ref: 'Application'},
  created: {type : Date, default: Date.now},

  password: String,
  salt: String,

  tokens: [{
    client: String,
    token: String,
    refresh: String,
    expires: Date
  }]
});

let Helpers = {

  /**
  * Generate a random salt
  * @return A salt of length 10
  */
  salt: () => {
    return bcrypt.genSaltSync(10);
  },

  /**
  * Hash a password
  * @param password A password
  * @param salt A salt for the algorithm
  * @return The hashed password
  */
  hash: (password, salt) => {
    return bcrypt.hashSync(password, salt);
  },

  /**
  * Generate a token
  * @return A new token
  */
  token: () => {
    return uuid.v4();
  },

  /**
  * Generate an expiration date for a token (30 days from now)
  */
  expires: () => {
    return Date.now() + (30 * (1000 * 60 * 60 * 24));
  },

  /**
  * Check a user's password
  * @param password The actual user's fully hashed password
  * @param attempt The password to attempt with
  * @param hash The user's salt
  * @return true if password matches, else false
  */
  checkPassword: (password, attempt, salt) => {
    if (Helpers.hash(attempt, salt) == password) {
      return true;
    }
    return false;
  },

  /**
  * End a response with an HTTPAuth error
  * @param res A response object
  */
  authError: (res) => {
    res
      .status(401)
      .send({errors: ['You must be logged in to access this area']});
  },

  /**
  * Parse authorization headers
  * @param headers The request headers (req.headers)
  * @return {key: String, token: String} || null
  */
  parseAuthHeader: (headers) => {
    let header = headers['Authorization'] || headers['authorization'] || false;
    if (!header) return null;
    let encoded = header.split(/\s+/).pop() || '';
    let full = new Buffer(encoded, 'base64').toString();
    let parts = full.split(/:/);
    return {key: parts[0], token: parts[1]};
  },

  /**
  * Validate a user
  * @param user An object representing the potential user
  * @return An array of error messages
  */
  validate: (user) => {
    let test = schema({
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
      },
      client: {
        type: 'string',
        required: true,
        message: 'You must be using a valid client'
      }
    }, {typecast: true});
    return test.validate(user);
  },

  /**
  * Cache a user's authorization credentials (key and token)
  * @param user The user document
  * @param token A user's token
  * @param callback (Optional) Called when caching is complete
  */
  cache: (user, token, expires, callback) => {
    redis.hmset('users:id:'+user._id+':'+token, {
      _id: user._id,
      email: user.email,
      role: user.role,
      expires: expires
    }, (err, status) => {
      callback && callback();
    });
  },

  /**
  * Retrieve a user from the cache
  * @param key A user's key (ID)
  * @param token The access token
  * @param callback(err, Object) A callback that takes a user object:
  *                      {_id: String, email: String, role: String, expires: Number}
  */
  retrieve: (key, token, callback) => {
    redis.hgetall('users:id:'+key+':'+token, callback);
  },

  /**
  * Uncache a user
  * @param user The user document
  * @param callback (Optional) Called when the operation is complete
  */
  uncache: (user, token, callback) => {
    redis.del('users:id:'+user._id+':'+token, (err) => {
      callback && callback();
    });
  }

};

/**
* Authenticate a user (protect a route)
* @param ...roles A list of roles that are allowed into the route
*/
function auth() {
  let roles = Array.prototype.slice.call(arguments);
  if (!roles.length) roles = ['admin', 'staff', 'attendee'];

  return (req, res, next) => {

    let access = Helpers.parseAuthHeader(req.headers);
    if (!access) return Helpers.authError(res);

    Helpers.retrieve(access.key, access.token, (err, user) => {
      if (err || !user) {
        // User is not cached, fall back on mongoose
        User
          .findById(access.key)
          .select('email role tokens')
          .exec((err, user) => {
            if (err || !user.tokens.length) return Helpers.authError(res);

            let t;
            for (let i = 0; i < user.tokens.length; ++i) {
              if (user.tokens[i].token == access.token) {
                t = user.tokens[i];
                break;
              }
            }

            if (t && t.token == access.token && roles.indexOf(user.role) > -1 && Date.now() < new Date(t.expires).getTime()) {
              // Token matches, role has acccess, and token is not expired
              req.user = {
                _id: user._id,
                email: user.email,
                role: user.role
              };
              Helpers.cache(user, access.token, t.expires);
              return next();
            } else {
              return Helpers.authError(res);
            }
          });
      } else {
        // User is cached in redis
        if (roles.indexOf(user.role) > -1 && Date.now() < user.expires) {
          req.user = {
            _id: user._id,
            email: user.email,
            role: user.role
          };
          return next();
        } else {
          return Helpers.authError(res);
        }
      }
    });

  };
};

module.exports = User;
module.exports.auth = auth;
module.exports.Helpers = Helpers;
module.exports.validate = Helpers.validate;