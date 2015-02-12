var app = getAppInstance();
var User = require('./model');

/**
* Get a list of users
*/
app.get('/users', User.Auth(), function (req, res) {
  User.find({}, 'email role activated', function (err, users) {
    if (err) return res.internalError();
    return res.send(users);
  });
});

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
      user.save(function (err, user) {
        if (err) return res.internalError();
        return res.send({});
      });
    }
  })
});