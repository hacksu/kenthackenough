'use strict';

var config = rootRequire('config/config');
var winston = require('winston');
var User = rootRequire('app/users/model');

module.exports = function () {

  // Register users from the config if they aren't already registered.
  if (config.users) {
    config.users.forEach(function (newUser) {
      User.findOne({email: newUser.email}, function (err, user) {
        if (err) return winston.error(err);
        if (user) return; // We don't need to do anything if the user already exists

        var salt = User.Helpers.salt();
        var user = new User({
          email: newUser.email,
          password: User.Helpers.hash(newUser.password, salt),
          role: newUser.role,
          salt: salt,
          activated: false,
          time: Date.now()
        });

        user.save();
      });
    });
  };

};