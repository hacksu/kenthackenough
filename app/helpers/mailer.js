var path = require('path');
var templatesDir = path.resolve(__dirname, '..', 'emails');
var emailTemplates = require('email-templates');
var nodemailer = require('nodemailer');
var winston = require('winston');

module.exports = function () {

  emailTemplates(templatesDir, function (err, template) {
    if (err) {
      winston.error(err);
    } else {



    }
  })

};