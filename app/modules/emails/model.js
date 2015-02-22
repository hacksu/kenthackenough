var mongoose = require('mongoose');
var schema = require('validate');

var Email = mongoose.schema('Email', {
  subject: String,
  body: String,       // stored as markdown
  sent: Date,
  recipients: {
    nickname: String,
    emails: [String],
    where: mongoose.Schema.Types.Mixed
  }
});

var validate = function (email) {

  var test = schema({
    subject: {
      type: 'string',
      required: true
    },
    body: {
      type: 'string',
      required: true
    }
  }, {typecast: true, strip: false});

  return test.validate(email);

};

module.exports = Email;
module.exports.validate = validate;