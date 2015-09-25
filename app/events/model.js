var mongoose = require('mongoose');
var schema = require('validate');
var scheduler = rootRequire('app/helpers/scheduler');

var eventSchema = new mongoose.Schema({
  title: String,
  description: String,
  start: Date,
  end: Date,
  type: String,
  icon: String,
  location: String,
  group: {type: String, enum: ['attendee', 'staff', 'admin'], default: 'attendee'},
  notify: {type: Boolean, default: true}
});

/**
* Schedule a job to notify users of this event if applicable
*/
eventSchema.post('save', function (event) {
  if (event.notify) {
    scheduler.schedule(event.start, 'push notification', {
      title: event.title,
      body: event.description
    });
  }
});

var Event = mongoose.model('Event', eventSchema);

var validate = function (event) {
  var test = schema({
    title: {
      type: 'string',
      required: true,
      message: 'You must provide a name for the event.'
    },
    description: {
      type: 'string',
      message: 'Invalid description'
    },
    start: {
      type: 'date',
      required: true,
      message: 'You must provide a start time.'
    },
    end: {
      type: 'date',
      required: true,
      message: 'You must provide an end time.'
    },
    type: {
      type: 'string',
      message: 'Invalid type'
    },
    icon: {
      type: 'string',
      message: 'Invalid icon'
    },
    location: {
      type: 'string',
      message: 'Invalid location'
    },
    group: {
      type: 'string',
      message: 'Invalid group'
    },
    notify: {
      type: 'boolean',
      message: 'Notify must be true or false'
    }
  }, {typecast: true});
  return test.validate(event);
};

module.exports = Event;
module.exports.validate = validate;