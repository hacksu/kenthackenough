var mongoose = require('mongoose');
var schema = require('validate');
var config = rootRequire('config/config');
var User = rootRequire('app/users/model');
var sendgrid = require('sendgrid')(config.sendgrid.username, config.sendgrid.password);
var marked = require('marked');

/**
* Schema
*/
var EmailSchema = mongoose.Schema({
  subject: String,
  body: String, // stored as markdown
  sent: {type: Date, default: Date.now},
  recipients: {
    nickname: String, // optional
    emails: [String]
  }
});

/**
* Sends an email using sendgrid
* @param save:bool Whether or not to save the email to the database
* @param callback An optional callback
*/
EmailSchema.methods.send = function (save, callback) {
  if (process.env.NODE_ENV == 'production') {
    var message = new sendgrid.Email({
      from: config.sendgrid.from,
      fromname: config.sendgrid.fromname,
      subject: this.subject,
      text: this.body,
      html: marked(this.body)
    });
    this.recipients.emails.forEach(function (address) {
      message.addTo(address);
    });
    sendgrid.send(message);
  }
  if (save) {
    this.sent = Date.now();
    this.save(function (err, email) {
      callback && callback(err, email);
    });
  } else {
    callback && callback(err);
  }
};

var Email = mongoose.model('Email', EmailSchema);

/**
* Validate a message
*/
var validate = function (email) {

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
    }
  }, {typecast: true, strip: false});

  return test.validate(email);

};

module.exports = Email;
module.exports.validate = validate;