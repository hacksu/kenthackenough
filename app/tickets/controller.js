var router = getRouter();
var Ticket = require('./model');
var User = require('../users/model');

/**
* Get a list of tickets
* AUTH: admin, staff
*/
router.get('/tickets', User.auth('admin', 'staff'), function (req, res) {
  Ticket.find({}, function (err, tickets) {
    if (err) return res.internalError();
    return res.json({tickets: tickets});
  });
});

/**
* Get a ticket by ID
* AUTH: admin, staff
*/
router.get('/tickets/:id', User.auth('admin', 'staff'), function (req, res) {
  Ticket.findById(req.params.id, function (err, ticket) {
    if (err) return res.singleError('A ticket was not found');
    return res.json(ticket);
  });
})

/**
* Create a new ticket
* POST: subject, body, replyTo
*/
router.post('/tickets', function (req, res) {
  var errors = Ticket.validate(req.body);
  if (errors.length) return res.multiError(errors);
  var ticket = new Ticket(req.body);
  ticket.save(function (err, ticket) {
    if (err) return res.internalError();
    return res.json(ticket);
  });
});

/**
* Partially update a ticket by ID
*/
router.patch('/tickets/:id', function (req, res) {
  Ticket.findByIdAndUpdate(req.params.id, {$set: req.body}, function (err, ticket) {
    if (err) return res.singleError('A ticket was not found');
    return res.json(ticket);
  });
});

/**
* Delete a ticket by id
*/
router.delete('/tickets/:id', function (req, res) {
  Ticket
    .findById(req.params.id)
    .remove()
    .exec(function (err) {
      if (err) return res.singleError('A ticket was not found');
      return res.send();
    });
});