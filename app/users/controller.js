'use strict';

let User = require('./model');
let Application = require('./application/model');
let Email = rootRequire('app/emails/model');
let schema = require('validate');
let config = rootRequire('config/config');
let uuid = require('uuid');
let socket = rootRequire('app/helpers/socket');
let io = socket('/users', ['admin', 'staff']);

module.exports = {

  /**
  * Create a new user
  * POST /users
  */
  create: (req, res) => {
    let errors = User.validate(req.body);
    if (errors.length) return res.multiError(errors, 400);
    if (config.clients.indexOf(req.body.client) < 0) return res.singleError('Invalid client ID', 400);

    let salt = User.Helpers.salt();
    let token = User.Helpers.token();
    let refresh = User.Helpers.token();
    let expires = User.Helpers.expires();

    let user = new User({
      email: req.body.email.toLowerCase(),
      password: User.Helpers.hash(req.body.password, salt),
      salt: salt,
      tokens: [{
        client: req.body.client,
        token: token,
        refresh: refresh,
        expires: expires
      }],
      created: Date.now()
    });

    user.save((err, user) => {
      if (err) return res.singleError('That email is already in use', 409);

      User.Helpers.cache(user, token, expires);

      io.emit('create', {
        _id: user._id,
        email: user.email
      });

      return res.status(201).json({
        role: user.role,
        key: user._id,
        token: token,
        refresh: refresh,
        expires: new Date(expires)
      });
    });
  },

  /**
  * Quickly create a fully applied user (for registering at the door)
  * POST /users/quick
  * Auth -> admin, staff
  */
  quick: (req, res) => {
    let test = schema({
      email: {
        type: 'string',
        required: true
      },
      name: {
        type: 'string',
        required: true
      },
      phone: {
        type: 'string',
        required: true
      }
    });
    let errors = test.validate(req.body);
    if (errors.length) return res.multiError(errors, 400);
    let application = new Application({
      name: req.body.name,
      phone: req.body.phone,
      door: true,
      going: true,
      status: Application.Status.APPROVED,
      checked: true,
      created: Date.now()
    });
    application.save((err, app) => {
      if (err) return res.internalError();

      let salt = User.Helpers.salt();
      let pass = User.Helpers.salt();
      let user = new User({
        email: req.body.email.toLowerCase(),
        password: User.Helpers.hash(pass, salt),
        salt: salt,
        created: Date.now(),
        application: app._id,
        role: 'attendee'
      });
      user.save((err, user) => {
        if (err) return res.singleError('That email is already in use', 409);

        let response = {
          _id: user._id,
          email: user.email,
          role: user.role,
          created: user.created,
          application: app
        };
        io.emit('create', response);
        return res.status(201).json(response);
      });

    });
  },

  /**
  * Get a key and token
  * POST /users/token
  */
  token: (req, res) => {
    let errors = User.validate(req.body);
    if (errors.length) return res.multiError(errors, 400);

    if (config.clients.indexOf(req.body.client) < 0) return res.singleError('Invalid client ID', 400);

    User
      .findOne()
      .where({email: req.body.email.toLowerCase()})
      .exec((err, user) => {
        if (err || !user) return res.singleError('Email or password incorrect', 400);

        if (User.Helpers.checkPassword(user.password, req.body.password, user.salt)) {

          // get tokens for this client
          let t;
          for (let i = 0; i < user.tokens.length; ++i) {
            if (user.tokens[i].client == req.body.client) {
              t = user.tokens[i];
              break;
            }
          }

          if (t) {
            // we already have a token for this client
            t.expires = User.Helpers.expires();
            user.save((err, user) => {
              if (err) return res.internalError();
              User.Helpers.cache(user, t.token, new Date(t.expires).getTime());
              return res.status(201).json({
                role: user.role,
                key: user._id,
                token: t.token,
                refresh: t.refresh,
                expires: new Date(t.expires)
              });
            });
          } else {
            // we need to create a new token for this client
            // first, make sure the client is valid
            if (config.clients.indexOf(req.body.client) > -1) {
              let token = User.Helpers.token();
              let refresh = User.Helpers.token();
              let expires = User.Helpers.expires();
              user.tokens.push({
                client: req.body.client,
                token: token,
                refresh: refresh,
                expires: expires
              });
              user.save((err, user) => {
                if (err) return res.internalError();
                User.Helpers.cache(user, token, expires);
                return res.status(201).json({
                  role: user.role,
                  key: user._id,
                  token: token,
                  refresh: refresh,
                  expires: new Date(expires)
                });
              });
            } else {
              // not a valid client
              return res.singleError('Invalid client ID', 400);
            }

          }

        } else {
          return res.singleError('Email or password incorrect', 400);
        }
      });
  },

  /**
  * Refresh a token
  * POST /users/token/refresh
  * Auth
  */
  refresh: (req, res) => {
    if (config.clients.indexOf(req.body.client) < 0) return res.singleError('Invalid client ID', 400);

    User
      .findById(req.body.key)
      .exec((err, user) => {
        if (err) return res.internalError();

        let token = User.Helpers.token();
        let refresh = User.Helpers.token();
        let expires = User.Helpers.expires();

        if (!user.tokens.length) return res.singleError('Invalid refresh token', 400);

        for (let i = 0; i < user.tokens.length; ++i) {
          if (user.tokens[i].client == req.body.client) {
            if (user.tokens[i].refresh == req.body.refresh) {
              user.tokens[i].token = token;
              user.tokens[i].refresh = refresh;
              user.tokens[i].expires = expires;
            } else {
              return res.singleError('Invalid refresh token', 400);
            }
            break;
          }
        }
        user.save((err, user) => {
          if (err) return res.internalError();
          User.Helpers.cache(user, token, expires);
          return res.status(200).json({
            role: user.role,
            key: user._id,
            token: token,
            refresh: refresh,
            expires: new Date(expires)
          });
        });
      });
  },

  /**
  * Remove a token
  * DELETE /users/token
  * Auth
  */
  deleteToken: (req, res) => {
    User
      .findById(req.user._id)
      .exec((err, user) => {
        if (err || !user) return res.internalError();

        for (let i = 0; i < user.tokens.length; ++i) {
          if (user.tokens[i].client == req.body.client) {
            user.tokens.splice(i, 1);
            break;
          }
        }

        user.save((err, user) => {
          if (err) return res.internalError();
          User.Helpers.uncache(user, req.user.token, () => {
            return res.status(200).json({});
          });
        });
      });
  },

  /**
  * Get a list of all users
  * GET /users
  * Auth -> admin, staff
  */
  get: (req, res) => {
    User
      .find()
      .select('email role permissions created')
      .exec((err, users) => {
        if (err) return res.internalError();
        return res.status(200).json({
          users: users
        });
      });
  },

  /**
  * Get a user by ID
  * GET /users/:id
  * Auth -> admin, staff
  */
  find: (req, res) => {
    User
      .findById(req.params.id)
      .select('email role created')
      .exec((err, user) => {
        if (err) return res.internalError();
        return res.status(200).json(user);
      });
  },

  /**
  * Partially update the logged in user
  * PATCH /users
  * Auth
  */
  patch: (req, res) => {
    User
      .findById(req.user._id)
      .exec((err, user) => {
        if (err) return res.internalError();
        if (req.body.email) {
          user.email = req.body.email.toLowerCase();
        }
        if (req.body.password) {
          user.salt = User.Helpers.salt();
          user.password = User.Helpers.hash(req.body.password, user.salt);
        }
        user.save((err) => {
          if (err) return res.singleError('That email is already taken', 409);
          let response = {
            _id: user._id,
            email: user.email
          };
          io.emit('update', response);
          return res.status(200).json(response);
        });
      });
  },

  /**
  * Partially update a user by ID
  * PATCH /users/:id
  * Auth -> admin
  */
  patchById: (req, res) => {
    if (req.body.email) req.body.email = req.body.email.toLowerCase();
    User
      .findByIdAndUpdate(req.params.id, req.body, {new: true})
      .exec((err, user) => {
        if (err) return res.internalError();
        let response = {
          _id: user._id,
          email: user.email,
          role: user.role,
          created: user.created
        };
        io.emit('update', response);
        return res.status(200).json(response);
      });
  },

  /**
  * Delete a user
  * DELETE /users/:id
  * Auth -> admin
  */
  delete: (req, res) => {
    User
      .findById(req.params.id)
      .remove()
      .exec((err) => {
        if (err) return res.internalError();
        let response = {
          _id: req.params.id
        };
        io.emit('delete', response);
        return res.status(200).json(response);
      });
  },

  /**
  * Send a password reset email
  * POST /users/reset
  */
  resetPassword: (req, res) => {
    User
      .findOne({email: req.body.email})
      .exec((err, user) => {
        if (err) return res.internalError();
        let random = uuid.v4().substr(0, 8);
        let newSalt = User.Helpers.salt();
        let newHash = User.Helpers.hash(random, newSalt);
        user.salt = newSalt;
        user.password = newHash;
        user.save((err) => {
          if (err) return res.internalError();
          let email = new Email({
            subject: '[KHE] Password reset',
            body: '# Kent Hack Enough \n ## Password Reset \n Your password has been reset. Your new password is: <br>' + random + '<br>Please login at [khe.io](https://khe.io) and change your password immediately.',
            recipients: {
              emails: [user.email]
            }
          });
          email.send(false);
          return res.status(200).json({});
        });
      });
  }

};
