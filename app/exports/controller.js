var router = getRouter();
var User = rootRequire('app/users/model');
var csv = require('to-csv');
var help = rootRequire('app/helpers/functions');

/**
* Download a CSV of all attendees
* GET /exports/attendees
* Auth -> admin, staff
*/
router.get('/exports/attendees', function (req, res) {
  User
    .find()
    .select('email application')
    .where({application: {$exists: true}})
    .sort('-created')
    .populate('application')
    .exec(function (err, users) {
      if (err) return res.internalError();
      var list = users.map(function (user) {
        return {
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
          'Status': help.capitalizeFirstLetter(user.application.status) || '',
          'Checked In?': (user.application.checked) ? 'Yes' : 'No'
        };
      });
      res.setHeader('Content-disposition', 'attachment; filename=attendees.csv');
      res.setHeader('Content-type', 'text/csv');
      return res.send(csv(list));
    });
});