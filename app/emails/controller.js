var router = getRouter();
var Email = require('./model');
var User = require('../users/model');

/**
* Send an email
* POST: (see docs)
* AUTH: admin, staff
*/
router.post('/emails/send', User.Auth([User.ADMIN]), function (req, res) {
  var errors = Email.validate(req.body);
  if (errors.length) return res.multiError(errors);
  req.body.sent = Date.now();
  var email = new Email(req.body);
  email.save(function (err, email) {
    if (err) return res.internalError();
    var message = new Email.Message(email);
    message.send();
    return res.send({});
  });
});

/**
* Get a list of emails
* AUTH: admin, staff
*/
router.get('/emails', User.Auth([User.ADMIN, User.STAFF]), function (req, res) {
  Email.find({}, function (err, emails) {
    if (err) return res.internalError();
    return res.send({emails: emails});
  });
});