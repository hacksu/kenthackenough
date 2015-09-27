'use strict';

var router = getRouter();
var socket = rootRequire('app/helpers/socket');
var io = socket('/urls', ['admin', 'staff']);
var User = require('../users/model');
var Url = require('./model');

/**
* Create a new shortened URL
* POST /urls
* Auth -> admin, staff
*/
router.post('/urls', User.auth('admin', 'staff'), function (req, res) {
  var errors = Url.validate(req.body);
  if (errors.length) return res.multiError(errors);
  var url = new Url(req.body);
  url.save(function (err, url) {
    if (err) return res.singleError('The URL must be unique');
    io.emit('create', url);
    return res.json(url);
  });
});

/**
* Resolve a shortened URL
* GET /urls/go/:short
*/
router.get('/urls/go/:url', function (req, res) {
  Url
    .findOne({short: req.params.url})
    .exec(function (err, url) {
      if (err) return res.status(404).send();
      return res.redirect(url.full);
    });
});

/**
* Get a single URL
* GET /urls/:id
* Auth -> admin, staff
*/
router.get('/urls/:id', function (req, res) {
  Url
    .findById(req.params.id)
    .exec(function (err, url) {
      if (err) return res.internalError();
      return res.json(url);
    });
});

/**
* Get a list of URLs
* GET /urls
* Auth -> admin, staff
*/
router.get('/urls', User.auth('admin', 'staff'), function (req, res) {
  Url
    .find()
    .exec(function (err, urls) {
      if (err) return res.internalError();
      return res.json({urls: urls});
    });
});

/**
* Delete a URL
* DELETE /urls/:id
* Auth -> admin, staff
*/
router.delete('/urls/:id', User.auth('admin', 'staff'), function (req, res) {
  Url
    .findByIdAndRemove(req.params.id)
    .exec(function (err, url) {
      if (err) return res.internalError();
      var response = {
        _id: url._id
      };
      io.emit('delete', response);
      return res.json(response);
    });
});