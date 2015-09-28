'use strict';

let Email = require('./model');
let socket = rootRequire('app/helpers/socket');
let io = socket('/emails', ['admin', 'staff']);

module.exports = {

  /**
  * Send an email
  * POST /emails
  * Auth -> admin
  */
  post: (req, res) => {
    let errors = Email.validate(req.body);
    if (errors.length) return res.multiError(errors, 400);
    let email = new Email(req.body);

    email.send(true, (err, email) => {
      if (err) return res.internalError();
      io.emit('create', email);
      return res.status(201).json(email);
    });
  },

  /**
  * Get a list of sent emails
  * GET /emails
  * Auth -> admin, staff
  */
  get: (req, res) => {
    Email
      .find()
      .exec((err, emails) => {
        if (err) return res.internalError();
        return res.status(200).json({emails: emails});
      });
  },

  /**
  * Delete a sent email
  * DELETE /emails/:id
  * Auth -> admin
  */
  delete: (req, res) => {
    Email
      .findByIdAndRemove(req.params.id)
      .exec((err, email) => {
        if (err) res.internalError();
        let response = {
          _id: email._id
        };
        io.emit('delete', response);
        return res.status(200).json(response);
      });
  }

};
