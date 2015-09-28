'use strict';

let mongoose = require('mongoose');
let schema = require('validate');

let Ticket = mongoose.model('Ticket', {
  subject: String,
  body: String,
  replyTo: String,
  name: String, // the person's name
  worker: String, // the email of the staff member working on this
  open: {type: Boolean, default: true},
  inProgress: {type: Boolean, default: false},
  created: {type: Date, default: Date.now}
});

function validate(ticket) {
  let test = schema({
    subject: {
      type: 'string',
      required: true,
      message: 'You must provide a subject'
    },
    body: {
      type: 'string',
      required: true,
      message: 'You must provide a body'
    },
    replyTo: {
      type: 'string',
      required: true,
      message: 'You must provide an email address for us to reach you at'
    },
    name: {
      type: 'string',
      required: true,
      message: 'You must provide your name'
    }
  }, {typecast: true, strip: false});
  return test.validate(ticket);
};

module.exports = Ticket;
module.exports.validate = validate;