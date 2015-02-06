var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var auth = require('basic-auth');

var User = mongoose.model('User', {
  username: {type: String, unique: true},
  email: {type: String, unique: true},
  role: String,
  password: String,
  salt: String
});

/**
* Authenticate a user (protect a route)
* @param roles An array of roles that are allowed into the route
*/
var Auth = function (roles) {
  if (!roles) roles = [ATTENDEE, STAFF, ADMIN];
  return function (req, res, next) {
    var credentials = auth(req);
    if (!credentials) {
      Helpers.authError(res);
    } else {
      User.findOne({username: credentials.name}, function (err, user) {
        if (err) Helpers.authError(res);
        if (Helpers.checkPassword(user.password, credentials.pass, user.salt)
          && roles.indexOf(user.role) >= 0) {
          next();
        } else {
          Helpers.authError(res);
        }
      });
    }
  }
};

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
    res.writeHead(401, {
      'WWW-Authenticate': 'Basic realm="example"'
    });
    res.end();
  }

};

module.exports = User;
module.exports.Auth = Auth;
module.exports.Helpers = Helpers;
var ATTENDEE = module.exports.ATTENDEE = 'attendee';
var STAFF = module.exports.STAFF = 'staff';
var ADMIN = module.exports.ADMIN = 'admin';