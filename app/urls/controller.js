'use strict';

let Url = require('./model');
let socket = rootRequire('app/helpers/socket');
let io = socket('/urls', ['admin', 'staff']);

module.exports = {

  /**
  * Create a new shortened URL
  * POST /urls
  * Auth -> admin, staff
  */
  post: (req, res) => {
    let errors = Url.validate(req.body);
    if (errors.length) return res.multiError(errors, 400);

    new Url(req.body).save((err, url) => {
      if (err) return res.singleError('The URL must be unique', 409);
      io.emit('create', url);
      return res.status(201).json(url);
    });
  },

  /**
  * Resolve a shortened URL
  * GET /urls/go/:short
  */
  resolve: (req, res) => {
    Url
      .findOne({short: req.params.url})
      .exec((err, url) => {
        if (err) return res.status(404).send();
        return res.redirect(url.full);
      });
  },

  /**
  * Get a single URL
  * GET /urls/:id
  * Auth -> admin, staff
  */
  find: (req, res) => {
    Url
      .findById(req.params.id)
      .exec((err, url) => {
        if (err) return res.internalError();
        return res.status(200).json(url);
      });
  },

  /**
  * Get a list of URLs
  * GET /urls
  * Auth -> admin, staff
  */
  get: (req, res) => {
    Url
      .find()
      .exec((err, urls) => {
        if (err) return res.internalError();
        return res.status(200).json({urls: urls});
      });
  },

  /**
  * Delete a URL
  * DELETE /urls/:id
  * Auth -> admin, staff
  */
  delete: (req, res) => {
    Url
      .findByIdAndRemove(req.params.id)
      .exec((err, url) => {
        if (err) return res.internalError();
        let response = {
          _id: url._id
        };
        io.emit('delete', response);
        return res.status(200).json(response);
      });
  }

};