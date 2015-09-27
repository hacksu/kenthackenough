'use strict';

var router = getRouter();
var socket = rootRequire('app/helpers/socket');
var io = socket('/about');
var User = rootRequire('app/users/model');
var About = require('./model');

/**
* Create or update the about page
* PUT /about
* Auth -> admin, staff
*/
router.put('/about', User.auth('admin', 'staff'), function (req, res) {
  var errors = About.validate(req.body);
  if (errors.length) return res.multiError(errors);
  req.body.updated = Date.now();
  About
    .findOne()
    .exec(function (err, about) {
      if (err) return res.internalError();
      if (about) {
        // update
        About
          .findByIdAndUpdate(about._id, req.body)
          .exec(function (err, about) {
            if (err) return res.internalError();
            io.emit('update', about);
            return res.json(about);
          });
      } else {
        // insert
        new About(req.body).save(function (err, about) {
          if (err) return res.internalError();
          io.emit('create', about);
          return res.json(about);
        });
      }
    });
});

/**
* Get the about page
* GET /about
*/
router.get('/about', function (req, res) {
  About
    .findOne()
    .exec(function (err, about) {
      if (err) return res.internalError();
      return res.json(about);
    });
});