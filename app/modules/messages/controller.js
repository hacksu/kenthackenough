var router = getRouter();
var io = getIo();
var Message = require('./model');
var User = require('../users/model');

/**
* Get a list of messages
*/
router.get('/messages', function (req, res) {
  Message.find({}, function (err, messages) {
    if (err) return res.internalError();
    return res.json({messages: messages});
  });
});

/**
* Get a single message
*/
router.get('/messages/:id', function (req, res) {
  Message.findById(req.params.id, function (err, message) {
    if (err) return res.internalError();
    return res.json(message);
  });
});

/**
* Create a new message
*/
router.post('/messages', User.Auth([User.ADMIN, User.STAFF]), function (req, res) {
  var errors = Message.validate(req.body);
  if (errors.length) return res.multiError(errors);
  var message = new Message(req.body);
  message.created = Date.now();
  message.save(function (err, message) {
    if (err) return res.internalError();
    io.emit('POST /messages', message);
    return res.json(message);
  });
});

/**
* Delete a message
*/
router.delete('/messages/:id', User.Auth([User.ADMIN, User.STAFF]), function (req, res) {
  Message.remove({_id: req.params.id}, function (err) {
    if (err) return res.internalError();
    io.emit('DELETE /messages/:id', req.params.id);
    return res.json({});
  });
});