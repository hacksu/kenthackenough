/**
* A helper to send mass emails with nodemailer and jade
* @author Paul Dilyard
*
* Usage:
* Prerequisites:
*   - process.env.GMAIL_USERNAME    // => user.name@gmail.com
*   - process.env.GMAIL_PASSWORD    // => password123
*   - process.env.FROM_EMAIL        // => First Last <first.last@example.com>
*
* To create a template:
*   - Create a new folder inside of app/emails with the name of your template
*   - Create two files inside this folder: html.jade and text.txt
*   - Build the HTML version of the template inside html.jade
*   - Build the plaintext version of the template inside text.txt
*
* To send a message:
*   var Message = require('./mailer');
*   var message = new Message({
*     template: 'welcome',
*     subject: 'Welcome',
*     recipients: [
*       {
*         email: 'name@example.com',
*         locals: {
*           localKey: 'localValue'
*         }
*       }
*     ]
*   });
*   message.send();
*/

var path = require('path');
var templatesDir = path.resolve(__dirname, '..', 'emails');
var fs = require('fs');
var jade = require('jade');
var nodemailer = require('nodemailer');
var winston = require('winston');
var flow = require('flow');
var config = require('../../config');

module.exports = function (options) {

    var self = this;
    self.options = options || {};

    return {

      send: function () {

        // Create our transporter object
        var transporter = nodemailer.createTransport({
          service: 'Gmail',
          auth: {
            user: config.gmail.username,
            pass: config.gmail.password
          }
        });

        // Read in html.jade and text.txt
        var pathToHtml = path.resolve(templatesDir, self.options.template, 'html.jade');
        var pathToTxt = path.resolve(templatesDir, self.options.template, 'text.txt');

        flow.exec(
          function () {
            // Read in the jade file
            fs.readFile(pathToHtml, 'utf8', this);
          },
          function (err, data) {
            // Read in the txt file
            if (err) throw err;
            this.html = data;
            fs.readFile(pathToTxt, 'utf8', this);
          },
          function (err, data) {
            if (err) throw err;
            this.txt = data;
            this();
          },
          function () {
            var data = this;
            // Compile the jade file
            var fn = jade.compile(data.html, {filename: pathToHtml});
            // Iterate over our recipients
            for (var i = 0; i < self.options.recipients.length; ++i) {
              var recipient = self.options.recipients[i];
              // Configure the message
              var mailOptions = {
                from: config.gmail.from,
                to: recipient.email,
                subject: self.options.subject,
                text: data.txt,
                html: fn(recipient.locals)
              };
              // Send the email
              transporter.sendMail(mailOptions, function (err, info) {
                if (err) throw err;
                winston.info('Email sent: ' + info.response);
              });
            }
          }
        ); // end of flow

      }

    };

};