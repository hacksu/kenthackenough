'use strict';

let Ticket = require('./model');
let socket = rootRequire('app/helpers/socket');
let io = socket('/tickets', ['admin', 'staff']);

module.exports = {

  /**
  * Create a new ticket
  * POST /tickets
  */
  post: (req, res) => {
    let errors = Ticket.validate(req.body);
    if (errors.length) return res.multiError(errors, 400);

    new Ticket(req.body).save((err, ticket) => {
      if (err) return res.internalError();
      io.emit('create', ticket);
      return res.status(201).json(ticket);
    });
  },

  /**
  * Get a list of tickets
  * GET /tickets
  * Auth -> admin, staff
  */
  find: (req, res) => {
    Ticket
      .findById(req.params.id)
      .exec((err, ticket) => {
        if (err) return res.internalError();
        return res.status(200).json(ticket);
      });
  },

  /**
  * Get a ticket by ID
  * GET /tickets/:id
  * Auth -> admin, staff
  */
  get: (req, res) => {
    Ticket
      .find()
      .exec((err, tickets) => {
        if (err) return res.internalError();
        return res.status(200).json({tickets: tickets});
      });
  },

  /**
  * Partially update a ticket
  * PATCH /tickets/:id
  * Auth -> admin, staff
  */
  patch: (req, res) => {
    if (req.user && req.user.email) req.body.worker = req.user.email;
    Ticket
      .findByIdAndUpdate(req.params.id, req.body, {new: true})
      .exec((err, ticket) => {
        if (err) return res.internalError();
        io.emit('update', ticket);
        return res.status(200).json(ticket);
      });
  },

  /**
  * Delete a ticket
  * Auth -> admin, staff
  */
  delete: (req, res) => {
    Ticket
      .findByIdAndRemove(req.params.id)
      .exec((err, ticket) => {
        if (err) return res.internalError();
        let response = {
          _id: ticket._id
        };
        io.emit('delete', response);
        return res.status(200).json(response);
      });
  }

};
