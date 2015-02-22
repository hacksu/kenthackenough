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
var bcrypt = require('bcrypt');
var auth = require('basic-auth');
var schema = require('validate');
var Application = require('../applications/model');

var User = mongoose.model('User', {
  email: {type: String, unique: true},
  role: {type: String, enum: ['attendee', 'staff', 'admin']},
  password: String,
  salt: String,
  subscribe: Boolean,                 // subscribe to the mailing list?
  activated: Boolean,                 // account activated?
  application: Application.Schema,    // user's application
  time : { type : Date, default: Date.now() }
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
    return res.send({errors: ['You must be logged in to access this area']});
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
  }

};

/**
* Authenticate a user (protect a route)
* @param roles An array of roles that are allowed into the route
*/
var Auth = function (roles) {
  if (!roles) roles = [ATTENDEE, STAFF, ADMIN];
  return function (req, res, next) {
    var credentials = auth(req);
    if (!credentials) {
      return Helpers.authError(res);
    } else {
      User.findOne({email: credentials.name}, function (err, user) {
        if (err) return Helpers.authError(res);
        if (!user) return Helpers.authError(res);
        // if (!user.activated) return res.send({errors: ['You have not yet activated your account']});
        if (Helpers.checkPassword(user.password, credentials.pass, user.salt)
          && roles.indexOf(user.role) >= 0) {
          req.user = user;
          next();
        } else {
          Helpers.authError(res);
        }
      });
    }
  }
};

module.exports = User;
module.exports.Auth = Auth;
module.exports.Helpers = Helpers;
module.exports.validate = Helpers.validate;
var ATTENDEE = module.exports.ATTENDEE = 'attendee';
var STAFF = module.exports.STAFF = 'staff';
var ADMIN = module.exports.ADMIN = 'admin';