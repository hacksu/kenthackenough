var app = getAppInstance();
var User = require('../users/model');
var Application = require('./model');

/**
* Submit application
* POST:
*   name (string), school (string), phone (string), shirt (string),
*   demographic (bool), first (bool), dietary (string, separate each by |),
*   year (string), age (number), gender (string), major (string),
*   conduct (bool), travel (bool), waiver (bool)
*/
app.post('/applications/submit', User.Auth(), function (req, res) {
  if (req.user.application.submitted) return res.singleError('You have already submitted your application');
  var errors = Application.validate(req.body);
  if (errors.length) return res.multiError(errors);
  if (req.body.dietary) req.user.application.dietary = req.body.dietary.split('|');
  req.user.application = req.body;
  req.user.application.submitted = true;
  req.user.save(function (err, u) {
    if (err) return res.internalError();
    return res.send(u.application);
  });
});

/**
* Update application
* POST (all params are required, submit old data if you want it to stay):
*   name (string), school (string), phone (string), shirt (string),
*   demographic (bool), first (bool), dietary (string, separate each by |),
*   year (string), age (number), gender (string), major (string),
*   conduct (bool), travel (bool), waiver (bool)
*/
app.post('/applications/update', User.Auth(), function (req, res) {
  if (!req.user.application.submitted) return res.singleError('You haven\'t submitted an application yet');
  var errors = Application.validate(req.body);
  if (errors.length) return res.multiError(errors);
  if (req.body.dietary) req.body.dietary = req.body.dietary.split('|');
  req.user.application = req.body;
  req.user.application.submitted = true;
  req.user.save(function (err, u) {
    if (err) return res.internalError();
    return res.send(u.application);
  });
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