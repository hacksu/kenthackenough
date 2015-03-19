var router = getRouter();
var Email = require('./model');
var User = require('../users/model');

/**
* Send an email
* POST /emails
* Auth -> admin
*/
router.post('/emails', User.auth('admin'), function (req, res) {
  var errors = Email.validate(req.body);
  if (errors.length) return res.multiError(errors);
  req.body.sent = Date.now();
  var email = new Email(req.body);
  email.save(function (err, email) {
    if (err) return res.internalError();
    if (process.env.NODE_ENV == 'production') {
      var message = new Email.Message(email);
      message.send();
    }
    return res.json(email);
  });
});

/**
* Get a list of sent emails
* GET /emails
* Auth -> admin, staff
*/
router.get('/emails', User.auth('admin', 'staff'), function (req, res) {
  Email
    .find()
    .exec(function (err, emails) {
      if (err) return res.internalError();
      return res.json({emails: emails});
    });
});

/**
* Delete a sent email
* DELETE /emails/:id
* Auth -> admin
*/
router.delete('/emails/:id', User.auth('admin'), function (req, res) {
  Email
    .findByIdAndRemove(req.params.id)
    .exec(function (err, email) {
      if (err) res.internalError();
      return res.json({
        _id: email._id
      });
    });
});