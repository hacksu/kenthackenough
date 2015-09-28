'use strict';

let Message = require('./model');
let Device = require('../devices/model');
let socket = rootRequire('app/helpers/socket');
let io = socket('/messages');

module.exports = {

  /**
  * Create a new message
  * POST /messages
  * Auth -> admin, staff
  */
  post: (req, res) => {
    let errors = Message.validate(req.body);
    if (errors.length) return res.multiError(errors);

    new Message(req.body).save((err, message) => {
      if (err) return res.internalError();
      io.emit('create', message);
      Device.push('Kent Hack Enough', message.text);
      return res.json(message);
    });
  },

  /**
  * Get a list of messages
  * GET /messages
  */
  find: (req, res) => {
    Message
      .findById(req.params.id)
      .exec((err, message) => {
        if (err) return res.internalError();
        return res.json(message);
      });
  },

  /**
  * Get a single message
  * GET /messages/:id
  */
  get: (req, res) => {
    Message
      .find()
      .sort({created: -1})
      .exec((err, messages) => {
        if (err) return res.internalError();
        return res.json({messages: messages});
      });
  },

  /**
  * Update a message
  * PATCH /messages/:id
  * Auth -> admin, staff
  */
  patch: (req, res) => {
    let errors = Message.validate(req.body);
    if (errors.length) return res.multiError(errors);

    Message
      .findByIdAndUpdate(req.params.id, req.body, {new: true})
      .exec((err, message) => {
        if (err) return res.internalError();
        io.emit('update', message);
        return res.json(message);
      });
  },

  /**
  * Delete a message
  * DELETE /messages/:id
  * Auth -> admin, staff
  */
  delete: (req, res) => {
    Message
      .findByIdAndRemove(req.params.id)
      .exec((err, message) => {
        if (err) return res.internalError();
        let response = {
          _id: message._id
        };
        io.emit('delete', response);
        return res.json(response);
      });
  }

};
