'use strict';

let User = rootRequire('app/users/model');
let Application = rootRequire('app/users/application/model');
let csv = require('to-csv');
let help = rootRequire('app/helpers/functions');
let path = require('path');
let zip = require('express-zip');

module.exports = {

  /**
  * Download a CSV of all attendees
  * GET /exports/attendees
  */
  attendees: (req, res) => {
    User
      .find()
      .select('created email application')
      .where({application: {$exists: true}})
      .sort('-created')
      .populate({
        path: 'application',
        match: req.query
      })
      .exec((err, users) => {
        if (err) return res.internalError();
        if (!users || !users.length) return res.clientError('No attendees match that query');
        let list = users.map((user) => {
          return {
            'Registered': new Date(user.created).toUTCString(),
            'Name': user.application.name || '',
            'Email': user.email || '',
            'Phone': user.application.phone || '',
            'School': user.application.school || '',
            'Major': user.application.major || '',
            'Year': user.application.year || '',
            'Age': user.application.age || '',
            'Gender': help.capitalizeFirstLetter(user.application.gender) || '',
            'Shirt Size': user.application.shirt || '',
            'RSVPd?': (user.application.going) ? 'Yes' : 'No',
            'Link': user.application.link || '',
            'First Time Hacker': user.application.first ? 'Yes' : 'No',
            'Status': help.capitalizeFirstLetter(user.application.status) || '',
            'Checked In?': (user.application.checked) ? 'Yes' : 'No',
            'Conduct': user.application.conduct ? 'Yes' : 'No',
            'MLH Emails': user.application.mlh_emails ? 'Yes' : 'No',
          };
        });
        res.setHeader('Content-disposition', 'attachment; filename=attendees.csv');
        res.setHeader('Content-type', 'text/csv');
        return res.status(200).send(csv(list));
      });
  },

  /**
  * Download a resume book
  * GET /exports/resumes
  */
  resumes: (req, res) => {
    Application
      .find(req.query)
      .select('resume name')
      .exec((err, applications) => {
        if (err) return res.internalError();

        let files = applications.filter((application) => {
          return application.resume && application.resume.length > 0 && application.resume.length <= 40;
        }).map((application) => {

          // normalize file names
          let newName = titleCase(application.name).replace(/\s/g, '');
          let newExt = path.extname(application.resume);
          let a = {
            path: path.join(__dirname, '../../resumes/', application.resume),
            name: newName + newExt
          };
		  console.log(a);
		  return a;

        });

        return res.zip(files);

      });
  }

};

function titleCase(str) {
  return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}
