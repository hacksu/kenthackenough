var mongoose = require('mongoose');
var schema = require('validate');
var path = require('path');
var templateDir = path.resolve(__dirname, '../../', 'emails/general');
var fs = require('fs');
var jade = require('jade');
var nodemailer = require('nodemailer');
var winston = require('winston');
var config = rootRequire('config/config');
var flow = require('flow');
var User = rootRequire('app/users/model');

/**
* A mass email's schema
*/
var Email = mongoose.model('Email', {
  subject: String,
  body: String,       // stored as markdown
  sent: {type: Date, default: Date.now},
  recipients: {
    nickname: String,
    emails: [String],
    where: mongoose.Schema.Types.Mixed
  }
});

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

/**
* A way to actually send an Email object
* Usage:
*   var message = new Email.Message(email);
*   var message.send();
*/
var Message = function (Email) {

  var self = this;
  self.email = Email;

  // Create our transporter object
  var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: config.gmail.username,
      pass: config.gmail.password
    }
  });

  // Read in the jade and text file
  var pathToHtml = path.resolve(templateDir, 'html.jade');
  var pathToTxt = path.resolve(templateDir, 'text.txt');
  var pathToMd = path.resolve(templateDir, 'content.md');
  var html = fs.readFileSync(pathToHtml, 'utf-8');
  var txt = fs.readFileSync(pathToTxt, 'utf-8');

  // Replace the <replace> tag with the markdown in the raw text file
  var finalTxt = txt.replace('<replace>', self.email.body);

  // Write the markdown to the file that is included in our jade template
  fs.writeFileSync(pathToMd, self.email.body);

  // Compile the jade into html
  var fn = jade.compile(html, {filename: pathToHtml});
  var compiledHtml = fn();

  return {
    send: function () {
      flow.exec(function () {
        // Get a list of recipients
        var next = this;
        if (self.email.recipients.emails.length) {
          // We have an array of email addresses
          next(self.email.recipients.emails);
        } else {
          // We have a query that we'll need to run to find email addresses
          User.find(self.email.recipients.where, 'email', function (err, users) {
            var emails = [];
            for (var i = 0; i < users.length; i++) {
              emails.push(users[i].email);
            }
            next(emails);
          });
        }
      }, function (emails) {
        for (var i = 0; i < emails.length; i++) {
          // Configure the message
          var mailOptions = {
            from: config.gmail.from,
            to: emails[i],
            subject: self.email.subject,
            text: finalTxt,
            html: compiledHtml
          };
          // Send the email
          transporter.sendMail(mailOptions, function (err, info) {
            if (err) throw err;
            winston.info('Email sent: ' + info.response);
          });
        }
      });
    }
  };

};

module.exports = Email;
module.exports.validate = validate;
module.exports.Message = Message;