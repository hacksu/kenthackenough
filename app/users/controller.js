var app = getAppInstance();
var User = require('./model');

/**
* Get a list of users
*/
app.get('/users', User.Auth(), function (req, res) {
  User.find({}, 'username email role', function (err, users) {
    if (err) return res.send({error: err.code});
    return res.send(users);
  });
});

/**
* Create a new user
* POST: username, email, password
*/
app.post('/users/register', function (req, res) {
  var salt = User.Helpers.salt();
  var user = new User({
    username: req.body.username,
    email: req.body.email,
    password: User.Helpers.hash(req.body.password, salt),
    role: User.ATTENDEE,
    salt: salt
  });
  user.save(function (err, user) {
    if (err) return res.send({error: err.code});
    return res.send({
      username: user.username
    });
  });
});