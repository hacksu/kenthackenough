var router = getRouter();
var socket = rootRequire('app/helpers/socket');
var io = socket('/users/application', ['admin', 'staff']);
var User = require('../model');
var Application = require('./model');
var Email = rootRequire('app/emails/model');
var extend = require('extend');
var multiparty = require('multiparty');
var fs = require('fs');
var path = require('path');
var uuid = require('uuid');

/**
* Create an application
* POST /users/application
* Auth
*/
router.post('/users/application', User.auth(), function (req, res) {
  User
    .findById(req.user._id)
    .select('email application role created')
    .exec(function (err, user) {
      if (err) return res.internalError();
      if (user.application) return res.singleError('You have already submitted an application');
      var errors = Application.validate(req.body);
      if (errors.length) return res.multiError(errors);
      extend(req.body, {
        status: Application.Status.PENDING,
        going: false,
        checked: false,
        created: Date.now(),
        door: false
      });
      if (req.body.dietary) req.body.dietary = req.body.dietary.split('|');
      var application = new Application(req.body);
      application.save(function (err, application) {
        if (err) return res.internalError();
        user.application = application._id;
        user.save(function (err, user) {
          if (err) res.internalError();

          if (process.env.NODE_ENV == 'production') {
            var email = new Email({
              subject: 'Your Kent Hack Enough Application',
              body: '# Thanks for applying to Kent Hack Enough!\nWe appreciate your interest.',
              recipients: {
                emails: [user.email]
              }
            });
            email.send(false);
          }

          var response = {
            _id: user._id,
            email: user.email,
            role: user.role,
            created: user.created,
            application: application
          };
          io.emit('create', response);
          return res.json(response);
        });
      });
    });
});

/**
* Get the logged in user with their application
* GET /users/me/application
* Auth
*/
router.get('/users/me/application', User.auth(), function (req, res) {
  User
    .findById(req.user._id)
    .select('email application role created')
    .populate('application')
    .exec(function (err, user) {
      if (err) return res.internalError();
      return res.json(user);
    });
});

/**
* Get a list of users with their applications
* GET /users/application
* Auth -> admin, staff
*/
router.get('/users/application', User.auth('admin', 'staff'), function (req, res) {
  User
    .find()
    .select('email application role created')
    .populate('application')
    .exec(function (err, users) {
      if (err) return res.internalError();
      return res.json({users: users});
    });
});

/**
* Get a user by ID with their application
* GET /users/:id/application
* Auth -> admin, staff
*/
router.get('/users/:id/application', User.auth('admin', 'staff'), function (req, res) {
  User
    .findById(req.params.id)
    .select('email application role created')
    .populate('application')
    .exec(function (err, user) {
      if (err) return res.internalError();
      return res.json(user);
    });
});

/**
* Partially update the logged in user's application
* PATCH /users/me/application
* Auth
*/
router.patch('/users/me/application', User.auth(), function (req, res) {
  var errors = Application.validate(req.body);
  if (errors.length) return res.multiError(errors);
  if (req.body.dietary) {
    req.body.dietary = req.body.dietary.split('|');
  } else {
    req.body.dietary = [];
  }
  User
    .findByIdAndUpdate(req.user._id)
    .select('email application role created')
    .exec(function (err, user) {
      if (err) return res.internalError();
      Application
        .findByIdAndUpdate(user.application, req.body)
        .exec(function (err, application) {
          var response = {
            _id: user._id,
            email: user.email,
            role: user.role,
            created: user.created,
            application: application
          };
          io.emit('update', response);
          return res.json(response);
        });
    });
});

/**
* Partially update a user's application by ID
* PATCH /users/:id/application
* Auth -> admin, staff
*/
router.patch('/users/:id/application', User.auth('admin', 'staff'), function (req, res) {
  if (req.body.dietary) req.body.dietary = req.body.dietary.split('|');
  User
    .findById(req.params.id)
    .select('email application role created')
    .exec(function (err, user) {
      if (err) return res.internalError();
      if (user.application) {
        Application
          .findByIdAndUpdate(user.application, req.body)
          .exec(function (err, application) {
            if (err) return res.internalError();
            var response = {
              _id: user._id,
              email: user.email,
              role: user.role,
              created: user.created,
              application: application
            };
            io.emit('update', response);
            return res.json(response);
          });
      } else {
        var application = new Application(req.body);
        application.created = Date.now();
        application.save(function (err, application) {
          user.application = application;
          user.save(function (err, user) {
            if (err) return res.internalError();
            var response = {
              _id: user._id,
              email: user.email,
              role: user.role,
              created: user.created,
              application: application
            };
            io.emit('update', response);
            return res.json(response);
          });
        });
      }
    });
});

/**
* Delete the logged in user's application
* DELETE /users/me/application
* Auth
*/
router.delete('/users/me/application', User.auth(), function (req, res) {
  User
    .findById(req.user._id)
    .select('application')
    .exec(function (err, user) {
      if (err) return res.internalError();
      Application
        .findByIdAndRemove(user.application)
        .exec(function (err) {
          if (err) return res.internalError();
          var response = {_id: req.user._id};
          io.emit('delete', response);
          return res.json(response);
        });
    });
});

/**
* Delete a user's application by ID
* DELETE /users/:id/application
* Auth -> admin, staff
*/
router.delete('/users/:id/application', User.auth('admin', 'staff'), function (req, res) {
  User
    .findById(req.params.id)
    .select('application')
    .exec(function (err, user) {
      if (err) return res.internalError();
      Application
        .findByIdAndRemove(user.application)
        .exec(function (err) {
          if (err) return res.internalError();
          var response = {_id: req.params.id};
          io.emit('delete', response);
          return res.json(response);
        });
    });
});

/**
* Upload a resume
*/
router.post('/users/application/resume', function (req, res) {
  var form = new multiparty.Form();
  form.parse(req, function (err, fields, files) {
    if (err || !files.resume) return res.internalError();
    fs.readFile(files.resume[0].path, function (err, data) {
      if (err) return res.internalError();
      var ext = path.extname(files.resume[0].path);
      var name = uuid.v4();
      var dest = path.join(__dirname, '../../../uploads/' + name + ext);
      fs.writeFile(dest, data, function (err) {
        if (err) return res.internalError();
        return res.json({
          filename: name + ext
        });
      });
    });
  });
});