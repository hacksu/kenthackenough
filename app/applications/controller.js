var app = getAppInstance();
var User = require('../users/model');
var Application = require('./model');

/**
* Submit application
* POST:
*   name (string), school (string), phone (string), shirt (string),
*   demographic (bool), first (bool), dietary (string),
*   year (string), age (number), gender (string), major (string),
*   conduct (bool), travel (bool), waiver (bool)
*/
app.post('/applications/submit', User.Auth(), function (req, res) {
  var errors = Application.validate(req.body);
  if (errors.length) return res.send({errors: errors});
  if (req.user.application) return res.send({errors: ['You have already submitted your application']});
  var application = new Application(req.body);
  application.save(function (err, a) {
    if (err) return res.send({errors: ['Internal error']});
    req.user.application = a;
    req.user.save(function (err, u) {
      if (err) return res.send({errors: ['Internal error']});
      return res.send(a);
    });
  });
});

/**
* Update application
* POST (all params optional):
*   name (string), school (string), phone (string), shirt (string),
*   demographic (bool), first (bool), dietary (string),
*   year (string), age (number), gender (string), major (string),
*   conduct (bool), travel (bool), waiver (bool)
*/
app.post('/applications/update', User.Auth(), function (req, res) {

});

/**
* RSVP
* Update RSVP status
* POST:
*   going (bool)
*/
app.post('/applications/rsvp', User.Auth(), function (req, res) {

});

/**
* Return the attendee status
*/
app.get('/application', User.Auth(), function (req, res) {

});