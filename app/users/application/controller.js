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
        .findByIdAndUpdate(user.application, req.body, {new: true})
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
          .findByIdAndUpdate(user.application, req.body, {new: true})
          .exec(function (err, application) {
            if (err) return res.internalError();
            if (req.body.status == Application.Status.APPROVED) {
              // Send acceptance email
              new Email({
                subject: 'You\'ve been accepted to KHE!',
                body: '## You\'re invited!\n\n\nCongratulations, you have been accepted to Kent Hack Enough. Please RSVP here: [khe.io/rsvp](https://khe.io/rsvp).\n\n\nUntil then, a few things to note:\n\n\n**What you should bring:**\n- Deodorant\n- Laptop and charger\n- Valid school ID\n- Phone/charger\n- Change of clothes\n- Deodorant\n- Basic toiletries\n- Pillow and blanket\n- Deodorant\n\n\n**Hackers looking for travel reimbursements:** Please submit a request on the contact form of [our website](https://khe.io) and we\'ll get back to you. Hackers may receive travel reimbursement on a first come first serve basis.\n\n\n**Hackers under the age of 18:** Please have a parent/guardian sign our minor waiver [go.khe.io/waiver](http://go.khe.io/waiver) and return that to us at [staff@khe.io](mailto:staff@khe.io) before the event.\n\n\n**Make sure your resume is attached to your application if you\'re looking for full time jobs or internships.** You can edit your application by logging in at [khe.io](https://khe.io)\n\n\nWe\'re looking forward to seeing you on October 9th!\n\n\n\nRegards,\n\nKent Hack Enough Team',
                recipients: {
                  emails: [user.email]
                }
              }).send();
            } else if (req.body.status == Application.Status.WAITLISTED) {
              // Send waitlist email
              new Email({
                subject: 'You have been waitlisted',
                body: 'Hello,\n\nYou have been added to the Kent Hack Enough waitlist. Please standby for further emails, as we will try to accomodate as many hackers from the waitlist as we can. \n\n\n\nRegards,\n\nKent Hack Enough Team',
                recipients: {
                  emails: [user.email]
                }
              }).send();
            } else if (req.body.status == Application.Status.DENIED) {
              // Send denial email
              new Email({
                subject: 'KHE Status: Denied',
                body: 'Hello,\n\nWe\'re sorry to say that you have been denied from Kent Hack Enough. We are trying to accomodate as many hackers as we can, but we just can\'t fit everyone in our venue. Thank you so much for your interest, and please come again next year! \n\n\n\nRegards,\n\nKent Hack Enough Team',
                recipients: {
                  emails: [user.email]
                }
              }).send();
            }
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
* POST /users/application/resume
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

/**
* Retreive a resume
* GET /users/application/resume/:filename
*/
router.get('/users/application/resume/:filename', function (req, res) {
  var file = path.join(__dirname, '../../../uploads', req.params.filename);
  res.download(file);
});

/**
* Search for applications
* GET /users/application/search?q=String
*/
router.get('/users/application/search', User.auth('admin', 'staff'), function (req, res) {
  if (!req.query.q) return res.singleError('You must provide a search query');

  // Search for applications
  Application
    .search(
      req.query.q,
      {limit: 10},
    function (err, data) {
      if (err) return res.internalError();

      // Get the ids of the results
      var ids = data.results.map(function (r) { return r._id; });

      // Find the owners of the applications
      User
        .find({'application': {$in: ids}})
        .select('email role application created')
        .populate('application')
        .exec(function (err, users) {
          if (err) return res.internalError();
          return res.json({results: users});
        });
    });

});