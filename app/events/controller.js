'use strict';

let Event = require('./model');
let socket = rootRequire('app/helpers/socket');
let io = socket('/events');

module.exports = {

  /**
  * Add a new event
  * POST /events
  * Auth -> admin, staff
  */
  post: (req, res) => {
    let errors = Event.validate(req.body);
    if (errors.length) return res.multiError(errors);

    let event = new Event(req.body);
    event.save((err, event) => {
      if (err) return res.internalError();
      io.emit('create', event);
      return res.json(event);
    });
  },

  /**
  * Get an event by ID
  * GET /events/:id
  */
  find: (req, res) => {
    Event
      .findById(req.params.id)
      .exec((err, event) => {
        if (err) return res.internalError();
        return res.json(event);
      });
  },

  /**
  * Get a list of events
  * GET /events
  */
  get: (req, res) => {
    Event
      .find()
      .exec((err, events) => {
        if (err) return res.internalError();
        return res.json({events: events});
      });
  },

  /**
  * Partially update an event
  * PATCH /events/:id
  * Auth -> admin, staff
  */
  patch: (req, res) => {
    Event
      .findByIdAndUpdate(req.params.id, req.body, {new: true})
      .exec((err, event) => {
        if (err) return res.internalError();
        io.emit('update', event);
        return res.json(event);
      });
  },

  /**
  * Delete an event
  * DELETE /events/:id
  * Auth -> admin, staff
  */
  delete: (req, res) => {
    Event
      .findByIdAndRemove(req.params.id)
      .exec((err, event) => {
        if (err) return res.internalError();
        let response = {_id: event._id};
        io.emit('delete', response);
        return res.json(response);
      });
  }

};
