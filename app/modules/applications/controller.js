var router = getRouter();
var io = getIo();
var User = require('../users/model');
var Application = require('./model');
var chance = require('chance')();
var schema = require('validate');
var Message = require('../../helpers/mailer');

/**
* Submit application
* AUTH: any user
* POST:
*   name (string), school (string), phone (string), shirt (string),
*   demographic (bool), first (bool), dietary (string, separate each by |),
*   year (string), age (number), gender (string), major (string),
*   conduct (bool), travel (bool), waiver (bool)
*/
router.post('/application/submit', User.Auth(), function (req, res) {
  if (req.user.application.submitted) return res.singleError('You have already submitted your application');
  var errors = Application.validate(req.body);
  if (errors.length) return res.multiError(errors);
  req.user.application = req.body;
  if (req.body.dietary) req.user.application.dietary = req.body.dietary.split('|');
  req.user.application.submitted = true;
  req.user.application.status = Application.PENDING;
  req.user.application.time = Date.now();
  req.user.save(function (err, u) {
    if (err) return res.internalError();
    if (provess.env.NODE_ENV == 'production') {
      sendApplicationEmail(u);
    }
    return res.send(u.application);
  });
});

/**
* Update application
* AUTH: any user
* POST (all params are required, submit old data if you want it to stay):
*   name (string), school (string), phone (string), shirt (string),
*   demographic (bool), first (bool), dietary (string, separate each by |),
*   year (string), age (number), gender (string), major (string),
*   conduct (bool), travel (bool), waiver (bool)
*/
router.post('/application/update', User.Auth(), function (req, res) {
  if (!req.user.application.submitted) return res.singleError('You haven\'t submitted an application yet');
  var errors = Application.validate(req.body);
  if (errors.length) return res.multiError(errors);
  var oldStatus = req.user.application.status;
  var oldTime = req.user.application.time;
  req.user.application = req.body;
  if (req.body.dietary) req.user.application.dietary = req.body.dietary.split('|');
  req.user.application.submitted = true;
  req.user.application.status = oldStatus;
  req.user.application.time = oldTime;
  req.user.save(function (err, u) {
    if (err) return res.internalError();
    return res.send(u.application);
  });
});

/**
* Update RSVP status
* AUTH: any user
* POST:
*   going (bool)
*/
router.post('/application/rsvp', User.Auth(), function (req, res) {
  if (req.user.application.status == Application.APPROVED) {
    req.user.application.going = req.body.going;
    req.user.save(function (err, user) {
      if (err) return res.internalError();
      return res.send(user.application);
    });
  } else {
    return res.singleError('Your application has not been approved');
  }
});

/**
* Return the attendee status
* AUTH: any user
*/
router.get('/application', User.Auth(), function (req, res) {
  if (req.user.application.submitted) {
    return res.send(req.user.application);
  } else {
    return res.singleError('You have not submitted an application yet');
  }
});

/**
* Update an application by ID
* AUTH: staff, admin
* URL params: id A user's ID
* POST: the parts of the application to update (any part)
*/
router.post('/application/update/:id', User.Auth([User.ADMIN, User.STAFF]), function (req, res) {
  var update = {};
  if (req.body.submitted !== undefined) update["application.submitted"] = req.body.submitted;
  if (req.body.status) update["application.status"] = req.body.status;
  if (req.body.going !== undefined) update["application.going"] = req.body.going;
  if (req.body.checked !== undefined) update["application.checked"] = req.body.checked;
  if (req.body.time) update["application.time"] = req.body.time;
  if (req.body.door !== undefined) update["application.door"] = req.body.door;
  if (req.body.name) update["application.name"] = req.body.name;
  if (req.body.school) update["application.school"] = req.body.school;
  if (req.body.phone) update["application.phone"] = req.body.phone;
  if (req.body.shirt) update["application.shirt"] = req.body.shirt;
  if (req.body.demographic !== undefined) update["application.demographic"] = req.body.demographic;
  if (req.body.first !== undefined) update["application.first"] = req.body.first;
  if (req.body.dietary) update["application.dietary"] = req.body.dietary;
  if (req.body.year) update["application.year"] = req.body.year;
  if (req.body.age) update["application.age"] = req.body.age;
  if (req.body.gender) update["application.gender"] = req.body.gender;
  if (req.body.major) update["application.major"] = req.body.major;
  if (req.body.conduct !== undefined) update["application.conduct"] = req.body.conduct;
  if (req.body.travel !== undefined) update["application.travel"] = req.body.travel;
  if (req.body.waiver !== undefined) update["application.waiver"] = req.body.waiver;
  User.findOneAndUpdate({_id: req.params.id}, {$set: update}, function (err, user) {
    if (err) return res.internalError();
    io.emit('/application/update', user);
    return res.send(user);
  });
});

/**
* Remove a user's application (gently)
* Sets application.submitted to false
* AUTH: staff, admin
* POST: userId
*/
router.post('/application/remove', User.Auth([User.ADMIN, User.STAFF]), function (req, res) {
  return res.send('Method stub');
});

/**
* Quickly register a user
* (Use for people who show up without registering)
* AUTH: staff, admin
* POST: name, email, phone
*/
router.post('/application/quick', User.Auth([User.ADMIN, User.STAFF]), function (req, res) {
  var test = schema({
    name: {
      required: true,
      type: 'string',
      match: /.{2,32}/,
      message: 'Your name is required'
    },
    email: {
      type: 'string',
      required: true,
      message: 'A valid email address is required'
    },
    phone: {
      required: true,
      type: 'number',
      match: /^[0-9]{10,20}$/,
      message: 'You must provide a valid phone number'
    }
  }, {typecast: true});
  var errors = test.validate(req.body);
  if (errors.length) return res.multiError(errors);
  var salt = User.Helpers.salt();
  var user = new User({
    email: req.body.email,
    role: User.ATTENDEE,
    password: User.Helpers.hash(chance.string(), salt),
    salt: salt,
    activated: true,
    application: {
      name: req.body.name,
      phone: req.body.phone,
      submitted: true,
      status: Application.APPROVED,
      going: true,
      checked: true,
      time: Date.now(),
      demographic: true,
      conduct: true,
      travel: false,
      waiver: true,
      door: true
    }
  });
  user.save(function (err, user) {
    if (err) return res.internalError();
    io.emit('/application/quick', user);
    return res.send(user);
  });
});

/**
* Helper methods to clean up routes
*/

function sendApplicationEmail(user) {
  var message = new Message({
    template: 'application',
    subject: 'Kent Hack Enough Application',
    recipients: [{
      email: user.email,
      locals: {
        name: {
          first: user.application.name.split(' ')[0],
          last: user.application.name.split(' ')[1]
        }
      }
    }]
  });
  message.send();
}