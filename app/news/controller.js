'use strict';

let News = require('./model');
let socket = rootRequire('app/helpers/socket');
let io = socket('/news', ['admin', 'staff']);

module.exports = {

  /**
  * Add an email to the list
  * POST /news
  */
  post: (req, res) => {
    let errors = News.validate(req.body);
    if (errors.length) return res.multiError(errors);

    new News(req.body).save((err, news) => {
      if (err) return res.singleError('That email is already on the list');
      io.emit('create', news);
      return res.json(news);
    });
  },

  /**
  * Get a single email from the list
  * GET /news/:id
  * Auth -> admin, staff
  */
  find: (req, res) => {
    News
      .findById(req.params.id)
      .exec((err, item) => {
        if (err) return res.internalError();
        return res.json(item);
      });
  },

  /**
  * Get a list of emails from the list
  * GET /news
  * Auth -> admin, staff
  */
  get: (req, res) => {
    News
      .find()
      .exec((err, items) => {
        if (err) return res.internalError();
        return res.json({news: items});
      });
  },

  /**
  * Delete an email from the list
  * DELETE /news/:id
  * Auth -> admin, staff
  */
  delete: (req, res) => {
    News
      .findByIdAndRemove(req.params.id)
      .select('_id')
      .exec((err, item) => {
        if (err) return res.internalError();
        io.emit('delete', item);
        return res.json(item);
      });
  }

};
