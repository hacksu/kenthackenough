var mongoose = require('mongoose');
var bcrypt = require('bcrypt');

var User = mongoose.model('User', {
  username: {type: String, unique: true},
  email: String,
  password: String,
  salt: String
});

/**
* Generate a random salt
* @return A salt of length 10
*/
User.prototype.salt = function () {
  return bcrypt.genSaltSync(10);
};

/**
* Hash a password
* @param password A password
* @param salt A salt for the algorithm
* @return The hashed password
*/
User.prototype.hash = function(password, salt) {
  return bcrypt.hashSync(password, salt);
};

/**
* Check a user's password
* @param password The actual user's fully hashed password
* @param attempt The password to attempt with
* @param hash The user's salt
* @return true if password matches, else false
*/
User.prototype.checkPassword = function(password, attempt, salt) {
  if (User.hash(attempt, salt) == password) {
    return true;
  }
  return false;
};

module.exports = User;