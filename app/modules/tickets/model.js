var mongoose = require('mongoose');
var schema = require('validate');

var Ticket = mongoose.model('Ticket', {
  subject: String,
  body: String,
  replyTo: String,
  open: {type: Boolean, default: true},
  inProgress: {type: Boolean, default: false},
  created: {type: Date, default: Date.now}
});

var validate = function (ticket) {
  var test = schema({
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
    }
  }, {typecast: true, strip: false});
  return test.validate(ticket);
};

module.exports = Ticket;
module.exports.validate = validate;