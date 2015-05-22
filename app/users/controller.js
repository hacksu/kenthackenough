var router = getRouter();
var socket = rootRequire('app/helpers/socket');
var io = socket('/users', ['admin', 'staff']);
var User = require('./model');
var Application = require('./application/model');
var Email = rootRequire('app/emails/model');
var schema = require('validate');
var config = rootRequire('config/config');
var uuid = require('uuid');

/**
* Create a new user
* POST /users
*/
router.post('/users', function (req, res) {
  var errors = User.validate(req.body);
  if (errors.length) return res.multiError(errors);

  if (config.clients.indexOf(req.body.client) < 0) return res.singleError('Invalid client ID');

  var salt = User.Helpers.salt();
  var token = User.Helpers.token();
  var refresh = User.Helpers.token();
  var expires = User.Helpers.expires();

  var user = new User({
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

  user.save(function (err, user) {
    if (err) return res.singleError('That email is already in use');

    User.Helpers.cache(user, token, expires);

    if (process.env.NODE_ENV == 'production') {
      sendRegistrationEmail(user.email);
    }

    io.emit('create', {
      _id: user._id,
      email: user.email
    });

    return res.json({
      role: user.role,
      key: user._id,
      token: token,
      refresh: refresh,
      expires: new Date(expires)
    });
  });
});

/**
* Quickly create a fully applied user (for registering at the door)
* POST /users/quick
* Auth -> admin, staff
*/
router.post('/users/quick', User.auth('admin', 'staff'), function (req, res) {
  var test = schema({
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
  var errors = test.validate(req.body);
  if (errors.length) return res.multiError(errors);
  var application = new Application({
    name: req.body.name,
    phone: req.body.phone,
    door: true,
    going: true,
    status: Application.Status.APPROVED,
    checked: true,
    created: Date.now()
  });
  application.save(function (err, app) {
    if (err) return res.internalError();

    var salt = User.Helpers.salt();
    var pass = User.Helpers.salt();
    var user = new User({
      email: req.body.email.toLowerCase(),
      password: User.Helpers.hash(pass, salt),
      salt: salt,
      created: Date.now(),
      application: app._id,
      role: 'attendee'
    });
    user.save(function (err, user) {
      if (err) return res.singleError('That email is already in use');

      if (process.env.NODE_ENV == 'production') {
        sendRegistrationEmail(user.email);
      }

      var response = {
        _id: user._id,
        email: user.email,
        role: user.role,
        created: user.created,
        application: app
      };
      io.emit('create', response);
      return res.json(response);
    });

  });
});

/**
* Get a key and token
* POST /users/token
*/
router.post('/users/token', function (req, res) {
  var errors = User.validate(req.body);
  if (errors.length) return res.multiError(errors);

  if (config.clients.indexOf(req.body.client) < 0) return res.singleError('Invalid client ID');

  User
    .findOne()
    .where({email: req.body.email.toLowerCase()})
    .exec(function (err, user) {
      if (err || !user) return res.singleError('Email or password incorrect');

      if (User.Helpers.checkPassword(user.password, req.body.password, user.salt)) {

        // get tokens for this client
        var t;
        for (var i = 0; i < user.tokens.length; ++i) {
          if (user.tokens[i].client == req.body.client) {
            t = user.tokens[i];
            break;
          }
        }

        if (t) {
          // we already have a token for this client
          t.expires = User.Helpers.expires();
          user.save(function (err, user) {
            if (err) return res.internalError();
            User.Helpers.cache(user, t.token, new Date(t.expires).getTime());
            return res.json({
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
            var token = User.Helpers.token();
            var refresh = User.Helpers.token();
            var expires = User.Helpers.expires();
            user.tokens.push({
              client: req.body.client,
              token: token,
              refresh: refresh,
              expires: expires
            });
            user.save(function (err, user) {
              if (err) return res.internalError();
              User.Helpers.cache(user, token, expires);
              return res.json({
                role: user.role,
                key: user._id,
                token: token,
                refresh: refresh,
                expires: new Date(expires)
              });
            });
          } else {
            // not a valid client
            return res.singleError('Invalid client ID');
          }

        }

      } else {
        return res.singleError('Email or password incorrect');
      }
    });
});

/**
* Refresh a token
* POST /users/token/refresh
* Auth
*/
router.post('/users/token/refresh', function (req, res) {
  if (config.clients.indexOf(req.body.client) < 0) return res.singleError('Invalid client ID');

  User
    .findById(req.body.key)
    .exec(function (err, user) {
      if (err) return res.internalError();

      var token = User.Helpers.token();
      var refresh = User.Helpers.token();
      var expires = User.Helpers.expires();

      if (!user.tokens.length) return res.singleError('Invalid refresh token');

      for (var i = 0; i < user.tokens.length; ++i) {
        if (user.tokens[i].client == req.body.client) {
          if (user.tokens[i].refresh == req.body.refresh) {
            user.tokens[i].token = token;
            user.tokens[i].refresh = refresh;
            user.tokens[i].expires = expires;
          } else {
            return res.singleError('Invalid refresh token');
          }
          break;
        }
      }
      user.save(function (err, user) {
        if (err) return res.internalError();
        User.Helpers.cache(user, token, expires);
        return res.json({
          role: user.role,
          key: user._id,
          token: token,
          refresh: refresh,
          expires: new Date(expires)
        });
      });
    });
});

/**
* Remove a token
* DELETE /users/token
* Auth
*/
router.delete('/users/token', User.auth(), function (req, res) {
  User
    .findById(req.user._id)
    .exec(function (err, user) {
      if (err || !user) return res.internalError();

      for (var i = 0; i < user.tokens.length; ++i) {
        if (user.tokens[i].client == req.body.client) {
          user.tokens.splice(i, 1);
          break;
        }
      }

      user.save(function (err, user) {
        if (err) return res.internalError();
        User.Helpers.uncache(user, req.user.token, function () {
          return res.json({});
        });
      });
    });
});

/**
* Get a list of all users
* GET /users
* Auth -> admin, staff
*/
router.get('/users', User.auth('admin', 'staff'), function (req, res) {
  User
    .find()
    .select('email role permissions created')
    .exec(function (err, users) {
      if (err) return res.internalError();
      return res.json({
        users: users
      });
    });
});

/**
* Get a user by ID
* GET /users/:id
* Auth -> admin, staff
*/
router.get('/users/:id', User.auth('admin', 'staff'), function (req, res) {
  User
    .findById(req.params.id)
    .select('email role created')
    .exec(function (err, user) {
      if (err) return res.internalError();
      return res.json(user);
    });
});

/**
* Partially update the logged in user
* PATCH /users
* Auth
*/
router.patch('/users', User.auth(), function (req, res) {
  User
    .findById(req.user._id)
    .exec(function (err, user) {
      if (err) return res.internalError();
      if (req.body.email) {
        user.email = req.body.email.toLowerCase();
      }
      if (req.body.password) {
        user.salt = User.Helpers.salt();
        user.password = User.Helpers.hash(req.body.password, user.salt);
      }
      user.save(function (err) {
        if (err) return res.singleError('That email is already taken');
        var response = {
          _id: user._id,
          email: user.email
        };
        io.emit('update', response);
        return res.json(response);
      });
    });
});

/**
* Partially update a user by ID
* PATCH /users/:id
* Auth -> admin
*/
router.patch('/users/:id', User.auth('admin'), function (req, res) {
  if (req.body.email) req.body.email = req.body.email.toLowerCase();
  User
    .findByIdAndUpdate(req.params.id, req.body)
    .exec(function (err, user) {
      if (err) return res.internalError();
      var response = {
        _id: user._id,
        email: user.email,
        role: user.role,
        created: user.created
      };
      io.emit('update', response);
      return res.json(response);
    });
});

/**
* Delete a user
* DELETE /users/:id
* Auth -> admin
*/
router.delete('/users/:id', User.auth('admin'), function (req, res) {
  User
    .findById(req.params.id)
    .remove()
    .exec(function (err) {
      if (err) return res.internalError();
      var response = {
        _id: req.params.id
      };
      io.emit('delete', response);
      return res.json(response);
    });
});

/**
* Send a password reset email
* POST /users/reset
*/
router.post('/users/reset', function (req, res) {
  User
    .findOne({email: req.body.email})
    .exec(function (err, user) {
      if (err) return res.internalError();
      var random = uuid.v4().substr(0, 8);
      var newSalt = User.Helpers.salt();
      var newHash = User.Helpers.hash(random, newSalt);
      user.salt = newSalt;
      user.password = newHash;
      user.save(function (err) {
        if (err) return res.internalError();
        var email = new Email({
          subject: '[KHE] Password reset',
          body: '# Kent Hack Enough \n ## Password Reset \n Your password has been reset. Your new password is: "' + random + '". Please login at [khe.io](https://khe.io) and change your password immediately.',
          recipients: {
            emails: [user.email]
          }
        });
        email.send(false);
        return res.json({});
      });
    });
});