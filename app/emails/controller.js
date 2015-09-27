'use strict';

var router = getRouter();
var socket = rootRequire('app/helpers/socket');
var io = socket('/emails', ['admin', 'staff']);
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
  var email = new Email(req.body);
  email.send(true, function (err, email) {
    if (err) return res.internalError();
    io.emit('create', email);
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
      var response = {
        _id: email._id
      };
      io.emit('delete', response);
      return res.json(response);
    });
});