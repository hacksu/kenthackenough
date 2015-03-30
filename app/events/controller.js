var router = getRouter();
var socket = rootRequire('app/helpers/socket');
var io = socket('/events');
var Event = require('./model');
var User = rootRequire('app/users/model');

/**
* Add a new event
* POST /events
* Auth -> admin, staff
*/
router.post('/events', User.auth('admin', 'staff'), function (req, res) {
  var errors = Event.validate(req.body);
  if (errors.length) return res.multiError(errors);

  var event = new Event(req.body);
  event.save(function (err, event) {
    if (err) return res.internalError();
    return res.json(event);
  });
});

/**
* Get an event by ID
* GET /events/:id
*/
router.get('/events/:id', function (req, res) {
  Event
    .findById(req.params.id)
    .exec(function (err, event) {
      if (err) return res.internalError();
      return res.json(event);
    });
});

/**
* Get a list of events
* GET /events
*/
router.get('/events', function (req, res) {
  Event
    .find()
    .exec(function (err, events) {
      if (err) return res.internalError();
      return res.json({events: events});
    });
});

/**
* Partially update an event
* PATCH /events/:id
* Auth -> admin, staff
*/
router.patch('/events/:id', User.auth('admin', 'staff'), function (req, res) {
  Event
    .findByIdAndUpdate(req.params.id, req.body)
    .exec(function (err, event) {
      if (err) return res.internalError();
      return res.json(event);
    });
});

/**
* Delete an event
* DELETE /events/:id
* Auth -> admin, staff
*/
router.delete('/events/:id', User.auth('admin', 'staff'), function (req, res) {
  Event
    .findByIdAndRemove(req.params.id)
    .exec(function (err, event) {
      if (err) return res.internalError();
      return res.json({_id: event._id});
    });
});