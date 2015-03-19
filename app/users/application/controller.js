var router = getRouter();
var io = getIo();
var User = require('../model');
var Application = require('./model');
var extend = require('extend');

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
      var application = new Application(req.body);
      application.save(function (err, application) {
        if (err) return res.internalError();
        user.application = application._id;
        user.save(function (err, user) {
          if (err) res.internalError();
          return res.json({
            _id: user._id,
            email: user.email,
            role: user.role,
            created: user.created,
            application: application
          });
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
  User
    .findByIdAndUpdate(req.user._id)
    .select('email application role created')
    .exec(function (err, user) {
      if (err) return res.internalError();
      Application
        .findByIdAndUpdate(user.application, req.body)
        .exec(function (err, application) {
          return res.json({
            _id: user._id,
            email: user.email,
            role: user.role,
            created: user.created,
            application: application
          });
        });
    });
});

/**
* Partially update a user's application by ID
* PATCH /users/:id/application
* Auth -> admin, staff
*/
router.patch('/users/:id/application', User.auth('admin', 'staff'), function (req, res) {
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
            return res.json({
              _id: user._id,
              email: user.email,
              role: user.role,
              created: user.created,
              application: application
            });
          });
      } else {
        var application = new Application(req.body);
        application.created = Date.now();
        application.save(function (err, application) {
          if (err) return res.internalError();
          return res.json({
            _id: user._id,
            email: user.email,
            role: user.role,
            created: user.created,
            application: application
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
        .findById(user.application)
        .remove()
        .exec(function (err) {
          if (err) return res.internalError();
          return res.json({_id: req.user._id});
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
        .findById(user.application)
        .remove()
        .exec(function (err) {
          if (err) return res.internalError();
          return res.json({_id: req.params.id});
        });
    });
});