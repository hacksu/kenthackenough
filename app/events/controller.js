'use strict';

let Event = require('./model');
let push = rootRequire('app/helpers/push')('/events');
let io = rootRequire('app/helpers/socket')('/events');
let config = rootRequire('config/config');
let url = require('url');
let log = rootRequire('app/helpers/logger');

module.exports = {

  /**
  * Add a new event
  * POST /events
  * Auth -> admin, staff
  */
  post: (req, res) => {
    let errors = Event.validate(req.body);
    if (errors.length) return res.multiError(errors, 400);

    let event = new Event(req.body);
    event.save((err, event) => {
      if (err) return res.internalError();
      io.emit('create', event);
      push.send('create', event);
      return res.status(201).json(event);
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
        return res.status(200).json(event);
      });
  },

  /**
  * Get a list of events
  * GET /events
  */
  get: (req, res) => {
    Event
      .find()
      .sort({start: 1})
      .exec((err, events) => {
        if (err) return res.internalError();
        if (req.query && req.query.icons) events = bootstrapIcons(events);
        return res.status(200).json({events});
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
        push.send('update', event);
        return res.status(200).json(event);
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
        push.send('delete', response);
        return res.status(200).json(response);
      });
  }

};

/**
* Generate full URLs for event icons to use
* @param events: [Event]
*/
function bootstrapIcons(events) {
  let base = url.resolve(config.base, config.prefix + '/resources/icon');
  return events.map((event) => {
    if (!event.icon) return event;
    event._doc.iconUrls = {
      small: {
        white: `${base}?color=white&format=png&size=32&name=${event.icon}`,
        black: `${base}?color=black&format=png&size=32&name=${event.icon}`,
        red: `${base}?color=red&format=png&size=32&name=${event.icon}`
      },
      medium: {
        white: `${base}?color=white&format=png&size=64&name=${event.icon}`,
        black: `${base}?color=black&format=png&size=64&name=${event.icon}`,
        red: `${base}?color=red&format=png&size=64&name=${event.icon}`
      },
      large: {
        white: `${base}?color=white&format=png&size=128&name=${event.icon}`,
        black: `${base}?color=black&format=png&size=128&name=${event.icon}`,
        red: `${base}?color=red&format=png&size=128&name=${event.icon}`
      }
    };
    return event;
  });
}