var router = getRouter();
var User = require('./model');
var Message = require('../../helpers/mailer');

/**
* Create a new user
* POST: email, password
*/
router.post('/users/register', function (req, res) {
  var errors = User.validate(req.body);
  if (errors.length) return res.multiError(errors);
  var salt = User.Helpers.salt();
  var user = new User({
    email: req.body.email,
    password: User.Helpers.hash(req.body.password, salt),
    role: User.ATTENDEE,
    salt: salt,
    activated: false,
    time: Date.now()
  });
  user.save(function (err, user) {
    if (err) return res.singleError('That email is already in use');
    sendRegistrationEmail(user.email);
    return res.send({
      _id: user._id,
      email: user.email,
      password: req.body.password,
      role: user.role
    });
  });
});

/**
* Check login credentials
* POST: email, password
*/
router.post('/users/login', function (req, res) {
  User.findOne({email: req.body.email}, function (err, user) {
    if (err || !user) return res.singleError('Username or password incorrect');
    if (User.Helpers.checkPassword(user.password, req.body.password, user.salt)) {
      return res.send({
        email: user.email,
        password: req.body.password,
        role: user.role
      });
    } else {
      return res.singleError('Username or password incorrect');
    }
  });
});

/**
* Acivate a user
* URL param: userId
*/
router.get('/users/activate/:userId', function (req, res) {
  User.findById(req.params.userId, function (err, user) {
    if (err) return res.internalError();
    if (user.activated) {
      return res.singleError('User is already activated');
    } else {
      user.activated = true;
      user.subscribe = true;
      user.save(function (err, user) {
        if (err) return res.internalError();
        return res.send({});
      });
    }
  })
});

/**
* Get a list of all users
* AUTH: admin, staff
*/
router.get('/users', User.Auth([User.ADMIN, User.STAFF]), function (req, res) {
  User
    .find({})
    .sort({'application.submitted': 1})
    .sort({'application.time': 1})
    .exec(function (err, users) {
    if (err) return res.internalError();
    return res.send({users: users});
  });
});

/**
* Update a user's role by id
* AUTH: admin
* URL param: id A user's ID
* POST: role The new role to set
*/
router.post('/users/role/:id', User.Auth([User.ADMIN]), function (req, res) {
  User.findById(req.params.id, function (err, user) {
    if (err) return res.singleError('User not found');
    user.role = req.body.role;
    user.save(function (err, user) {
      if (err) return res.internalError();
      return res.send({
        email: user.email,
        role: user.role
      });
    });
  });
});

/**
* Unsubscribe a user from the mailing list
* AUTH: admin, staff
* POST: userId
*/
router.post('/users/unsubscribe', User.Auth([User.ADMIN, User.STAFF]), function (req, res) {
  User.findById(req.body.userId, function (err, user) {
    if (err) return res.internalError();
    user.subscribe = false;
    user.save(function (err, user) {
      if (err) return res.internalError();
      return res.send(user);
    });
  });
});

/**
* Completely delete a user (for emergencies)
* AUTH: admin
* POST: userId
*/
router.post('/users/delete', User.Auth([User.ADMIN]), function (req, res) {
  User.findByIdAndRemove(req.body.userId, function (err) {
    if (err) return res.internalError();
    return res.send({});
  });
});

/**
* Helper methods to shorten routes
*/

function sendRegistrationEmail(email) {
  var message = new Message({
    template: 'registration',
    subject: 'Kent Hack Enough Registration',
    recipients: [{email: email}]
  });
  message.send();
}