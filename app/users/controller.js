var app = getAppInstance();
var User = require('./model');

/**
* Create a new user
* POST: email, password
*/
app.post('/users/register', function (req, res) {
  var errors = User.validate(req.body);
  if (errors.length) return res.multiError(errors);
  var salt = User.Helpers.salt();
  var user = new User({
    email: req.body.email,
    password: User.Helpers.hash(req.body.password, salt),
    role: User.ATTENDEE,
    salt: salt,
    activated: false
  });
  user.save(function (err, user) {
    if (err) return res.internalError();
    return res.send({
      _id: user._id,
      email: user.email
    });
  });
});

/**
* Acivate a user
* URL param: userId
*/
app.get('/users/activate/:userId', function (req, res) {
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
app.get('/users', User.Auth([User.ADMIN, User.STAFF]), function (req, res) {
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
* Unsubscribe a user from the mailing list
* AUTH: admin, staff
* POST: userId
*/
app.post('/users/unsubscribe', User.Auth([User.ADMIN, User.STAFF]), function (req, res) {
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
app.post('/users/delete', User.Auth([User.ADMIN]), function (req, res) {
  User.findByIdAndRemove(req.body.userId, function (err) {
    if (err) return res.internalError();
    return res.send({});
  });
});