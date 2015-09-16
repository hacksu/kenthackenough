var router = getRouter();
var socket = rootRequire('app/helpers/socket');
var io = socket('/messages');
var Message = require('./model');
var User = require('../users/model');
var Device = require('../devices/model');

/**
* Create a new message
* POST /messages
* Auth -> admin, staff
*/
router.post('/messages', User.auth('admin', 'staff'), function (req, res) {
  var errors = Message.validate(req.body);
  if (errors.length) return res.multiError(errors);
  var message = new Message(req.body);
  message.save(function (err, message) {
    if (err) return res.internalError();
    io.emit('create', message);
    Device.push('Kent Hack Enough', message.text);
    return res.json(message);
  });
});

/**
* Get a list of messages
* GET /messages
*/
router.get('/messages', function (req, res) {
  Message
    .find()
    .exec(function (err, messages) {
      if (err) return res.internalError();
      return res.json({messages: messages});
    });
});

/**
* Get a single message
* GET /messages/:id
*/
router.get('/messages/:id', function (req, res) {
  Message
    .findById(req.params.id)
    .exec(function (err, message) {
      if (err) return res.internalError();
      return res.json(message);
    });
});

/**
* Update a message
* PATCH /messages/:id
* Auth -> admin, staff
*/
router.patch('/messages/:id', User.auth('admin', 'staff'), function (req, res) {
  var errors = Message.validate(req.body);
  if (errors.length) return res.multiError(errors);
  Message
    .findByIdAndUpdate(req.params.id, req.body)
    .exec(function (err, message) {
      if (err) return res.internalError();
      io.emit('update', message);
      return res.json(message);
    });
});

/**
* Delete a message
* DELETE /messages/:id
* Auth -> admin, staff
*/
router.delete('/messages/:id', User.auth('admin', 'staff'), function (req, res) {
  Message
    .findByIdAndRemove(req.params.id)
    .exec(function (err, message) {
      if (err) return res.internalError();
      var response = {
        _id: message._id
      };
      io.emit('delete', response);
      return res.json(response);
    });
});