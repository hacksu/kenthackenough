'use strict';

let User = rootRequire('app/users/model');
let cors = require('cors');
let compress = require('compression');
let bodyParser = require('body-parser');
let express = require('express');
let error = require('./error');
let config = rootRequire('config/config');
let log = require('./logger');

module.exports = {

  app: (app, router) => {
    app.use(cors());
    app.use(compress());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());
    app.use(error);
    app.use(config.prefix, router);
    app.use(express.static('public'));
    app.set('json spaces', 2);
    router.use((req, res, next) => {
      log.info(`[${req.method}] ${req.path}`);
      next();
    });
  },

  seed: () => {
    if (!config.users) return;
    for (let newUser of config.users) {
      User.findOne({email: newUser.email}, (err, user) => {
        if (err) return winston.error(err);
        if (user) return; // We don't need to do anything if the user already exists

        let salt = User.Helpers.salt();
        new User({
          email: newUser.email,
          password: User.Helpers.hash(newUser.password, salt),
          role: newUser.role,
          salt: salt,
          activated: false,
          time: Date.now()
        }).save();
      });
    }
  }

};