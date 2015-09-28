'use strict';

let About = require('./model');
let socket = rootRequire('app/helpers/socket');
let io = socket('/about');

module.exports = {

  /**
  * Create or update the about page
  * PUT /about
  * Auth -> admin, staff
  */
  put: (req, res) => {
    let errors = About.validate(req.body);
    if (errors.length) return res.multiError(errors, 400);
    req.body.updated = Date.now();

    About
      .findOne()
      .exec((err, about) => {
        if (err) return res.internalError();
        if (about) {
          // update
          About
            .findByIdAndUpdate(about._id, req.body)
            .exec((err, about) => {
              if (err) return res.internalError();
              io.emit('update', about);
              return res.status(200).json(about);
            });
        } else {
          // insert
          new About(req.body).save((err, about) => {
            if (err) return res.internalError();
            io.emit('create', about);
            return res.status(200).json(about);
          });
        }
      });

  },

  /**
  * Get the about page
  * GET /about
  */
  get: (req, res) => {
    About
      .findOne()
      .exec((err, about) => {
        if (err) return res.internalError();
        return res.status(200).json(about);
      });
  }

};